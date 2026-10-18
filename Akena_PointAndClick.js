//=============================================================================
// Akena_PointAndClick.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc CG 조사 영역에 강조 그림을 표시하고 맵 이벤트 실행 <Akena_PointAndClick>
 * @author Akena
 *
 * @help
 * Akena_PointAndClick — 포인트 앤 클릭
 *
 * [사용법]
 * 1. 강조 이미지에서 투명 PNG 한 장을 지정합니다.
 * 2. 맵 메모에 <area>를 적습니다.
 * 3. 조사할 이벤트의 현재 페이지에 '주석'으로 아래처럼 적습니다.
 *    <area: 340,330,250,80>
 *    순서: 화면 왼쪽 X, 위쪽 Y, 너비, 높이(게임 화면 픽셀).
 * 4. 같은 페이지에 대사·아이템 지급 등 일반 이벤트 명령을 작성합니다.
 *    트리거는 '결정 버튼', 이벤트 이미지는 없음으로 사용하세요.
 * 5. 완료 시 셀프 스위치 A를 켜고 2페이지 조건을 A로 지정합니다.
 *    2페이지에서 area 주석을 빼면 강조·클릭이 자동으로 꺼집니다.
 *
 * [동작]
 * - 공통 조사 그림 한 장을 대상 중앙에 고정 크기로 표시합니다.
 * - 이동 버튼이나 이동 UI는 만들지 않습니다. 조사 결과로 장소 이동을
 *   실행하려면 해당 이벤트 안에 일반 장소 이동 명령을 작성하세요.
 * - 마우스를 올리면 표시, 벗어나면 숨김. 별도 연출은 없습니다.
 * - 클릭하면 해당 맵 이벤트를 한 번 시작합니다. 이벤트 실행·대화·
 *   화면 전환 중에는 조사하지 않습니다. 클릭을 놓아야 다시 입력됩니다.
 * - 겹친 영역은 이벤트 ID가 큰 대상 하나를 우선합니다.
 * - 완료 상태는 기존 셀프 스위치/페이지로 관리합니다. 대상 ID 등록,
 *   별도 완료 저장소, 플러그인 명령은 필요하지 않습니다.
 *
 * [주의]
 * - 지정 맵에서는 캐릭터 이동과 맵 클릭 이동을 차단합니다.
 *   캐릭터 숨김·배경 그림 표시·메뉴 허용 여부는 기존 이벤트로 설정합니다.
 * - 조사 좌표는 화면 기준이며 카메라/그림 확대·이동을 따라가지 않습니다.
 * - 터치로 클릭은 가능하지만 마우스 오버는 PC 마우스 기준입니다.
 * - 강조 이미지를 비우면 그림은 표시하지 않고 클릭만 처리합니다.
 * - Scene_Map.update/createDisplayObjects, Game_Player.canMove를 확장합니다.
 *   같은 입력·씬·캐릭터 이동을 바꾸는 플러그인은 별도 호환 검수가 필요합니다.
 * - 코어 수정·외부 라이브러리가 없으며 이 JS 한 파일로 동작합니다.
 *
 * @param HighlightImage
 * @text 강조 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @desc 공통 투명 PNG. 조사 영역 중앙에 원본 비율을 유지해 표시합니다.
 *
 * @param HighlightSize
 * @text 조사 표식 크기
 * @type number
 * @min 16
 * @max 128
 * @default 48
 * @desc 조사 표식의 최대 가로/세로 픽셀. 클릭 영역 크기와 독립적입니다.
 */

(() => {
    "use strict";
    window.Akena = window.Akena || {};
    const api = window.Akena.PointAndClick = {};
    const params = PluginManager.parameters("Akena_PointAndClick");
    const imageName = String(params.HighlightImage || "");
    const markerSize = Math.max(16, Math.min(128, Number(params.HighlightSize) || 48));
    const pageCache = new WeakMap();
    let pointerInside = false;

    // 화면 밖/포커스 이탈 시 마지막 마우스 좌표로 강조가 남지 않게 한다.
    document.addEventListener("mousemove", event => {
        const x = Graphics.pageToCanvasX(event.pageX);
        const y = Graphics.pageToCanvasY(event.pageY);
        pointerInside = Graphics.isInsideCanvas(x, y);
    });
    document.addEventListener("mouseout", event => {
        if (!event.relatedTarget) pointerInside = false;
    });
    window.addEventListener("blur", () => { pointerInside = false; });

    api.isPointClickMap = () => !!($dataMap && $dataMap.meta["area"]);

    // 현재 페이지만 읽고, 페이지가 바뀌면 캐시도 갱신한다.
    api.regionFor = event => {
        const page = event.page();
        const cached = pageCache.get(event);
        if (cached && cached.page === page) return cached.region;
        const comments = page ? page.list.filter(c => c.code === 108 || c.code === 408)
            .map(c => c.parameters[0]).join("\n") : "";
        const match = comments.match(/<area\s*:\s*([^>]+)>/);
        const values = match ? match[1].split(",").map(v => Number(v.trim())) : [];
        const valid = values.length === 4 && values.every(Number.isFinite) &&
            values[2] > 0 && values[3] > 0;
        const region = valid ? {
            x: values[0], y: values[1], width: values[2], height: values[3]
        } : null;
        pageCache.set(event, { page, region });
        return region;
    };

    const originalCanMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        const result = originalCanMove.call(this);
        return result && !api.isPointClickMap();
    };

    const originalCreate = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        originalCreate.call(this);
        const sprite = new Sprite(imageName ? ImageManager.loadPicture(imageName) : null);
        sprite.anchor.set(0.5);
        sprite.visible = false;
        this._akenaPointAndClick = { sprite, waitRelease: true };
        // 배경 위, 대화창 아래에 표시한다.
        this.addChildAt(sprite, this.children.indexOf(this._windowLayer));
    };

    function contains(r, x, y) {
        return x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height;
    }

    function blocked(scene) {
        return !scene.isActive() || scene.isBusy() || SceneManager.isSceneChanging() ||
            $gamePlayer.isTransferring() || $gameMap.isEventRunning() || $gameMessage.isBusy();
    }

    const originalUpdate = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        // 대화를 닫은 클릭이 같은 프레임에 새 조사로 전달되지 않게 한다.
        const wasBlocked = blocked(this);
        originalUpdate.call(this);
        const state = this._akenaPointAndClick;
        if (!state) return;
        state.sprite.visible = false;
        if (!TouchInput.isPressed()) state.waitRelease = false;
        if (!api.isPointClickMap() || wasBlocked || blocked(this)) {
            if (TouchInput.isPressed()) state.waitRelease = true;
            return;
        }
        const x = TouchInput.x;
        const y = TouchInput.y;
        const events = $gameMap.events();
        // 뒤에 등록된 이벤트를 먼저 확인해 중첩 영역도 하나만 반응시킨다.
        const target = events.slice().reverse().find(event => {
            const r = api.regionFor(event);
            return r && contains(r, x, y);
        });
        if (!target) return;
        const r = api.regionFor(target);
        const sprite = state.sprite;
        if (pointerInside && sprite.bitmap && sprite.bitmap.isReady()) {
            sprite.x = r.x + r.width / 2;
            sprite.y = r.y + r.height / 2;
            const scale = markerSize / Math.max(sprite.bitmap.width, sprite.bitmap.height);
            sprite.scale.set(scale, scale);
            sprite.visible = true;
        }
        if (TouchInput.isTriggered() && !state.waitRelease) {
            state.waitRelease = true;
            sprite.visible = false;
            target.start();
        }
    };
})();
