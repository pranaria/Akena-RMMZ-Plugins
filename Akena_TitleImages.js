//=============================================================================
// Akena_TitleImages.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 이미지·메뉴 표시·이동 효과음을 설정하는 타이틀 <Akena_TitleImages>
 * @author Akena
 * @help
 * Akena_TitleImages — MZ 전용 이미지 타이틀
 * 1. 이 플러그인을 추가하고 ON으로 설정합니다. 파일명은 유지하세요.
 * 2. 배경 PNG는 img/titles1, 로고·버튼 PNG는 img/pictures에 넣으세요.
 *    각 표준 폴더 안의 Akena_TitleImages 하위 폴더로 묶어 관리할 수 있습니다.
 *    빈 설정은 기존 프로젝트 배경·제목 또는 기본 텍스트 버튼을 사용합니다.
 * 3. 준비된 이미지: Akena_TitleImages/StarlitBackground, StarlitLogo,
 *    NewGame, Continue, Options, Exit 및 각 버튼 뒤 _Selected 이미지.
 *    예시는 별도 리소스입니다. 기본 이미지 설정은 모두 비어 있습니다.
 * 4. 기본 기준 816×624, 로고 600×160, 버튼 320×64, 간격 12.
 *    좌표는 기준 화면의 좌표입니다. 로고 X/Y는 중심, 메뉴 X는 중심,
 *    메뉴 Y는 세 버튼일 때 첫 버튼 상단입니다. 표시 개수에 따라 위쪽으로
 *    추가하거나 아래로 줄여 마지막 버튼 하단을 유지합니다. 투명 여백도 클릭 영역.
 * 5. 다른 화면 크기에서는 기준 화면을 contain 방식으로 균등 배율 적용,
 *    남는 공간을 중앙 정렬합니다. 배경은 cover(잘림) 또는 contain(여백).
 *    로고는 지정 사각형 안에 비율 유지, 버튼은 지정 크기로 늘립니다.
 *    기본/선택 이미지는 같은 캔버스 크기와 투명 여백을 권장합니다.
 * 6. 방향키(위/아래/좌/우), 확인키, 마우스 이동 및 한 번 클릭 지원.
 *    저장 없음: 이어하기 흐림+× 표시, 실행 시 코어 실행 불가 효과음.
 * 7. BGM은 데이터베이스의 타이틀 BGM을 그대로 사용합니다.
 *    이동 효과음 ON: 미지정 시 시스템 커서 소리, 지정 시 선택 SE 사용.
 *    확인/비활성 소리는 시스템 설정 사용. 잘못된 SE는 코어 로딩 오류가
 *    날 수 있으므로 파일을 확인하세요. 사운드 파일은 audio/se에 둡니다.
 * 8. 효과 OFF는 추가 등장/강조를 끕니다. 선택 윤곽과 코어 씬 페이드는 유지.
 *    등장·씬 페이드 중 입력 무시, 확인/마우스를 놓은 뒤 조작 시작.
 * 9. 지정한 이미지의 오류/약 10초(600프레임) 로딩 지연은 해당 요소만
 *    기본 표시로 복구합니다. 안내와 F8 경고를 확인하고 설정을 수정하세요.
 *    기본 프로젝트 리소스 누락, 암호화 배포와 모든 타 플러그인 호환은
 *    보장하지 않습니다. 암호화/배포 환경은 별도 인게임 검증 필요.
 * 10. 이전 타이틀 플러그인은 OFF로 바꾸세요. Scene_Title 생성/갱신을
 *     수정하는 플러그인과 충돌할 수 있습니다. 임의 추가 메뉴는 지원하지 않습니다.
 *     새 게임은 항상 표시, 이어하기·옵션·종료는 표시 여부 선택 가능.
 *     종료는 실행 파일로 실행하는 독립 실행형(NW.js)에서만 표시하며
 *     MZ 코어 종료를 호출합니다. PC에서 실행해도 웹 브라우저에서는 숨깁니다.
 *     브라우저에서는 종료를 자동 숨깁니다. 종료 확인창은 없습니다.
 *     원본 창은 숨기고 비활성화하며, 표시한 명령만 이미지로 조작합니다.
 *     새 게임/로드/옵션 핸들러와 Window_TitleCommand.processOk는 코어 사용.
 *
 * @param TitleBackground
 * @text 타이틀 배경 이미지
 * @type file
 * @dir img/titles1
 * @default
 * @param Logo
 * @text 로고 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param NewGame
 * @text 새 게임 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param NewGameSelected
 * @text 새 게임 선택 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param Continue
 * @text 이어하기 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param ContinueSelected
 * @text 이어하기 선택 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param Options
 * @text 옵션 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param OptionsSelected
 * @text 옵션 선택 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param Exit
 * @text 게임 종료 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param ExitSelected
 * @text 게임 종료 선택 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @param ShowContinue
 * @text 이어하기 표시
 * @type boolean
 * @default true
 * @param ShowOptions
 * @text 옵션 표시
 * @type boolean
 * @default true
 * @param ShowExit
 * @text 게임 종료 표시 (독립 실행형)
 * @type boolean
 * @default true
 * @desc 실행 파일로 실행하는 게임(NW.js)에서만 표시합니다. 웹 브라우저에서는 숨깁니다.
 * @param CursorSoundEnabled
 * @text 메뉴 이동 효과음 사용
 * @type boolean
 * @default true
 * @param CursorSound
 * @text 메뉴 이동 효과음
 * @type file
 * @dir audio/se
 * @default
 * @desc 비우면 데이터베이스 시스템의 커서 효과음을 사용합니다.
 * @param CursorVolume
 * @text 이동 효과음 음량
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * @param CursorPitch
 * @text 이동 효과음 피치
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * @param CursorPan
 * @text 이동 효과음 좌우
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @param ReferenceWidth
 * @text 기준 화면 너비
 * @type number
 * @min 1
 * @default 816
 * @param ReferenceHeight
 * @text 기준 화면 높이
 * @type number
 * @min 1
 * @default 624
 * @param BackgroundMode
 * @text 배경 확대 방식
 * @type select
 * @option 채우기 (가장자리 잘림)
 * @value cover
 * @option 전체 표시 (여백)
 * @value contain
 * @default cover
 * @param LogoX
 * @text 로고 중심 X
 * @type number
 * @min -10000
 * @default 408
 * @param LogoY
 * @text 로고 중심 Y
 * @type number
 * @min -10000
 * @default 144
 * @param LogoWidth
 * @text 로고 최대 너비
 * @type number
 * @min 1
 * @default 600
 * @param LogoHeight
 * @text 로고 최대 높이
 * @type number
 * @min 1
 * @default 160
 * @param MenuX
 * @text 메뉴 중심 X
 * @type number
 * @min -10000
 * @default 408
 * @param MenuY
 * @text 메뉴 세로 위치 (세 버튼 기준)
 * @desc 세 버튼일 때 첫 버튼 상단입니다. 메뉴 수가 바뀌면 하단을 유지하며 자동 정렬합니다.
 * @type number
 * @min -10000
 * @default 356
 * @param ButtonWidth
 * @text 버튼 너비
 * @type number
 * @min 1
 * @default 320
 * @param ButtonHeight
 * @text 버튼 높이
 * @type number
 * @min 1
 * @default 64
 * @param ButtonGap
 * @text 버튼 간격
 * @type number
 * @min 0
 * @default 12
 * @param Effects
 * @text 추가 연출 사용
 * @type boolean
 * @default true
 */

(() => {
    "use strict";
    const pluginName = "Akena_TitleImages";
    const params = PluginManager.parameters(pluginName);
    window.Akena = window.Akena || {};
    const api = window.Akena.TitleImages = {};
    const number = (key, fallback, min = -10000) => {
        const n = params[key] === undefined || params[key] === "" ? fallback : Number(params[key]);
        return Number.isFinite(n) ? Math.max(min, Math.min(10000, n)) : fallback;
    };
    const config = {
        rw: number("ReferenceWidth", 816, 1), rh: number("ReferenceHeight", 624, 1),
        lx: number("LogoX", 408), ly: number("LogoY", 144),
        lw: number("LogoWidth", 600, 1), lh: number("LogoHeight", 160, 1),
        mx: number("MenuX", 408), my: number("MenuY", 356),
        bw: number("ButtonWidth", 320, 1), bh: number("ButtonHeight", 64, 1),
        gap: number("ButtonGap", 12, 0), effects: params.Effects !== "false"
    };
    const entries = [
        { symbol: "newGame", key: "NewGame" },
        { symbol: "continue", key: "Continue", show: "ShowContinue" },
        { symbol: "options", key: "Options", show: "ShowOptions" },
        { symbol: "akenaExit", key: "Exit", show: "ShowExit" }
    ].filter(entry => (!entry.show || params[entry.show] !== "false") &&
        (entry.symbol !== "akenaExit" || Utils.isNwjs()));

    function playCursor() {
        if (params.CursorSoundEnabled === "false") return;
        const name = String(params.CursorSound || "").trim();
        if (!name) SoundManager.playCursor();
        else AudioManager.playSe({ name,
            volume: Math.min(100, number("CursorVolume", 90, 0)),
            pitch: Math.min(150, number("CursorPitch", 100, 50)),
            pan: Math.min(100, number("CursorPan", 0, -100)) });
    }

    // 같은 배치 계산을 그리기와 클릭 판정에 사용합니다.
    api.layout = (width, height) => {
        const scale = Math.min(width / config.rw, height / config.rh);
        const ox = (width - config.rw * scale) / 2;
        const oy = (height - config.rh * scale) / 2;
        // 기존 세 항목 배치를 보존하며 표시 개수가 달라도 메뉴 하단을 유지합니다.
        const top = config.my + (3 - entries.length) * (config.bh + config.gap);
        return { scale, ox, oy, buttons: entries.map((_, i) => ({
            x: ox + (config.mx - config.bw / 2) * scale,
            y: oy + (top + i * (config.bh + config.gap)) * scale,
            width: config.bw * scale, height: config.bh * scale
        })) };
    };
    api.hitTest = (rects, x, y) => rects.findIndex(r =>
        x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height);

    // 코어 Bitmap 로더를 쓰되 ImageManager 전역 오류 대기열에는 넣지 않습니다.
    function resource(state, key, folder = "img/pictures/") {
        const name = String(params[key] || "").trim();
        if (!name) return null;
        const bitmap = Bitmap.load(folder + Utils.encodeURI(name) + ".png");
        const loaded = bitmap._onLoad;
        bitmap._onLoad = function() {
            loaded.call(this);
            if (state.disposed) this.destroy();
        };
        // Bitmap.load 안에서 미리 바인딩한 이벤트도 인스턴스 보호 처리로 연결합니다.
        if (bitmap._image && !bitmap.isReady()) bitmap._image.onload = bitmap._onLoad.bind(bitmap);
        const item = { key, bitmap, frames: 0, failed: false };
        state.resources.push(item);
        return item;
    }
    function ready(item) {
        return item && !item.failed && item.bitmap.isReady() &&
            item.bitmap.width > 0 && item.bitmap.height > 0;
    }
    function ownedBitmap(state, width, height) {
        const bitmap = new Bitmap(width, height);
        state.bitmaps.push(bitmap);
        return bitmap;
    }
    function makeSprite(state, bitmap) {
        const sprite = new Sprite(bitmap);
        state.layer.addChild(sprite);
        return sprite;
    }
    function textButton(state, text) {
        const bitmap = ownedBitmap(state, config.bw, config.bh);
        bitmap.fillAll("rgba(10,20,34,0.85)");
        bitmap.fontFace = $gameSystem.mainFontFace();
        bitmap.fontSize = Math.min(28, config.bh * 0.48);
        bitmap.drawText(text, 8, 0, config.bw - 16, config.bh, "center");
        return bitmap;
    }
    function outline(state) {
        const bitmap = ownedBitmap(state, config.bw, config.bh);
        const c = "#ffe2a1";
        bitmap.fillRect(0, 0, config.bw, 2, c);
        bitmap.fillRect(0, config.bh - 2, config.bw, 2, c);
        bitmap.fillRect(0, 0, 2, config.bh, c);
        bitmap.fillRect(config.bw - 2, 0, 2, config.bh, c);
        return bitmap;
    }

    const create = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function(...args) {
        create.apply(this, args);
        const win = this._commandWindow;
        if (entries.some(entry => entry.symbol === "akenaExit")) {
            win.addCommand("게임 종료", "akenaExit");
            win.setHandler("akenaExit", () => {
                win.close();
                SceneManager.exit();
            });
        }
        // 숨겨진 메뉴가 마지막 선택으로 기억되어 있으면 첫 표시 메뉴로 복구합니다.
        if (!entries.some(entry => entry.symbol === win.currentSymbol())) {
            win.selectSymbol(entries[0].symbol);
        }
        win.hide();
        win.deactivate();
        const state = this._akenaTitleImages = {
            layer: new Sprite(), resources: [], bitmaps: [], buttons: [],
            age: 0, locked: false, armed: false, disposed: false, pending: false
        };
        // 씬 좌표를 사용하므로 windowLayer의 boxWidth 오프셋과 무관합니다.
        this.addChild(state.layer);
        state.background = resource(state, "TitleBackground", "img/titles1/");
        state.logo = resource(state, "Logo");
        // 배경은 기본 제목보다 아래에 놓아 로고 미지정 때 제목을 가리지 않습니다.
        state.bgSprite = new Sprite();
        this.addChildAt(state.bgSprite, this.getChildIndex(this._gameTitleSprite));
        state.logoSprite = makeSprite(state, null);
        const border = outline(state);
        entries.forEach(entry => {
            const index = win.findSymbol(entry.symbol);
            const text = index >= 0 ? win.commandName(index) : entry.symbol;
            const normal = resource(state, entry.key);
            const selected = resource(state, entry.key + "Selected");
            const fallback = textButton(state, text);
            const sprite = makeSprite(state, fallback);
            const focus = makeSprite(state, border);
            const lockBitmap = ownedBitmap(state, 32, 32);
            lockBitmap.fontSize = 24;
            lockBitmap.drawText("×", 0, 0, 32, 32, "center");
            const lock = makeSprite(state, lockBitmap);
            state.buttons.push({ index, normal, selected, fallback, sprite, focus, lock });
        });
        const notice = ownedBitmap(state, Graphics.width, 40);
        notice.fontSize = 16;
        state.notice = makeSprite(state, notice);
        state.notice.visible = false;
        updateVisuals(this, state);
    };

    function checkResources(state) {
        state.pending = false;
        for (const item of state.resources) {
            if (item.failed || ready(item)) continue;
            if (item.bitmap.isError() || ++item.frames >= 600 || item.bitmap.isReady()) {
                item.failed = true;
                state.notice.visible = true;
                state.notice.bitmap.clear();
                state.notice.bitmap.drawText("이미지 오류: 기본 표시로 복구했습니다. 설정과 F8을 확인하세요.",
                    4, 0, state.notice.bitmap.width - 8, 40, "center");
                console.warn(`[${pluginName}] ${item.key}: ${item.bitmap.url} 로딩 실패/지연. 기본 표시 사용.`);
            } else {
                state.pending = true;
            }
        }
    }
    function updateVisuals(scene, state) {
        const layout = api.layout(Graphics.width, Graphics.height);
        state.rects = layout.buttons;
        const { scale, ox, oy } = layout;
        const progress = config.effects ? Math.min(1, state.age / 24) : 1;
        const offset = config.effects ? (1 - progress) * 12 * scale : 0;
        const bg = state.bgSprite;
        bg.visible = !!ready(state.background);
        scene._backSprite1.visible = !bg.visible;
        scene._backSprite2.visible = !bg.visible;
        if (bg.visible) {
            bg.bitmap = state.background.bitmap;
            const fit = params.BackgroundMode === "contain" ? Math.min : Math.max;
            const ratio = fit(Graphics.width / bg.bitmap.width, Graphics.height / bg.bitmap.height);
            bg.anchor.set(0.5, 0.5);
            bg.scale.set(ratio, ratio);
            bg.x = Graphics.width / 2;
            bg.y = Graphics.height / 2;
        }
        const logo = state.logoSprite;
        logo.visible = !!ready(state.logo);
        scene._gameTitleSprite.visible = !logo.visible;
        if (logo.visible) {
            logo.bitmap = state.logo.bitmap;
            const ratio = Math.min(config.lw / logo.bitmap.width, config.lh / logo.bitmap.height) * scale;
            logo.anchor.set(0.5, 0.5);
            logo.scale.set(ratio, ratio);
            logo.x = ox + config.lx * scale;
            logo.y = oy + config.ly * scale + offset;
            logo.opacity = progress * 255;
        }
        const win = scene._commandWindow;
        state.buttons.forEach((button, i) => {
            const selected = button.index === win.index();
            const enabled = button.index >= 0 && win.isCommandEnabled(button.index);
            const selectedImage = selected && enabled && ready(button.selected);
            const bitmap = selectedImage ? button.selected.bitmap :
                ready(button.normal) ? button.normal.bitmap : button.fallback;
            const rect = layout.buttons[i];
            const sprite = button.sprite;
            sprite.bitmap = bitmap;
            sprite.x = rect.x;
            sprite.y = rect.y + offset;
            sprite.scale.set(rect.width / bitmap.width, rect.height / bitmap.height);
            sprite.opacity = progress * (enabled ? 255 : 90);
            sprite.setBlendColor(config.effects && selected && enabled && !selectedImage ?
                [255, 222, 145, 48] : [0, 0, 0, 0]);
            button.focus.x = sprite.x;
            button.focus.y = sprite.y;
            button.focus.scale.set(scale, scale);
            button.focus.visible = selected && !selectedImage;
            button.focus.opacity = progress * 255;
            button.lock.x = sprite.x + rect.width - 32 * scale;
            button.lock.y = sprite.y + (rect.height - 32 * scale) / 2;
            button.lock.scale.set(scale, scale);
            button.lock.visible = !enabled;
            button.lock.opacity = progress * 255;
        });
        state.notice.y = Graphics.height - 40;
        state.notice.scale.x = Graphics.width / state.notice.bitmap.width;
    }
    function updateInput(scene, state) {
        if (state.locked || state.pending || !scene.isActive() || scene.isBusy() ||
            SceneManager.isSceneChanging() || (config.effects && state.age < 24)) return;
        if (!state.armed) {
            state.armed = !Input.isPressed("ok") && !TouchInput.isPressed();
            return;
        }
        const win = scene._commandWindow;
        let current = state.buttons.findIndex(button => button.index === win.index());
        if (current < 0) current = 0;
        let next = current;
        const count = state.buttons.length;
        if (Input.isRepeated("down") || Input.isRepeated("right")) next = (current + 1) % count;
        else if (Input.isRepeated("up") || Input.isRepeated("left")) next = (current + count - 1) % count;
        const hit = api.hitTest(state.rects, TouchInput.x, TouchInput.y);
        if ((TouchInput.isHovered() || TouchInput.isTriggered()) && hit >= 0) next = hit;
        if (next !== current) {
            win.select(state.buttons[next].index);
            playCursor();
        }
        if (Input.isTriggered("ok") || (TouchInput.isTriggered() && hit >= 0)) {
            // 코어 호출 전에 잠가 연타와 같은 프레임의 중복 실행을 막습니다.
            state.locked = win.isCurrentItemEnabled();
            win.processOk();
        }
    }

    const update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function(...args) {
        const state = this._akenaTitleImages;
        if (state) this._commandWindow.deactivate();
        update.apply(this, args);
        if (!state || state.disposed) return;
        checkResources(state);
        if (!state.pending) state.age++;
        updateVisuals(this, state);
        updateInput(this, state);
        // 같은 프레임의 선택 변경을 화면에 반영합니다.
        updateVisuals(this, state);
    };
    const terminate = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function(...args) {
        terminate.apply(this, args);
        const state = this._akenaTitleImages;
        if (!state || state.disposed) return;
        state.disposed = true;
        // 씬 종료 후 늦게 로드되는 이미지도 완료 직후 정리합니다.
        for (const child of state.layer.children) child.bitmap = null;
        state.bgSprite.bitmap = null;
        for (const item of state.resources) item.bitmap.destroy();
        for (const bitmap of state.bitmaps) bitmap.destroy();
    };
})();

