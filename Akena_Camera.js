//=============================================================================
// Akena_Camera.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 기본·부드러운 추적·항상 중앙을 선택하는 카메라 <Akena_Camera>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_Camera - 카메라 모드
 * ============================================================
 * [사용법]
 * 1. 플러그인 관리자에 추가하고 ON으로 설정합니다.
 * 2. 시작 모드에서 기본·부드러운·항상 중앙 중 하나를 선택합니다.
 * 3. 이벤트에서는 '카메라 모드 설정' 명령으로 선택할 수 있습니다.
 *
 * [추적 원리]
 * 추적률은 '부드러운 추적' 모드에서만 적용됩니다.
 * '기본 카메라'와 '항상 중앙' 모드에서는 추적률을 사용하지 않습니다.
 * 플레이어 중심의 목표 위치를 맵 경계 안으로 제한한 뒤,
 * 매 게임 갱신마다 남은 거리의 추적률(기본 15%)만큼 이동합니다.
 * 이동 중 플레이어가 조금 앞서고, 정지하면 카메라가 따라잡습니다.
 * 남은 거리가 0.25픽셀 이하면 목표에 맞춰 잔여 이동을 끝냅니다.
 * 추적률이 높을수록 빠르게 따라갑니다. 100%는 지연이 없습니다.
 *
 * [비교 / 상태]
 * - 기본 모드로 바꾸면 경계 안의 플레이어 중심 위치로 즉시 맞춥니다.
 *   전환 때의 한 번의 위치 보정은 비교를 위한 의도된 동작입니다.
 * - 부드러운 모드로 바꾸면 현재 카메라 위치에서 추적을 시작합니다.
 * - 모드는 임시 상태입니다. 맵 이동·메뉴 복귀 시 유지하며,
 *   새 게임·저장 불러오기 시 '시작 모드'로 돌아갑니다.
 * - 상태 확인(스크립트):
 *   Akena.Camera.getMode() // "default", "smooth", "center"
 *
 * [적용 범위 / 주의사항]
 * - 코어의 맵 경계·작은 맵 배치·맵 이동 직후 위치 맞춤을 유지합니다.
 * - 루프 맵은 이음새를 가로지르는 짧은 방향으로 추적합니다.
 * - 부드러운 모드는 이벤트 실행·'화면 스크롤' 중 기본 추적으로 양보합니다.
 *   끝나면 부드러운 추적이 재개됩니다. 컷신 카메라는 지원하지 않습니다.
 * - 항상 중앙 모드는 지연 없이 추적하고 맵 밖 배경을 검게 표시합니다.
 *   가장자리·작은 맵에서도 중앙을 유지합니다. 루프 축은 검게 가리지 않습니다.
 *   중앙은 코어의 이동 타일 기준이며 점프·이미지 위치 차이는 유지합니다.
 * - 항상 중앙은 이벤트 스크롤보다 우선합니다. 연출 시 기본으로 바꾸세요.
 * - 항상 중앙에서 다른 모드로 바꾸면 경계 안의 위치로 즉시 복원합니다.
 * - 검정 영역은 타일·패럴랙스 위, 캐릭터 아래이며 UI·날씨는 유지합니다.
 * - 줌·컷신 확장·이동 속도 변경은 없습니다.
 * - 기존 Akena_SmoothCamera·Akena_CenterCamera와 다른 카메라는 OFF로
 *   설정하고 이 플러그인만 ON으로 사용하세요.
 * - Game_Map.setDisplayPos, Spriteset_Map.createTilemap / updateTilemap,
 *   Game_Player.updateScroll을 별칭 호출합니다. 부드러운 모드에서는
 *   현재 스크롤 좌표를 원본 인자로 전달해 기본 이동분을 억제한 뒤,
 *   Game_Map의 방향별 스크롤 함수로 추적량을 적용합니다.
 *   같은 추적·스크롤 함수를 변경하는 다른 카메라 플러그인과 충돌할 수
 *   있으므로 단독 사용하세요. 원본 메서드의 반환값은 유지합니다.
 * - 파일명은 Akena_Camera.js를 유지하세요.
 *
 * @param StartMode
 * @text 시작 모드
 * @type select
 * @option 기본 카메라
 * @value default
 * @option 부드러운 추적
 * @value smooth
 * @option 항상 중앙
 * @value center
 * @default default
 * @desc 새 게임과 저장 불러오기 후 적용할 모드입니다.
 *
 * @param FollowRate
 * @text 추적률(%)
 * @type number
 * @min 5
 * @max 100
 * @decimals 0
 * @default 15
 * @desc 부드러운 추적 모드 전용입니다. 낮을수록 지연이 큽니다. 기본·항상 중앙 모드에는 영향이 없습니다.
 *
 * @command SetMode
 * @text 카메라 모드 설정
 * @desc 세 모드 중 하나를 선택합니다. 대기 없이 다음 명령으로 진행합니다.
 *
 * @arg Mode
 * @text 모드
 * @type select
 * @option 기본 카메라
 * @value default
 * @option 부드러운 추적
 * @value smooth
 * @option 항상 중앙
 * @value center
 * @default default
 */

(() => {
    "use strict";

    const pluginName = "Akena_Camera";
    const params = PluginManager.parameters(pluginName);
    const modes = ["default", "smooth", "center"];
    const startMode = modes.includes(params.StartMode) ? params.StartMode : "default";
    const rate = Number(params.FollowRate || 15);
    const followRate = Number.isFinite(rate) ? Math.min(100, Math.max(5, rate)) / 100 : 0.15;
    window.Akena = window.Akena || {};
    const camera = window.Akena.Camera = {};

    // 카메라 선택은 세이브에 넣지 않고 새 게임·불러오기 때 초기 설정으로 돌아갑니다.
    function state() {
        const root = $gameTemp._Akena = $gameTemp._Akena || {};
        return root.Camera = root.Camera || { mode: startMode, snap: false };
    }
    camera.getMode = () => state().mode;
    camera.setMode = mode => {
        if (!modes.includes(mode)) return;
        const current = state();
        if (current.mode !== mode) {
            current.snap = mode === "default" || (current.mode === "center" && mode === "smooth");
            current.mode = mode;
        }
    };
    PluginManager.registerCommand(pluginName, "SetMode", args => camera.setMode(args.Mode));

    // 맵 이동 직후의 center 호출에도 경계 없는 표시 위치를 적용합니다.
    const _Game_Map_setDisplayPos = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function(x, y) {
        const result = _Game_Map_setDisplayPos.call(this, x, y);
        if (camera.getMode() === "center") {
            if (!this.isLoopHorizontal()) this._displayX = this._parallaxX = x;
            if (!this.isLoopVertical()) this._displayY = this._parallaxY = y;
        }
        return result;
    };

    // 프레임 이동량만 패럴랙스에 더해 자체 스크롤의 누적값을 유지합니다.
    function center(player) {
        const map = $gameMap;
        const x = map.roundX(player._realX - player.centerX());
        const y = map.roundY(player._realY - player.centerY());
        const dx = map.deltaX(x, map.displayX());
        const dy = map.deltaY(y, map.displayY());
        map._displayX = x;
        map._displayY = y;
        if (!map.isLoopHorizontal() || map._parallaxLoopX) map._parallaxX += dx;
        if (!map.isLoopVertical() || map._parallaxLoopY) map._parallaxY += dy;
    }

    // 경계 제한은 목표에도 적용해야 맵 가장자리에서 불필요한 지연이 생기지 않습니다.
    function targetAxis(position, center, size, screenSize, loop) {
        const target = position - center;
        if (loop) return target.mod(size);
        const end = size - screenSize;
        return end < 0 ? end / 2 : target.clamp(0, end);
    }

    function step(distance, tileSize, ratio) {
        return Math.abs(distance * tileSize) <= 0.25 ? distance : distance * ratio;
    }

    // setDisplayPos를 반복 호출하지 않아 패럴랙스의 자체 이동 누적값을 보존합니다.
    function follow(player, ratio) {
        const map = $gameMap;
        const x = targetAxis(player._realX, player.centerX(), map.width(), map.screenTileX(), map.isLoopHorizontal());
        const y = targetAxis(player._realY, player.centerY(), map.height(), map.screenTileY(), map.isLoopVertical());
        const dx = step(map.deltaX(x, map.displayX()), map.tileWidth(), ratio);
        const dy = step(map.deltaY(y, map.displayY()), map.tileHeight(), ratio);
        if (dx > 0) map.scrollRight(dx);
        if (dx < 0) map.scrollLeft(-dx);
        if (dy > 0) map.scrollDown(dy);
        if (dy < 0) map.scrollUp(-dy);
    }

    const _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        const current = state();
        const busy = $gameMap.isScrolling() || $gameMap.isEventRunning();
        if (current.mode !== "center" && !current.snap && (current.mode === "default" || busy)) {
            return _Game_Player_updateScroll.call(this, lastScrolledX, lastScrolledY);
        }
        // 기본 이동분을 억제하고 선택한 모드 하나만 적용합니다.
        const result = _Game_Player_updateScroll.call(this, this.scrolledX(), this.scrolledY());
        if (current.mode === "center") center(this);
        else {
            if (current.snap) this.center(this._realX, this._realY);
            if (current.mode === "smooth" && !busy) follow(this, followRate);
        }
        current.snap = false;
        return result;
    };

    // 맵 밖만 검게 덮습니다. z=0.5는 하층 타일 위, 모든 캐릭터 아래입니다.
    const _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function(...args) {
        const result = _Spriteset_Map_createTilemap.call(this, ...args);
        this._AkenaCenterBlack = new PIXI.Graphics();
        this._AkenaCenterBlack.z = 0.5;
        this._tilemap.addChild(this._AkenaCenterBlack);
        return result;
    };

    const _Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function(...args) {
        const result = _Spriteset_Map_updateTilemap.call(this, ...args);
        const black = this._AkenaCenterBlack;
        black.visible = camera.getMode() === "center";
        if (!black.visible) return result;
        const map = $gameMap;
        const w = Graphics.width;
        const h = Graphics.height;
        // Tilemap 자체가 origin을 올림하므로 동일하게 맞춰 경계의 1px 틈을 막습니다.
        const ox = Math.ceil(this._tilemap.origin.x);
        const oy = Math.ceil(this._tilemap.origin.y);
        const left = map.isLoopHorizontal() ? 0 : (-ox).clamp(0, w);
        const right = map.isLoopHorizontal() ? w : (map.width() * map.tileWidth() - ox).clamp(0, w);
        const top = map.isLoopVertical() ? 0 : (-oy).clamp(0, h);
        const bottom = map.isLoopVertical() ? h : (map.height() * map.tileHeight() - oy).clamp(0, h);
        black.clear();
        black.beginFill(0x000000, 1);
        if (left > 0) black.drawRect(0, 0, left, h);
        if (right < w) black.drawRect(right, 0, w - right, h);
        if (top > 0) black.drawRect(left, 0, right - left, top);
        if (bottom < h) black.drawRect(left, bottom, right - left, h - bottom);
        black.endFill();
        return result;
    };
})();
