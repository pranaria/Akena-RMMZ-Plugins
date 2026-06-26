//=============================================================================
// Akena_MG_MemoryCards.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0] 카드 짝맞추기 미니게임 <Akena_MG_MemoryCards>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_MG_MemoryCards - 카드 짝맞추기 미니게임
 * ============================================================
 * [개요]
 * RMMZ 전투 배경 위에서 액터 Face 이미지 카드를 뒤집어 같은 얼굴을
 * 맞추는 독립형 미니게임입니다.
 *
 * 이 플러그인은 보상, 아이템, 골드, HP 등을 직접 변경하지 않습니다.
 * 성공/실패/취소 결과만 변수 또는 스위치에 기록합니다.
 * 보상 지급과 이벤트 분기는 RMMZ 이벤트 명령으로 처리합니다.
 *
 * [사용법]
 * 1. 플러그인 매니저에서 이 플러그인을 ON 합니다.
 * 2. 이벤트 명령 > 플러그인 커맨드 > StartMemoryCards를 호출합니다.
 * 3. 카드 쌍 수, 제한 시간, 결과 저장 방식을 설정합니다.
 * 4. 이벤트 조건 분기로 결과 변수 또는 스위치를 확인합니다.
 *
 * [조작]
 * - 방향키: 카드 선택 이동
 * - 결정키: 카드 뒤집기
 * - 취소키: 미니게임 중단
 *
 * [카드 쌍 수]
 * 카드 쌍 수는 2쌍, 4쌍, 8쌍, 16쌍 중 하나를 선택합니다.
 * 16쌍을 선택하면 총 32장의 카드가 생성됩니다.
 *
 * [이미지 사용 범위]
 * 카드 앞면은 기본 Face 이미지 중 아래 범위를 사용합니다.
 * - img/faces/Actor1.png : index 0~7
 * - img/faces/Actor2.png : index 0~7
 *
 * 카드 뒷면은 img/system/IconSet.png의 아이콘을 사용합니다.
 * 별도 이미지 파일을 추가하지 않아도 동작합니다.
 *
 * [결과 처리 방식]
 * 결과 처리 방식은 아래 세 가지 중 하나입니다.
 *
 * 1. 결과 변수만 사용
 *    결과 코드 변수와 맞춘 쌍 수 변수에만 값을 저장합니다.
 *    성공/실패/취소 스위치는 0으로 두는 것을 권장합니다.
 *
 * 2. 스위치만 사용
 *    성공/실패/취소 스위치만 ON/OFF 처리합니다.
 *    결과 코드 변수와 맞춘 쌍 수 변수는 0으로 두는 것을 권장합니다.
 *
 * 3. 변수와 스위치 모두 사용
 *    결과 코드, 점수, 성공/실패/취소 스위치를 모두 기록합니다.
 *
 * [결과 코드]
 * 결과 코드 변수에는 아래 값이 저장됩니다.
 *
 * 1   성공
 * 0   실패 또는 시간 초과
 * -1  취소
 * -2  오류 또는 실행 불가
 * -99 진행 전 초기화
 *
 * 미니게임 시작 시 결과 코드 변수는 -99로 초기화됩니다.
 * 미니게임 종료 시 최종 결과 코드가 저장됩니다.
 *
 * [맞춘 쌍 수 변수]
 * 게임 종료 시 맞춘 카드 쌍 수를 저장합니다.
 * 예: 8쌍 중 5쌍을 맞추고 시간 초과되면 5가 저장됩니다.
 *
 * [스위치 저장]
 * 성공 시 ON 스위치: 성공하면 ON
 * 실패/시간초과 시 ON 스위치: 실패 또는 시간 초과면 ON
 * 취소 시 ON 스위치: 취소키로 중단하면 ON
 *
 * 같은 결과 처리 방식에서 사용하지 않는 변수/스위치는 0으로 두면 됩니다.
 *
 * [이벤트 예시 - 결과 변수만 사용]
 * 플러그인 커맨드 설정:
 * - 결과 처리 방식: 결과 변수만 사용
 * - 결과 코드 변수: 21
 * - 맞춘 쌍 수 변수: 22
 * - 성공/실패/취소 스위치: 0
 *
 * 이벤트 조건 분기:
 * - 변수 21 == 1 : 성공 처리
 * - 변수 21 == 0 : 실패 처리
 * - 변수 21 == -1 : 취소 처리
 *
 * [이벤트 예시 - 스위치만 사용]
 * 플러그인 커맨드 설정:
 * - 결과 처리 방식: 스위치만 사용
 * - 결과 코드 변수: 0
 * - 맞춘 쌍 수 변수: 0
 * - 성공 시 ON 스위치: 31
 * - 실패/시간초과 시 ON 스위치: 32
 * - 취소 시 ON 스위치: 33
 *
 * 이벤트 조건 분기:
 * - 스위치 31 ON : 성공 처리
 * - 스위치 32 ON : 실패 처리
 * - 스위치 33 ON : 취소 처리
 *
 * [주의사항]
 * - 변수와 스위치 ID가 0이면 해당 항목은 사용하지 않습니다.
 * - 이 플러그인은 지정한 변수와 스위치만 변경합니다.
 * - 실행 중에는 이벤트가 다음 명령으로 넘어가지 않도록 대기합니다.
 * - 16쌍 모드는 화면 해상도에 따라 카드가 작게 보일 수 있습니다.
 *
 * @command StartMemoryCards
 * @text 카드 짝맞추기 시작
 * @desc Face 이미지 카드 짝맞추기 미니게임을 시작합니다.
 *
 * @arg pairCount
 * @text 카드 쌍 수
 * @type select
 * @option 2쌍
 * @value 2
 * @option 4쌍
 * @value 4
 * @option 8쌍
 * @value 8
 * @option 16쌍
 * @value 16
 * @default 8
 * @desc 생성할 카드 쌍 수입니다. 16이면 총 32장입니다.
 *
 * @arg timeLimit
 * @text 제한 시간
 * @type number
 * @min 0
 * @default 60
 * @desc 제한 시간(초)입니다. 0이면 시간 제한이 없습니다.
 *
 * @arg resultMode
 * @text 결과 처리 방식
 * @type select
 * @option 결과 변수만 사용
 * @value variable
 * @option 스위치만 사용
 * @value switch
 * @option 변수와 스위치 모두 사용
 * @value both
 * @default variable
 * @desc 결과를 변수/스위치 중 어디에 저장할지 선택합니다.
 *
 * @arg resultVar
 * @text 결과 코드 변수
 * @type variable
 * @default 0
 * @desc 성공=1, 실패=0, 취소=-1 저장. 스위치만 쓰면 0 권장.
 *
 * @arg scoreVar
 * @text 맞춘 쌍 수 변수
 * @type variable
 * @default 0
 * @desc 종료 시 맞춘 카드 쌍 수 저장. 스위치만 쓰면 0 권장.
 *
 * @arg successSwitch
 * @text 성공 시 ON 스위치
 * @type switch
 * @default 0
 * @desc 성공하면 ON. 결과 변수만 쓰면 0 권장.
 *
 * @arg failSwitch
 * @text 실패/시간초과 시 ON 스위치
 * @type switch
 * @default 0
 * @desc 실패 또는 시간초과면 ON. 결과 변수만 쓰면 0 권장.
 *
 * @arg cancelSwitch
 * @text 취소 시 ON 스위치
 * @type switch
 * @default 0
 * @desc 취소키로 중단하면 ON. 결과 변수만 쓰면 0 권장.
 */

(() => {
    "use strict";

    const pluginName = "Akena_MG_MemoryCards";
    const RESULT_SUCCESS = 1;
    const RESULT_FAIL = 0;
    const RESULT_CANCEL = -1;
    const RESULT_ERROR = -2;
    const RESULT_NONE = -99;
    const START_NOTICE_FRAMES = 90;
    const START_COUNTDOWN_FRAMES = 180;
    const START_FLASH_FRAMES = 30;
    const START_TOTAL_FRAMES = START_NOTICE_FRAMES + START_COUNTDOWN_FRAMES + START_FLASH_FRAMES;
    const RESULT_WAIT_FRAMES = 120;
    const CARD_BACK_ICON_INDEX = 83;
    const START_NOTICE_TEXT = "3초 뒤 게임이 시작됩니다";
    const PAIR_COUNT_OPTIONS = [2, 4, 8, 16];
    const RESULT_MODES = ["variable", "switch", "both"];
    const FACE_POOL = [
        { faceName: "Actor1", faceIndex: 0 },
        { faceName: "Actor1", faceIndex: 1 },
        { faceName: "Actor1", faceIndex: 2 },
        { faceName: "Actor1", faceIndex: 3 },
        { faceName: "Actor1", faceIndex: 4 },
        { faceName: "Actor1", faceIndex: 5 },
        { faceName: "Actor1", faceIndex: 6 },
        { faceName: "Actor1", faceIndex: 7 },
        { faceName: "Actor2", faceIndex: 0 },
        { faceName: "Actor2", faceIndex: 1 },
        { faceName: "Actor2", faceIndex: 2 },
        { faceName: "Actor2", faceIndex: 3 },
        { faceName: "Actor2", faceIndex: 4 },
        { faceName: "Actor2", faceIndex: 5 },
        { faceName: "Actor2", faceIndex: 6 },
        { faceName: "Actor2", faceIndex: 7 }
    ];
    const RESULT_META = {
        [RESULT_SUCCESS]: { title: "성공!", color: () => ColorManager.textColor(14), subtext: () => "모든 카드를 맞췄습니다." },
        [RESULT_CANCEL]: { title: "중단", color: () => ColorManager.textColor(7), subtext: (score, pairCount) => `진행도 ${score}/${pairCount}` },
        [RESULT_FAIL]: { title: "실패", color: () => ColorManager.textColor(18), subtext: (score, pairCount) => `시간 초과  진행도 ${score}/${pairCount}` }
    };

    window.Akena = window.Akena || {};
    Akena.MGMemoryCards = Akena.MGMemoryCards || {};

    Akena.MGMemoryCards.state = {
        running: false,
        options: null,
        lastResult: null
    };

    const toNumber = (value, fallback) => {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    };

    const clamp = (value, min, max) => {
        return Math.max(min, Math.min(max, value));
    };

    const normalizePairCount = value => {
        const requested = toNumber(value, 8);
        return PAIR_COUNT_OPTIONS.includes(requested) ? requested : 8;
    };

    const normalizeResultMode = value => {
        return RESULT_MODES.includes(value) ? value : "variable";
    };

    const centeredRect = (width, height, y = Math.floor((Graphics.boxHeight - height) / 2)) => {
        const x = Math.floor((Graphics.boxWidth - width) / 2);
        return new Rectangle(x, y, width, height);
    };

    const resultMeta = resultCode => {
        return RESULT_META[resultCode] || RESULT_META[RESULT_FAIL];
    };

    const playResultSound = resultCode => {
        if (resultCode === RESULT_SUCCESS) {
            SoundManager.playRecovery();
        } else if (resultCode === RESULT_CANCEL) {
            SoundManager.playCancel();
        } else {
            SoundManager.playBuzzer();
        }
    };

    const setVariable = (variableId, value) => {
        if (variableId > 0) {
            $gameVariables.setValue(variableId, value);
        }
    };

    const setSwitch = (switchId, value) => {
        if (switchId > 0) {
            $gameSwitches.setValue(switchId, value);
        }
    };

    const ensureTempStore = () => {
        $gameTemp._AkenaMinigame = $gameTemp._AkenaMinigame || {};
        return $gameTemp._AkenaMinigame;
    };

    const makeOptions = args => {
        return {
            pairCount: normalizePairCount(args.pairCount),
            timeLimit: Math.max(0, toNumber(args.timeLimit, 60)),
            resultMode: normalizeResultMode(args.resultMode),
            resultVar: Math.max(0, toNumber(args.resultVar, 0)),
            scoreVar: Math.max(0, toNumber(args.scoreVar, 0)),
            successSwitch: Math.max(0, toNumber(args.successSwitch, 0)),
            failSwitch: Math.max(0, toNumber(args.failSwitch, 0)),
            cancelSwitch: Math.max(0, toNumber(args.cancelSwitch, 0))
        };
    };

    const finishMinigame = (resultCode, score) => {
        const state = Akena.MGMemoryCards.state;
        const options = state.options || {};
        const useVariables = options.resultMode !== "switch";
        const useSwitches = options.resultMode !== "variable";
        const result = {
            pluginName,
            type: "MemoryCards",
            resultCode,
            score: score || 0
        };

        if (useVariables) {
            setVariable(options.resultVar || 0, resultCode);
            setVariable(options.scoreVar || 0, score || 0);
        }
        if (useSwitches) {
            setSwitch(options.successSwitch || 0, resultCode === RESULT_SUCCESS);
            setSwitch(options.failSwitch || 0, resultCode === RESULT_FAIL || resultCode === RESULT_ERROR);
            setSwitch(options.cancelSwitch || 0, resultCode === RESULT_CANCEL);
        }

        ensureTempStore().lastResult = result;
        state.lastResult = result;
        state.running = false;
    };

    PluginManager.registerCommand(pluginName, "StartMemoryCards", function(args) {
        const options = makeOptions(args);
        const store = ensureTempStore();

        if (Akena.MGMemoryCards.state.running) {
            setVariable(options.resultVar, RESULT_ERROR);
            store.lastResult = {
                pluginName,
                type: "MemoryCards",
                resultCode: RESULT_ERROR,
                score: 0
            };
            return;
        }

        if (options.resultMode !== "switch") {
            setVariable(options.resultVar, RESULT_NONE);
            setVariable(options.scoreVar, 0);
        }
        Akena.MGMemoryCards.state.running = true;
        Akena.MGMemoryCards.state.options = options;
        store.lastResult = {
            pluginName,
            type: "MemoryCards",
            resultCode: RESULT_NONE,
            score: 0
        };

        SceneManager.push(Scene_AkenaMemoryCards);
        SceneManager.prepareNextScene(options);
        this.setWaitMode("akenaMGMemoryCards");
    });

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === "akenaMGMemoryCards") {
            const waiting = Akena.MGMemoryCards.state.running;
            if (!waiting) {
                this._waitMode = "";
            }
            return waiting;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    function Scene_AkenaMemoryCards() {
        this.initialize(...arguments);
    }

    Scene_AkenaMemoryCards.prototype = Object.create(Scene_Base.prototype);
    Scene_AkenaMemoryCards.prototype.constructor = Scene_AkenaMemoryCards;

    Scene_AkenaMemoryCards.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._options = null;
        this._remainingFrames = 0;
        this._resultDecided = false;
        this._resultWait = 0;
        this._resultCode = RESULT_NONE;
        this._cardWindowBaseX = 0;
        this._startWait = START_TOTAL_FRAMES;
        this._startedPlaying = false;
    };

    Scene_AkenaMemoryCards.prototype.prepare = function(options) {
        this._options = options;
        this._remainingFrames = options.timeLimit > 0 ? options.timeLimit * 60 : 0;
    };

    Scene_AkenaMemoryCards.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createInfoWindow();
        this.createCardWindow();
        this.createResultWindow();
        this.createCountdownWindow();
    };

    Scene_AkenaMemoryCards.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this._cardWindow.select(0);
        this._cardWindow.deactivate();
        this._countdownWindow.setCountText(START_NOTICE_TEXT);
        this._countdownWindow.show();
        this._countdownWindow.open();
    };

    Scene_AkenaMemoryCards.prototype.createBackground = function() {
        this._backSprite1 = this.createBattlebackSprite(1);
        this._backSprite2 = this.createBattlebackSprite(2);
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);

        const shade = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        shade.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, "rgba(0, 0, 0, 0.45)");
        this.addChild(shade);
        this._shadeSprite = shade;

        const flash = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        flash.opacity = 0;
        this.addChild(flash);
        this._flashSprite = flash;
    };

    Scene_AkenaMemoryCards.prototype.createBattlebackSprite = function(type) {
        const name = type === 1 ? $dataSystem.battleback1Name : $dataSystem.battleback2Name;
        const bitmap = type === 1 ? ImageManager.loadBattleback1(name) : ImageManager.loadBattleback2(name);
        const sprite = new Sprite(bitmap);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        bitmap.addLoadListener(() => {
            const scale = Math.max(Graphics.width / bitmap.width, Graphics.height / bitmap.height, 1);
            sprite.scale.x = scale;
            sprite.scale.y = scale;
        });
        return sprite;
    };

    Scene_AkenaMemoryCards.prototype.createInfoWindow = function() {
        const rect = new Rectangle(24, 18, Graphics.boxWidth - 48, 78);
        this._infoWindow = new Window_AkenaMemoryInfo(rect);
        this._infoWindow.setValues(this._remainingFrames, this._options.timeLimit, 0, this._options.pairCount);
        this.addWindow(this._infoWindow);
    };

    Scene_AkenaMemoryCards.prototype.createCardWindow = function() {
        const width = Math.min(Graphics.boxWidth - 72, 900);
        const height = Math.min(Graphics.boxHeight - 132, 560);
        const x = Math.floor((Graphics.boxWidth - width) / 2);
        const y = 112;
        const rect = new Rectangle(x, y, width, height);
        this._cardWindow = new Window_AkenaMemoryCards(rect, this._options.pairCount);
        this._cardWindowBaseX = x;
        this._cardWindow.setHandler("ok", this.onCardOk.bind(this));
        this._cardWindow.setHandler("cancel", this.onCardCancel.bind(this));
        this.addWindow(this._cardWindow);
    };

    Scene_AkenaMemoryCards.prototype.createResultWindow = function() {
        this._resultWindow = new Window_AkenaMemoryResult(centeredRect(420, 132));
        this._resultWindow.hide();
        this.addWindow(this._resultWindow);
    };

    Scene_AkenaMemoryCards.prototype.createCountdownWindow = function() {
        this._countdownWindow = new Window_AkenaMemoryCountdown(centeredRect(560, 132));
        this._countdownWindow.hide();
        this.addWindow(this._countdownWindow);
    };

    Scene_AkenaMemoryCards.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        this.updateStartCountdown();
        this.updateTimer();
        this.updateInfo();
        this.updateResultEffect();
    };

    Scene_AkenaMemoryCards.prototype.updateStartCountdown = function() {
        if (this._startedPlaying || this._resultDecided) {
            return;
        }

        this._startWait--;
        const changed = this._countdownWindow.setCountText(this.countdownText());
        if (changed && this._startWait <= START_COUNTDOWN_FRAMES + START_FLASH_FRAMES) {
            SoundManager.playCursor();
        }

        if (this._startWait <= 0) {
            this._startedPlaying = true;
            this._countdownWindow.close();
            this._cardWindow.activate();
            SoundManager.playOk();
        }
    };

    Scene_AkenaMemoryCards.prototype.countdownText = function() {
        if (this._startWait > START_COUNTDOWN_FRAMES + START_FLASH_FRAMES) {
            return START_NOTICE_TEXT;
        } else if (this._startWait > 120 + START_FLASH_FRAMES) {
            return "3";
        } else if (this._startWait > 60 + START_FLASH_FRAMES) {
            return "2";
        } else if (this._startWait > START_FLASH_FRAMES) {
            return "1";
        } else {
            return "START";
        }
    };

    Scene_AkenaMemoryCards.prototype.updateTimer = function() {
        if (!this._startedPlaying || this._resultDecided || this._options.timeLimit <= 0) {
            return;
        }
        this._remainingFrames--;
        if (this._remainingFrames <= 0) {
            this.finish(RESULT_FAIL);
        }
    };

    Scene_AkenaMemoryCards.prototype.updateInfo = function() {
        if (Graphics.frameCount % 10 === 0) {
            this._infoWindow.setValues(
                this._remainingFrames,
                this._options.timeLimit,
                this._cardWindow.matchedPairs(),
                this._options.pairCount
            );
        }
    };

    Scene_AkenaMemoryCards.prototype.updateResultEffect = function() {
        if (this._resultWait <= 0) {
            return;
        }

        this._resultWait--;
        this.updateFlashEffect();
        this.updateCardWindowEffect();

        if (this._resultWait <= 0) {
            this._flashSprite.opacity = 0;
            this._cardWindow.x = this._cardWindowBaseX;
            Akena.MGMemoryCards.state.running = false;
            this.popScene();
        }
    };

    Scene_AkenaMemoryCards.prototype.updateFlashEffect = function() {
        const color = this.resultFlashColor(this._resultCode);
        const opacity = Math.floor(150 * this._resultWait / 120);
        this._flashSprite.bitmap.clear();
        this._flashSprite.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, color);
        this._flashSprite.opacity = opacity;
    };

    Scene_AkenaMemoryCards.prototype.updateCardWindowEffect = function() {
        if (this._resultCode === RESULT_FAIL) {
            const power = Math.ceil(this._resultWait / 10);
            this._cardWindow.x = this._cardWindowBaseX + Math.sin(this._resultWait * 1.6) * power;
        } else if (this._resultCode === RESULT_CANCEL) {
            this._cardWindow.x = this._cardWindowBaseX;
            this._cardWindow.opacity = Math.max(120, this._cardWindow.opacity - 3);
            this._cardWindow.contentsOpacity = Math.max(120, this._cardWindow.contentsOpacity - 3);
        } else {
            this._cardWindow.x = this._cardWindowBaseX;
        }
    };

    Scene_AkenaMemoryCards.prototype.resultFlashColor = function(resultCode) {
        if (resultCode === RESULT_SUCCESS) {
            return "rgba(255, 232, 120, 1)";
        } else if (resultCode === RESULT_CANCEL) {
            return "rgba(170, 180, 190, 1)";
        } else {
            return "rgba(190, 40, 40, 1)";
        }
    };

    Scene_AkenaMemoryCards.prototype.onCardOk = function() {
        if (!this._startedPlaying || this._resultDecided) {
            return;
        }
        const completed = this._cardWindow.openSelectedCard();
        if (completed) {
            this.finish(RESULT_SUCCESS);
        } else {
            this._cardWindow.activate();
        }
    };

    Scene_AkenaMemoryCards.prototype.onCardCancel = function() {
        if (!this._resultDecided) {
            this.finish(RESULT_CANCEL);
        }
    };

    Scene_AkenaMemoryCards.prototype.finish = function(resultCode) {
        const score = this._cardWindow.matchedPairs();
        this._resultDecided = true;
        this._resultCode = resultCode;
        this._resultWait = RESULT_WAIT_FRAMES;
        this._cardWindow.deactivate();
        if (this._countdownWindow) {
            this._countdownWindow.close();
        }
        finishMinigame(resultCode, score);
        Akena.MGMemoryCards.state.running = true;
        playResultSound(resultCode);
        this._resultWindow.setResult(resultCode, score, this._options.pairCount);
        this._resultWindow.show();
        this._resultWindow.open();
    };

    Scene_AkenaMemoryCards.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        if (Akena.MGMemoryCards.state.running && !this._resultDecided) {
            finishMinigame(RESULT_CANCEL, this._cardWindow ? this._cardWindow.matchedPairs() : 0);
        } else if (Akena.MGMemoryCards.state.running && this._resultDecided) {
            Akena.MGMemoryCards.state.running = false;
        }
    };

    function Window_AkenaMemoryInfo() {
        this.initialize(...arguments);
    }

    Window_AkenaMemoryInfo.prototype = Object.create(Window_Base.prototype);
    Window_AkenaMemoryInfo.prototype.constructor = Window_AkenaMemoryInfo;

    Window_AkenaMemoryInfo.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._remainingFrames = 0;
        this._timeLimit = 0;
        this._matchedPairs = 0;
        this._pairCount = 0;
    };

    Window_AkenaMemoryInfo.prototype.setValues = function(remainingFrames, timeLimit, matchedPairs, pairCount) {
        const oldText = this.valueText();
        this._remainingFrames = remainingFrames;
        this._timeLimit = timeLimit;
        this._matchedPairs = matchedPairs;
        this._pairCount = pairCount;
        if (oldText !== this.valueText()) {
            this.refresh();
        }
    };

    Window_AkenaMemoryInfo.prototype.valueText = function() {
        return `${this.timeText()}|${this._matchedPairs}|${this._pairCount}`;
    };

    Window_AkenaMemoryInfo.prototype.timeText = function() {
        if (this._timeLimit <= 0) {
            return "무제한";
        }
        return String(Math.max(0, Math.ceil(this._remainingFrames / 60)));
    };

    Window_AkenaMemoryInfo.prototype.refresh = function() {
        this.contents.clear();
        this.changeTextColor(ColorManager.systemColor());
        this.drawText("카드 짝맞추기", 0, 0, 260, "left");
        this.resetTextColor();
        this.drawText(`시간 ${this.timeText()}초`, 270, 0, 180, "left");
        this.drawText(`성공 ${this._matchedPairs}/${this._pairCount}`, 470, 0, 180, "left");
        this.changeTextColor(ColorManager.textColor(6));
        this.drawText("방향키: 이동 / 결정: 뒤집기 / 취소: 중단", 680, 0, this.innerWidth - 680, "right");
        this.resetTextColor();
    };

    function Window_AkenaMemoryResult() {
        this.initialize(...arguments);
    }

    Window_AkenaMemoryResult.prototype = Object.create(Window_Base.prototype);
    Window_AkenaMemoryResult.prototype.constructor = Window_AkenaMemoryResult;

    Window_AkenaMemoryResult.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._resultCode = RESULT_NONE;
        this._score = 0;
        this._pairCount = 0;
    };

    Window_AkenaMemoryResult.prototype.setResult = function(resultCode, score, pairCount) {
        this._resultCode = resultCode;
        this._score = score;
        this._pairCount = pairCount;
        this.refresh();
    };

    Window_AkenaMemoryResult.prototype.refresh = function() {
        this.contents.clear();
        this.contents.fontSize = 34;
        this.changeTextColor(this.resultColor());
        this.drawText(this.resultTitle(), 0, 10, this.innerWidth, "center");
        this.resetFontSettings();
        this.changeTextColor(ColorManager.normalColor());
        this.drawText(this.resultSubtext(), 0, 66, this.innerWidth, "center");
        this.resetTextColor();
    };

    Window_AkenaMemoryResult.prototype.resultTitle = function() {
        return resultMeta(this._resultCode).title;
    };

    Window_AkenaMemoryResult.prototype.resultSubtext = function() {
        return resultMeta(this._resultCode).subtext(this._score, this._pairCount);
    };

    Window_AkenaMemoryResult.prototype.resultColor = function() {
        return resultMeta(this._resultCode).color();
    };

    function Window_AkenaMemoryCountdown() {
        this.initialize(...arguments);
    }

    Window_AkenaMemoryCountdown.prototype = Object.create(Window_Base.prototype);
    Window_AkenaMemoryCountdown.prototype.constructor = Window_AkenaMemoryCountdown;

    Window_AkenaMemoryCountdown.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._countText = "";
    };

    Window_AkenaMemoryCountdown.prototype.setCountText = function(text) {
        if (this._countText !== text) {
            this._countText = text;
            this.refresh();
            return true;
        }
        return false;
    };

    Window_AkenaMemoryCountdown.prototype.refresh = function() {
        this.contents.clear();
        let fontSize = 58;
        if (this._countText === START_NOTICE_TEXT) {
            fontSize = 30;
        } else if (this._countText === "START") {
            fontSize = 42;
        } else {
            fontSize = 58;
        }
        this.contents.fontSize = fontSize;
        this.contents.textColor = ColorManager.textColor(14);
        this.contents.drawText(this._countText, 0, 0, this.innerWidth, this.innerHeight, "center");
        this.resetFontSettings();
    };

    function Window_AkenaMemoryCards() {
        this.initialize(...arguments);
    }

    Window_AkenaMemoryCards.prototype = Object.create(Window_Selectable.prototype);
    Window_AkenaMemoryCards.prototype.constructor = Window_AkenaMemoryCards;

    Window_AkenaMemoryCards.prototype.initialize = function(rect, pairCount) {
        this._pairCount = pairCount;
        this._cards = [];
        this._openedIndexes = [];
        this._matchedPairs = 0;
        this._mismatchWait = 0;
        this._cols = pairCount <= 8 ? 4 : 8;
        Window_Selectable.prototype.initialize.call(this, rect);
        this.makeCards();
        this.refresh();
    };

    Window_AkenaMemoryCards.prototype.maxCols = function() {
        return this._cols;
    };

    Window_AkenaMemoryCards.prototype.maxItems = function() {
        return this._cards.length;
    };

    Window_AkenaMemoryCards.prototype.itemWidth = function() {
        return this.cardSize();
    };

    Window_AkenaMemoryCards.prototype.itemHeight = function() {
        return this.cardSize();
    };

    Window_AkenaMemoryCards.prototype.colSpacing = function() {
        return 24;
    };

    Window_AkenaMemoryCards.prototype.rowSpacing = function() {
        return 16;
    };

    Window_AkenaMemoryCards.prototype.cardSize = function() {
        const cols = this.maxCols();
        const rows = Math.max(1, Math.ceil(this.maxItems() / cols));
        const fitWidth = Math.floor((this.innerWidth - this.colSpacing() * (cols - 1)) / cols);
        const fitHeight = Math.floor((this.innerHeight - this.rowSpacing() * (rows - 1)) / rows);
        return Math.max(64, Math.min(fitWidth, fitHeight, 132));
    };

    Window_AkenaMemoryCards.prototype.boardWidth = function() {
        return this.maxCols() * this.cardSize() + (this.maxCols() - 1) * this.colSpacing();
    };

    Window_AkenaMemoryCards.prototype.boardHeight = function() {
        const rows = Math.max(1, Math.ceil(this.maxItems() / this.maxCols()));
        return rows * this.cardSize() + (rows - 1) * this.rowSpacing();
    };

    Window_AkenaMemoryCards.prototype.itemRect = function(index) {
        const cols = this.maxCols();
        const size = this.cardSize();
        const col = index % cols;
        const row = Math.floor(index / cols);
        const baseX = Math.floor((this.innerWidth - this.boardWidth()) / 2);
        const baseY = Math.floor((this.innerHeight - this.boardHeight()) / 2);
        const x = baseX + col * (size + this.colSpacing()) - this.scrollBaseX();
        const y = baseY + row * (size + this.rowSpacing()) - this.scrollBaseY();
        return new Rectangle(x, y, size, size);
    };

    Window_AkenaMemoryCards.prototype.itemRectWithPadding = function(index) {
        const rect = this.itemRect(index);
        rect.pad(-2, -2);
        return rect;
    };

    Window_AkenaMemoryCards.prototype.matchedPairs = function() {
        return this._matchedPairs;
    };

    Window_AkenaMemoryCards.prototype.select = function(index) {
        const lastIndex = this.index();
        Window_Selectable.prototype.select.call(this, index);
        if (lastIndex !== index) {
            this.redrawItem(lastIndex);
            this.redrawItem(index);
        }
    };

    Window_AkenaMemoryCards.prototype.refreshCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
    };

    Window_AkenaMemoryCards.prototype.clearItem = function(index) {
        if (index < 0) {
            return;
        }
        const rect = this.itemRectWithPadding(index);
        this.contents.clearRect(rect.x - 8, rect.y - 8, rect.width + 16, rect.height + 16);
        this.contentsBack.clearRect(rect.x - 8, rect.y - 8, rect.width + 16, rect.height + 16);
    };

    Window_AkenaMemoryCards.prototype.makeCards = function() {
        const sourceCards = [];
        for (let i = 0; i < this._pairCount; i++) {
            const face = FACE_POOL[i % FACE_POOL.length];
            const faceName = face.faceName;
            const faceIndex = face.faceIndex;
            sourceCards.push({ pairId: i, faceName, faceIndex });
            sourceCards.push({ pairId: i, faceName, faceIndex });
        }
        this._cards = this.shuffleCards(sourceCards).map(card => {
            return {
                pairId: card.pairId,
                faceName: card.faceName,
                faceIndex: card.faceIndex,
                opened: false,
                matched: false
            };
        });
    };

    Window_AkenaMemoryCards.prototype.shuffleCards = function(cards) {
        const result = cards.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        return result;
    };

    Window_AkenaMemoryCards.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateMismatchWait();
    };

    Window_AkenaMemoryCards.prototype.updateMismatchWait = function() {
        if (this._mismatchWait <= 0) {
            return;
        }
        this._mismatchWait--;
        if (this._mismatchWait === 0) {
            for (const index of this._openedIndexes) {
                if (this._cards[index] && !this._cards[index].matched) {
                    this._cards[index].opened = false;
                    this.redrawItem(index);
                }
            }
            this._openedIndexes = [];
            this.activate();
        }
    };

    Window_AkenaMemoryCards.prototype.isCurrentItemEnabled = function() {
        const card = this._cards[this.index()];
        return !!card && !card.opened && !card.matched && this._mismatchWait <= 0;
    };

    Window_AkenaMemoryCards.prototype.openSelectedCard = function() {
        const index = this.index();
        const card = this._cards[index];
        if (!card || card.opened || card.matched || this._mismatchWait > 0) {
            SoundManager.playBuzzer();
            return false;
        }

        SoundManager.playOk();
        card.opened = true;
        this._openedIndexes.push(index);
        this.redrawItem(index);

        if (this._openedIndexes.length >= 2) {
            this.checkOpenedPair();
        }
        return this._matchedPairs >= this._pairCount;
    };

    Window_AkenaMemoryCards.prototype.checkOpenedPair = function() {
        const firstIndex = this._openedIndexes[0];
        const secondIndex = this._openedIndexes[1];
        const first = this._cards[firstIndex];
        const second = this._cards[secondIndex];

        if (first && second && first.pairId === second.pairId) {
            first.matched = true;
            second.matched = true;
            this._openedIndexes = [];
            this._matchedPairs++;
            this.redrawItem(firstIndex);
            this.redrawItem(secondIndex);
            SoundManager.playRecovery();
        } else {
            this.deactivate();
            this._mismatchWait = 45;
            SoundManager.playBuzzer();
        }
    };

    Window_AkenaMemoryCards.prototype.drawItem = function(index) {
        const card = this._cards[index];
        const rect = this.itemRectWithPadding(index);
        const x = rect.x;
        const y = rect.y;
        const w = rect.width;
        const h = rect.height;

        this.contents.clearRect(x - 2, y - 2, w + 4, h + 4);
        this.drawCardFrame(x, y, w, h, card);
        if (card.opened || card.matched) {
            this.drawCardFace(x, y, w, h, card);
        } else {
            this.drawCardBack(x, y, w, h);
        }
        this.drawSelectionFrame(index, x, y, w, h);
    };

    Window_AkenaMemoryCards.prototype.drawCardFrame = function(x, y, width, height, card) {
        const borderColor = card.matched ? ColorManager.textColor(24) : "rgba(255, 255, 255, 0.72)";
        this.contents.fillRect(x, y, width, height, "rgba(16, 18, 24, 0.95)");
        this.contents.strokeRect(x, y, width, height, borderColor);
        this.contents.strokeRect(x + 2, y + 2, width - 4, height - 4, "rgba(0, 0, 0, 0.65)");
    };

    Window_AkenaMemoryCards.prototype.drawSelectionFrame = function(index, x, y, width, height) {
        if (index !== this.index()) {
            return;
        }
        const color1 = ColorManager.textColor(14);
        const color2 = "rgba(255, 255, 255, 0.95)";
        this.contents.strokeRect(x - 4, y - 4, width + 8, height + 8, color1);
        this.contents.strokeRect(x - 2, y - 2, width + 4, height + 4, color2);
        this.contents.strokeRect(x + 2, y + 2, width - 4, height - 4, color1);
    };

    Window_AkenaMemoryCards.prototype.drawCardBack = function(x, y, width, height) {
        const pad = 8;
        this.contents.gradientFillRect(
            x + pad,
            y + pad,
            width - pad * 2,
            height - pad * 2,
            "rgba(43, 53, 73, 1)",
            "rgba(15, 18, 28, 1)",
            true
        );
        this.drawBackIcon(x, y, width, height);
    };

    Window_AkenaMemoryCards.prototype.drawBackIcon = function(x, y, width, height) {
        const bitmap = ImageManager.loadSystem("IconSet");
        const iconWidth = ImageManager.iconWidth;
        const iconHeight = ImageManager.iconHeight;
        const iconCols = 16;
        const sx = (CARD_BACK_ICON_INDEX % iconCols) * iconWidth;
        const sy = Math.floor(CARD_BACK_ICON_INDEX / iconCols) * iconHeight;
        const drawSize = Math.floor(Math.min(width, height) * 0.45);
        const dx = x + Math.floor((width - drawSize) / 2);
        const dy = y + Math.floor((height - drawSize) / 2);

        bitmap.addLoadListener(() => {
            this.contents.blt(bitmap, sx, sy, iconWidth, iconHeight, dx, dy, drawSize, drawSize);
        });
    };

    Window_AkenaMemoryCards.prototype.drawCardFace = function(x, y, width, height, card) {
        const bitmap = ImageManager.loadFace(card.faceName);
        const faceWidth = ImageManager.faceWidth;
        const faceHeight = ImageManager.faceHeight;
        const sx = (card.faceIndex % 4) * faceWidth;
        const sy = Math.floor(card.faceIndex / 4) * faceHeight;
        const pad = 6;
        const drawWidth = width - pad * 2;
        const drawHeight = height - pad * 2;

        bitmap.addLoadListener(() => {
            this.contents.blt(bitmap, sx, sy, faceWidth, faceHeight, x + pad, y + pad, drawWidth, drawHeight);
            if (card.matched) {
                this.contents.fillRect(x + pad, y + pad, drawWidth, drawHeight, "rgba(255, 255, 255, 0.18)");
            }
        });
    };
})();
