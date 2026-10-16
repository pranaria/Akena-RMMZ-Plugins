//=============================================================================
// Akena_CameraScene.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 목표 이동·줌·유지·복귀를 이벤트 명령으로 실행 <Akena_CameraScene>
 * @author Akena
 * @help
 * Akena_CameraScene - 카메라 연출 (40번)
 * [사용법]
 * 1. ON으로 설정합니다. Akena_Camera를 함께 쓰면 그 아래에 배치합니다.
 * 2. '자동 연출'은 현재 화면 저장 → 이동 → 확대 → 유지 → 축소 → 복귀입니다.
 * 3. 대사를 넣을 때는 '이동·확대' → 텍스트 표시 → '복귀' 순서로 씁니다.
 * 4. 좌표는 맵 타일 X/Y이며 시간은 초(게임 갱신 60회 기준)입니다.
 *    목표 타일 중심을 보여주며 맵 경계에서는 구도가 제한됩니다.
 * [대기·복원]
 * - 각 명령은 해당 이동/확대 또는 전체 자동 연출 완료까지 이벤트를 기다립니다.
 * - '이동·확대' 완료 후에는 화면을 유지하고 다음 이벤트 명령을 실행합니다.
 *   반드시 '복귀' 또는 '즉시 취소'로 끝내세요. 유지 중 수동 이동도 잠깁니다.
 * - 복귀는 명령 실행 전 화면 위치·확대 상태를 복원합니다. 플레이어는 옮기지 않습니다.
 * - 연출 중 새 연출 명령은 무시합니다. 복귀/취소만 기존 연출을 종료할 수 있습니다.
 * - 맵 전환·저장 시 진행 중 연출을 정리합니다. 저장은 연출 이전 화면 상태로 기록합니다.
 * [주의사항]
 * - 입력 시간을 0으로 설정하면 해당 단계를 즉시 완료합니다. 배율은 1~4배입니다.
 * - 루프 맵은 짧은 방향으로 이동합니다. 작은 맵과 가장자리는 기본 경계를 유지합니다.
 * - Akena_Camera 세 모드의 추적을 연출 중 잠시 억제하고 종료 후 재개합니다.
 *   모드는 바꾸지 않습니다. Akena_CameraScene을 아래에 배치해야 합니다.
 * - 연출 중 다른 화면 스크롤·확대·카메라 변경·플레이어 강제 이동을 섞지 마세요.
 *   기존 화면 스크롤/확대 진행 중에는 시작 명령을 무시합니다.
 * - 화면 픽처도 RMMZ 기본 확대 대상이며 메시지창 등 윈도우는 확대되지 않습니다.
 * - Game_Map.update/setup, Game_Player.updateScroll/canMove,
 *   Game_Interpreter.updateWaitMode, Game_System.onBeforeSave를 별칭 호출합니다.
 *   같은 지점을 바꾸는 다른 카메라 플러그인은 충돌 가능성이 있습니다.
 * - 파일명은 Akena_CameraScene.js를 유지하세요. 테스트 맵/외부 라이브러리는 필요 없습니다.
 *
 * @command Play
 * @text 자동 연출
 * @desc 이동→줌인→유지→줌아웃→복귀. 전체 완료까지 이벤트를 기다립니다.
 * @arg X
 * @text 목표 X (타일)
 * @type number
 * @min 0
 * @default 0
 * @arg Y
 * @text 목표 Y (타일)
 * @type number
 * @min 0
 * @default 0
 * @arg MoveSeconds
 * @text 이동 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1.5
 * @arg Scale
 * @text 확대 배율
 * @type number
 * @decimals 2
 * @min 1
 * @max 4
 * @default 2
 * @arg ZoomSeconds
 * @text 확대 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1
 * @arg HoldSeconds
 * @text 유지 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 2
 * @arg OutSeconds
 * @text 축소 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1
 * @arg ReturnSeconds
 * @text 복귀 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1.5
 *
 * @command Focus
 * @text 이동·확대 (대사 연출)
 * @desc 이동·확대 완료까지 대기한 뒤 화면 유지. 텍스트 표시 후 복귀를 호출하세요.
 * @arg X
 * @text 목표 X (타일)
 * @type number
 * @min 0
 * @default 0
 * @arg Y
 * @text 목표 Y (타일)
 * @type number
 * @min 0
 * @default 0
 * @arg MoveSeconds
 * @text 이동 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1.5
 * @arg Scale
 * @text 확대 배율
 * @type number
 * @decimals 2
 * @min 1
 * @max 4
 * @default 2
 * @arg ZoomSeconds
 * @text 확대 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1
 *
 * @command Return
 * @text 복귀
 * @desc 축소한 뒤 저장한 화면으로 돌아옵니다. 완료까지 이벤트를 기다립니다.
 * @arg OutSeconds
 * @text 축소 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1
 * @arg ReturnSeconds
 * @text 복귀 시간 (초)
 * @type number
 * @decimals 2
 * @min 0
 * @max 60
 * @default 1.5
 *
 * @command Cancel
 * @text 즉시 취소·복원
 * @desc 저장했던 화면으로 즉시 복원하고 대기·입력 잠금을 해제합니다.
 */

(() => {
    "use strict";
    const pluginName = "Akena_CameraScene";
    const waitMode = "akenaCameraScene";
    window.Akena = window.Akena || {};
    const api = window.Akena.CameraScene = {};
    function state() {
        const root = $gameTemp._Akena = $gameTemp._Akena || {};
        return root.CameraScene = root.CameraScene || { session: null, serial: 0 };
    }
    const number = (value, fallback, min, max) => {
        const n = value === undefined || value === "" ? fallback : Number(value);
        return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fallback));
    };
    const frames = (args, key, fallback) => Math.round(number(args[key], fallback, 0, 60) * 60);
    const zoom = () => ({ x: $gameScreen.zoomX(), y: $gameScreen.zoomY(), scale: $gameScreen.zoomScale() });
    const view = () => ({ x: $gameMap.displayX(), y: $gameMap.displayY(), px: $gameMap._parallaxX, py: $gameMap._parallaxY });
    // 확대 중심의 화면 보정도 보간하여 이미 확대된 화면의 순간 이동을 방지합니다.
    function applyZoom(from, to, t) {
        const scale = from.scale + (to.scale - from.scale) * t;
        const ox = from.x * (from.scale - 1) * (1 - t) + to.x * (to.scale - 1) * t;
        const oy = from.y * (from.scale - 1) * (1 - t) + to.y * (to.scale - 1) * t;
        $gameScreen.setZoom(Math.abs(scale - 1) < 1e-8 ? to.x : ox / (scale - 1),
            Math.abs(scale - 1) < 1e-8 ? to.y : oy / (scale - 1), scale);
        $gameScreen._zoomDuration = 0;
        $gameScreen._zoomScaleTarget = scale;
    }
    function restore(s) {
        Object.assign($gameMap, { _displayX: s.view.x, _displayY: s.view.y,
            _parallaxX: s.view.px, _parallaxY: s.view.py });
        applyZoom(s.zoom, s.zoom, 1);
    }
    api.isActive = () => !!state().session;
    api.cancel = () => {
        const s = state().session;
        if (s) restore(s);
        state().session = null;
    };
    function bound(value, size, screen, loop) {
        if (loop) return value.mod(size);
        return size < screen ? (size - screen) / 2 : value.clamp(0, size - screen);
    }
    function phase(s, kind, duration, target) {
        return { kind, duration, target, elapsed: 0, from: kind === "zoom" ? zoom() : view() };
    }
    function returnPhases(s, args) {
        return [{ kind: "zoom", duration: frames(args, "OutSeconds", 1), target: s.zoom },
            { kind: "move", duration: frames(args, "ReturnSeconds", 1.5), target: s.view }];
    }
    function start(args, automatic) {
        const current = state();
        if (current.session || $gameParty.inBattle() || $gameMap.isScrolling() || $gameScreen._zoomDuration > 0) return null;
        const x = number(args.X, 0, 0, $gameMap.width() - 1);
        const y = number(args.Y, 0, 0, $gameMap.height() - 1);
        const s = { id: ++current.serial, mapId: $gameMap.mapId(), view: view(), zoom: zoom(), phases: [], index: 0 };
        const target = {
            x: bound(x + 0.5 - $gameMap.screenTileX() / 2, $gameMap.width(), $gameMap.screenTileX(), $gameMap.isLoopHorizontal()),
            y: bound(y + 0.5 - $gameMap.screenTileY() / 2, $gameMap.height(), $gameMap.screenTileY(), $gameMap.isLoopVertical())
        };
        // 목표 타일의 화면 위치를 확대 중심으로 사용합니다. 맵 가장자리도 같은 대상입니다.
        const targetZoom = { x: ($gameMap.deltaX(x, target.x) + 0.5) * $gameMap.tileWidth(),
            y: ($gameMap.deltaY(y, target.y) + 0.5) * $gameMap.tileHeight(), scale: number(args.Scale, 2, 1, 4) };
        s.phases = [phase(s, "move", frames(args, "MoveSeconds", 1.5), target),
            { kind: "zoom", duration: frames(args, "ZoomSeconds", 1), target: targetZoom }];
        if (automatic) s.phases.push({ kind: "hold", duration: frames(args, "HoldSeconds", 2) }, ...returnPhases(s, args));
        s.automatic = automatic;
        current.session = s;
        return s;
    }
    function wait(interpreter, s) {
        if (!s) return;
        interpreter._akenaCameraSceneId = s.id;
        interpreter.setWaitMode(waitMode);
    }
    PluginManager.registerCommand(pluginName, "Play", function(args) { wait(this, start(args, true)); });
    PluginManager.registerCommand(pluginName, "Focus", function(args) { wait(this, start(args, false)); });
    PluginManager.registerCommand(pluginName, "Return", function(args) {
        const s = state().session;
        if (!s) return;
        s.id = ++state().serial;
        s.phases = returnPhases(s, args); s.index = 0; s.automatic = true;
        wait(this, s);
    });
    PluginManager.registerCommand(pluginName, "Cancel", () => api.cancel());
    // 맵 갱신으로 시간을 진행하고, 0초 단계도 같은 갱신에서 순서대로 완료합니다.
    function update() {
        const s = state().session;
        if (!s) return;
        if (s.mapId !== $gameMap.mapId()) { api.cancel(); return; }
        while (s.index < s.phases.length) {
            const p = s.phases[s.index];
            if (!p.from) p.from = p.kind === "zoom" ? zoom() : view();
            p.elapsed = (p.elapsed || 0) + 1;
            const t = p.duration === 0 ? 1 : Math.min(1, p.elapsed / p.duration);
            const eased = t * t * (3 - 2 * t);
            if (p.kind === "move") {
                const dx = $gameMap.deltaX(p.target.x, p.from.x), dy = $gameMap.deltaY(p.target.y, p.from.y);
                $gameMap._displayX = $gameMap.isLoopHorizontal() ? (p.from.x + dx * eased).mod($gameMap.width()) : p.from.x + dx * eased;
                $gameMap._displayY = $gameMap.isLoopVertical() ? (p.from.y + dy * eased).mod($gameMap.height()) : p.from.y + dy * eased;
                $gameMap._parallaxX += $gameMap.deltaX($gameMap.displayX(), p.from.lastX ?? p.from.x);
                $gameMap._parallaxY += $gameMap.deltaY($gameMap.displayY(), p.from.lastY ?? p.from.y);
                p.from.lastX = $gameMap.displayX(); p.from.lastY = $gameMap.displayY();
            } else if (p.kind === "zoom") applyZoom(p.from, p.target, eased);
            if (t < 1) break;
            s.index++;
            if (p.duration > 0) break;
        }
        if (s.index === s.phases.length && s.automatic) { restore(s); state().session = null; }
    }
    const _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        const result = _Game_Map_update.call(this, sceneActive);
        if (sceneActive) update();
        return result;
    };
    const _Game_Player_updateScroll = Game_Player.prototype.updateScroll;
    Game_Player.prototype.updateScroll = function(...args) {
        const saved = api.isActive() ? view() : null;
        const result = _Game_Player_updateScroll.apply(this, args);
        if (saved) Object.assign($gameMap, { _displayX: saved.x, _displayY: saved.y, _parallaxX: saved.px, _parallaxY: saved.py });
        return result;
    };
    const _Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        const result = _Game_Player_canMove.call(this);
        return result && !api.isActive();
    };
    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        const own = this._waitMode === waitMode;
        const s = own ? state().session : null;
        const result = _Game_Interpreter_updateWaitMode.call(this);
        if (!own) return result;
        const waiting = !!s && s.id === this._akenaCameraSceneId && s.index < s.phases.length;
        this._waitMode = waiting ? waitMode : "";
        return waiting;
    };
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        api.cancel();
        return _Game_Map_setup.call(this, mapId);
    };
    const _Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
    Game_System.prototype.onBeforeSave = function() {
        api.cancel();
        return _Game_System_onBeforeSave.call(this);
    };
})();
