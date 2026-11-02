//=============================================================================
// Akena_Stamina.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 달리기 시간·고갈 대기·재달리기 기준을 설정하는 스태미나 HUD <Akena_Stamina>
 * @author Akena
 *
 * @help
 * Akena_Stamina — Dash Stamina (달리기 스태미나)
 *
 * [시작하기]
 * 이 파일을 js/plugins에 넣고 플러그인 관리자에서 켭니다.
 * 이미지·다른 플러그인·스위치·변수·플러그인 명령은 필요하지 않습니다.
 * 설정을 바꾼 뒤에는 플레이테스트를 다시 시작하세요.
 *
 * [달리기와 회복]
 * 기본 대시 조작을 그대로 사용합니다. 실제로 달려 이동할 때만 소모하며,
 * 벽에 막혀 제자리라면 소모하지 않습니다. 기본 옵션의 항상 대시와
 * 클릭 이동도 엔진의 대시 규칙을 따릅니다.
 * 잔량이 남았을 때 걷거나 멈추면 즉시 회복합니다.
 * 0%가 되면 걷기만 가능하며, 고갈 후 회복 대기 시간이 지나야 회복합니다.
 * 재달리기 최소 잔량까지 회복하면 다시 달릴 수 있습니다.
 * 예: 기준 20%이면 20%에서 제한 해제, 이후 달리기는 0%까지 가능합니다.
 *
 * [설정 예시]
 * 스태미나 전체를 100으로 보고, 초당 회복량을 고정 수치로 더합니다.
 * 예: 초당 회복량 20이면 잔량 30에서 1초 후 50이 됩니다.
 * 현재 잔량의 20%씩 회복하는 계산이 아닙니다.
 * 연속 달리기 5초 / 초당 회복량 20 / 고갈 대기 2초 / 재달리기 잔량 20%:
 * 가득 찬 상태에서 5초 달리면 고갈되고, 2초 대기 후 1초 회복하면
 * 다시 달릴 수 있습니다. 회복 대기는 고갈했을 때만 적용됩니다.
 * 초는 엔진의 게임 진행 시간(60회 갱신 = 1초) 기준입니다.
 *
 * [HUD 위치와 색상]
 * 맵 화면에서 항상 표시되는 가로 막대입니다. 정상 색은 달리기 가능,
 * 제한 색은 고갈 후 재달리기 불가 상태입니다. 숫자·라벨은 없습니다.
 * X/Y는 게임 화면 왼쪽 위(0,0)부터 게이지 전체 테두리 왼쪽 위까지의
 * 픽셀 거리입니다. OS 창이나 UI 영역의 좌표가 아닙니다.
 * 너비/높이는 테두리 포함 크기이며, 화면 밖 좌표는 자동 보정하지 않습니다.
 * 색상은 #RRGGBB 형식입니다. 다른 HUD와 겹치면 X/Y를 조절하세요.
 * 대화창·맵 이름·그림 등과 겹치는 위치에서는 이들이 HUD를 가릴 수 있습니다.
 * 메뉴·전투·타이틀에서는 HUD를 표시하지 않습니다.
 *
 * [저장과 일시 정지]
 * 잔량·고갈 제한·남은 회복 대기는 세이브에 함께 저장됩니다.
 * 이 플러그인 도입 전 세이브에는 처음 적용할 때 잔량 100%로 시작합니다.
 * 메뉴·대화·일반 이벤트 실행·강제 이동·탑승·장소 이동·맵 페이드 중에는
 * 소모·회복·회복 대기를 정지합니다. 병렬 이벤트는 대화나 플레이어
 * 강제 이동으로 조작을 막지 않는 한 스태미나를 정지시키지 않습니다.
 *
 * [범위와 호환성]
 * 고정 설정형입니다. 이벤트/아이템 명령·성장·드래그 배치는 없습니다.
 * Game_Player.update/isDashing, Scene_Map.createSpriteset을 원본 호출 후
 * 확장합니다. isDashing은 고갈 제한 중 false를 반환하여 기본 대시를
 * 제한합니다. 기본 이동 속도를 직접 수정하지 않습니다.
 * 별도 대시/픽셀 이동/시간 제어/HUD 플러그인은 호환 검수가 필요합니다.
 *
 * @param StaminaSettings
 * @text ── 달리기·회복 설정 ──
 *
 * @param DashDuration
 * @text 연속 달리기 시간(초)
 * @parent StaminaSettings
 * @type number
 * @decimals 1
 * @min 0.1
 * @max 600
 * @default 5
 * @desc 가득 찬 상태에서 고갈까지 달릴 수 있는 시간입니다. 5이면 연속 5초 달릴 수 있습니다.
 *
 * @param RecoveryPerSecond
 * @text 초당 회복량(100 기준)
 * @parent StaminaSettings
 * @type number
 * @decimals 1
 * @min 0.1
 * @max 100
 * @default 20
 * @desc 전체 100 중 1초마다 더하는 양입니다. 20이면 잔량 30→50. 현재 잔량에 비례하지 않습니다.
 *
 * @param ExhaustionDelay
 * @text 고갈 시 회복 대기(초)
 * @parent StaminaSettings
 * @type number
 * @decimals 1
 * @min 0
 * @max 600
 * @default 2
 * @desc 0이 된 뒤 회복 시작까지의 시간입니다. 2이면 2초 대기. 고갈 전에는 대기 없이 회복합니다.
 *
 * @param ResumeThreshold
 * @text 재달리기 최소 잔량(%)
 * @parent StaminaSettings
 * @type number
 * @decimals 1
 * @min 1
 * @max 100
 * @default 20
 * @desc 고갈 후 달리기를 다시 허용할 최소 잔량입니다. 20이면 전체의 20%에서 해제. 달리는 중에는 0%까지 사용합니다.
 *
 * @param HudSettings
 * @text ── HUD 위치·크기 ──
 *
 * @param HudX
 * @text 게이지 X 위치(픽셀)
 * @parent HudSettings
 * @type number
 * @min -9999
 * @max 9999
 * @default 24
 * @desc 화면 왼쪽에서 게이지 테두리 왼쪽까지의 거리입니다. 화면 해상도를 기준으로 입력하세요.
 *
 * @param HudY
 * @text 게이지 Y 위치(픽셀)
 * @parent HudSettings
 * @type number
 * @min -9999
 * @max 9999
 * @default 24
 * @desc 화면 위쪽에서 게이지 테두리 위쪽까지의 거리입니다. 다른 HUD·맵 이름과 겹치지 않게 조절하세요.
 *
 * @param HudWidth
 * @text 게이지 너비(픽셀)
 * @parent HudSettings
 * @type number
 * @min 24
 * @max 1920
 * @default 200
 * @desc 테두리를 포함한 가로 크기입니다. 위치 X와 합친 값이 화면 너비 이내인지 확인하세요.
 *
 * @param HudHeight
 * @text 게이지 높이(픽셀)
 * @parent HudSettings
 * @type number
 * @min 6
 * @max 120
 * @default 14
 * @desc 테두리를 포함한 세로 크기입니다. 얇은 가로 막대는 12~18픽셀을 권장합니다.
 *
 * @param ColorSettings
 * @text ── HUD 색상(#RRGGBB) ──
 *
 * @param NormalColor
 * @text 달리기 가능 시 막대색
 * @parent ColorSettings
 * @type string
 * @default #71c9b0
 * @desc 달리기 가능한 상태의 잔량 색상입니다. 예: #71c9b0. 고갈 제한 해제 시 이 색으로 복귀합니다.
 *
 * @param ExhaustedColor
 * @text 재달리기 제한 중 막대색
 * @parent ColorSettings
 * @type string
 * @default #d67c6b
 * @desc 재달리기 기준 미만으로 제한된 상태의 잔량 색상입니다. 예: #d67c6b.
 *
 * @param BackgroundColor
 * @text 빈 게이지 배경색
 * @parent ColorSettings
 * @type string
 * @default #182026
 * @desc 잔량이 없는 부분의 색상입니다. 예: #182026. 밝은 맵에서도 잔량이 구분되게 설정하세요.
 *
 * @param BorderColor
 * @text 테두리 색상
 * @parent ColorSettings
 * @type string
 * @default #a0aaa9
 * @desc 1픽셀 테두리 색상입니다. 예: #a0aaa9. 테두리는 게이지 크기에 포함됩니다.
 */
(() => {
    "use strict";

    const pluginName = "Akena_Stamina";
    const params = PluginManager.parameters(pluginName);
    const number = (name, fallback, min, max) => {
        const value = params[name] === "" || params[name] == null ? fallback : Number(params[name]);
        return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
    };
    const color = (name, fallback) => /^#[0-9a-f]{6}$/i.test(params[name] || "") ? params[name] : fallback;
    const settings = Object.freeze({
        dashDuration: number("DashDuration", 5, 0.1, 600),
        recoveryPerSecond: number("RecoveryPerSecond", 20, 0.1, 100),
        exhaustionDelay: number("ExhaustionDelay", 2, 0, 600),
        resumeThreshold: number("ResumeThreshold", 20, 1, 100),
        hudX: number("HudX", 24, -9999, 9999),
        hudY: number("HudY", 24, -9999, 9999),
        hudWidth: Math.round(number("HudWidth", 200, 24, 1920)),
        hudHeight: Math.round(number("HudHeight", 14, 6, 120)),
        normalColor: color("NormalColor", "#71c9b0"),
        exhaustedColor: color("ExhaustedColor", "#d67c6b"),
        backgroundColor: color("BackgroundColor", "#182026"),
        borderColor: color("BorderColor", "#a0aaa9")
    });
    window.Akena = window.Akena || {};
    const stamina = window.Akena.Stamina = {};
    const secondsPerUpdate = 1 / 60;

    // Game_System은 저장 대상입니다. 기존 세이브는 처음 접근할 때 초기화합니다.
    function savedState() {
        $gameSystem._Akena = $gameSystem._Akena || {};
        let state = $gameSystem._Akena.Stamina;
        if (!state || !Number.isFinite(state.amount) || !Number.isFinite(state.recoveryDelayRemaining)) {
            state = $gameSystem._Akena.Stamina = { amount: 100, exhausted: false, recoveryDelayRemaining: 0 };
        }
        state.amount = Math.max(0, Math.min(100, state.amount));
        state.recoveryDelayRemaining = Math.max(0, Math.min(settings.exhaustionDelay, state.recoveryDelayRemaining));
        state.exhausted = !!state.exhausted;
        return state;
    }

    // 조작이 막힌 시간은 스태미나 시간에서도 제외합니다.
    function canProgress(player, sceneActive) {
        return sceneActive && !SceneManager.isSceneChanging() && !player.isTransferring() &&
            !player.isInVehicle() && !player.isJumping() && player.canMove();
    }

    function updateStamina(state, dashMoved) {
        if (dashMoved && !state.exhausted) {
            state.amount = Math.max(0, state.amount - 100 / settings.dashDuration * secondsPerUpdate);
            // 부동소수점 오차로 0% 직전에서 제한이 늦게 걸리지 않게 합니다.
            if (state.amount < 1e-8) {
                state.amount = 0;
                state.exhausted = true;
                state.recoveryDelayRemaining = settings.exhaustionDelay;
            }
            return;
        }
        let recoverySeconds = secondsPerUpdate;
        if (state.exhausted && state.recoveryDelayRemaining > 0) {
            const waiting = Math.min(state.recoveryDelayRemaining, recoverySeconds);
            state.recoveryDelayRemaining = Math.max(0, state.recoveryDelayRemaining - waiting);
            recoverySeconds -= waiting;
        }
        state.amount = Math.min(100, state.amount + settings.recoveryPerSecond * recoverySeconds);
        if (state.exhausted && state.amount + 1e-8 >= settings.resumeThreshold) {
            state.exhausted = false;
            state.recoveryDelayRemaining = 0;
        }
    }

    const originalIsDashing = Game_Player.prototype.isDashing;
    Game_Player.prototype.isDashing = function() {
        const dashing = originalIsDashing.call(this);
        return dashing && (!window.$gameSystem || !savedState().exhausted);
    };

    const originalUpdate = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        const canUpdate = canProgress(this, sceneActive);
        const previousX = this._realX;
        const previousY = this._realY;
        originalUpdate.call(this, sceneActive);
        // 마지막 이동 프레임도 실제 좌표 변화로 판정합니다. 벽 밀기는 소모하지 않습니다.
        if (canUpdate && canProgress(this, sceneActive)) {
            const moved = previousX !== this._realX || previousY !== this._realY;
            updateStamina(savedState(), moved && this.isDashing());
        }
    };

    class Sprite_Stamina extends Sprite {
        constructor() {
            // 부모 생성이 끝난 뒤 자신이 소유할 비트맵을 만듭니다.
            super();
            this.bitmap = new Bitmap(settings.hudWidth, settings.hudHeight);
            this.x = settings.hudX;
            this.y = settings.hudY;
            this._lastWidth = -1;
            this._lastExhausted = null;
            this.update();
        }

        update() {
            super.update();
            const state = savedState();
            const width = Math.round((settings.hudWidth - 4) * state.amount / 100);
            // 표시 너비나 제한 상태가 바뀔 때만 다시 그려 비트맵 재생성을 피합니다.
            if (width === this._lastWidth && state.exhausted === this._lastExhausted) return;
            this._lastWidth = width;
            this._lastExhausted = state.exhausted;
            this.bitmap.clear();
            this.bitmap.fillRect(0, 0, settings.hudWidth, settings.hudHeight, settings.borderColor);
            this.bitmap.fillRect(1, 1, settings.hudWidth - 2, settings.hudHeight - 2, settings.backgroundColor);
            if (width > 0) {
                const fill = state.exhausted ? settings.exhaustedColor : settings.normalColor;
                this.bitmap.fillRect(2, 2, width, settings.hudHeight - 4, fill);
            }
        }

        destroy() {
            this.bitmap.destroy();
            super.destroy();
        }
    }

    const originalCreateSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        originalCreateSpriteset.call(this);
        // 맵 변환·색조의 영향을 받지 않고, 이후 생성되는 대화창 아래에 놓습니다.
        this._akenaStaminaHud = new Sprite_Stamina();
        this.addChild(this._akenaStaminaHud);
    };

    // 비교 도구에서 읽기만 할 수 있는 정보입니다. 설정 변경 명령은 제공하지 않습니다.
    stamina.settings = settings;
    stamina.snapshot = () => Object.freeze({ ...savedState() });
})();
