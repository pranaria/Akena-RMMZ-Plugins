//=============================================================================
// RPG Maker MZ - Akena_BattleHitBalloon
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 전투 중 피격 시 액터 위에 말풍선 이펙트를 표시합니다.
 * @author Akena with Claude
 *
 * @param balloonType
 * @text 말풍선 종류
 * @desc 피격 시 표시할 말풍선을 선택하세요.
 * @type select
 * @option ① ! (충격)
 * @value 1
 * @option ② ? (물음표)
 * @value 2
 * @option ③ 음표
 * @value 3
 * @option ④ 하트
 * @value 4
 * @option ⑤ 분노 (십자)
 * @value 5
 * @option ⑥ 땀방울
 * @value 6
 * @option ⑦ 소용돌이
 * @value 7
 * @option ⑧ ...
 * @value 8
 * @option ⑨ 전구
 * @value 9
 * @option ⑩ ZZZ
 * @value 10
 * @default 1
 *
 * @param scale
 * @text 크기 배율
 * @desc 말풍선 크기 배율 (1.0 = 기본 48px)
 * @type number
 * @decimals 1
 * @min 0.5
 * @max 5.0
 * @default 2.0
 *
 * @param offsetX
 * @text X 오프셋
 * @desc 액터 위치로부터 수평 오프셋 (픽셀)
 * @type number
 * @min -300
 * @max 300
 * @default 0
 *
 * @param offsetY
 * @text Y 오프셋
 * @desc 기본 위치로부터 수직 오프셋 (픽셀, 음수=위로)
 * @type number
 * @min -300
 * @max 300
 * @default 0
 *
 * @param framesPerPattern
 * @text 패턴당 프레임 수
 * @desc 말풍선 한 패턴이 표시되는 프레임 수 (값이 클수록 느림)
 * @type number
 * @min 1
 * @max 30
 * @default 8
 *
 * @help
 * BattleHitBalloon.js
 *
 * 전투 중 몬스터에게 피격 당할 때 액터 위에 말풍선 이펙트를 표시합니다.
 * img/system/Balloon.png를 사용하므로 추가 이미지 제작이 필요 없습니다.
 *
 * 말풍선은 8프레임 애니메이션 후 자동으로 사라집니다.
 * 크기와 위치는 플러그인 파라미터로 조정 가능합니다.
 *
 * 다른 플러그인의 소스를 직접 수정하지 않습니다.
 */

(() => {
    'use strict';

    const PLUGIN_NAME = "Akena_BattleHitBalloon";
    const params = PluginManager.parameters(PLUGIN_NAME);

    const BALLOON_TYPE       = Number(params.balloonType      || 1);
    const SCALE              = Number(params.scale            || 2.0);
    const OFFSET_X           = Number(params.offsetX          || 0);
    const OFFSET_Y           = Number(params.offsetY          || 0);
    const FRAMES_PER_PATTERN = Number(params.framesPerPattern || 8);

    const BALLOON_CELL_SIZE   = 48;
    const BALLOON_TOTAL_FRAMES = 8;

    //=========================================================================
    // Sprite_BattleHitBalloon
    // 피격 시 액터 위에 표시되는 말풍선 스프라이트
    //=========================================================================

    class Sprite_BattleHitBalloon extends Sprite {
        constructor(balloonType, targetSprite) {
            super();
            this._balloonType   = balloonType;
            this._targetSprite  = targetSprite;
            this._frameIndex    = 0;
            this._frameTimer    = 0;
            this.anchor.set(0.5, 1.0);
            this.scale.set(SCALE);
            this.bitmap = ImageManager.loadSystem("Balloon");
            this.updatePosition();
            this.updateFrame();
        }

        update() {
            super.update();
            this.updatePosition();
            this.updateAnimation();
            this.updateFrame();
        }

        updatePosition() {
            if (this._targetSprite) {
                this.x = this._targetSprite.x + OFFSET_X;
                this.y = this._targetSprite.y - 100 + OFFSET_Y;
            }
        }

        updateAnimation() {
            this._frameTimer++;
            if (this._frameTimer >= FRAMES_PER_PATTERN) {
                this._frameTimer = 0;
                this._frameIndex++;
            }
        }

        updateFrame() {
            const frameIndex = Math.min(this._frameIndex, BALLOON_TOTAL_FRAMES - 1);
            const sx = frameIndex * BALLOON_CELL_SIZE;
            const sy = (this._balloonType - 1) * BALLOON_CELL_SIZE;
            this.setFrame(sx, sy, BALLOON_CELL_SIZE, BALLOON_CELL_SIZE);
        }

        isPlaying() {
            return this._frameIndex < BALLOON_TOTAL_FRAMES;
        }
    }

    //=========================================================================
    // Game_Actor
    // 피격 말풍선 요청 플래그 관리
    //=========================================================================

    const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._hitBalloonRequested = false;
    };

    Game_Actor.prototype.requestHitBalloon = function() {
        this._hitBalloonRequested = true;
    };

    Game_Actor.prototype.isHitBalloonRequested = function() {
        return this._hitBalloonRequested;
    };

    Game_Actor.prototype.clearHitBalloonRequest = function() {
        this._hitBalloonRequested = false;
    };

    //=========================================================================
    // Game_Battler
    // 실제 대미지 발생 시 말풍선 요청
    //=========================================================================

    const _Game_Battler_onDamage = Game_Battler.prototype.onDamage;
    Game_Battler.prototype.onDamage = function(value) {
        _Game_Battler_onDamage.call(this, value);
        if (this.isActor()) {
            this.requestHitBalloon();
        }
    };

    //=========================================================================
    // Spriteset_Battle
    // 말풍선 스프라이트 생성 및 라이프사이클 관리
    //=========================================================================

    const _Spriteset_Battle_createBattleField = Spriteset_Battle.prototype.createBattleField;
    Spriteset_Battle.prototype.createBattleField = function() {
        _Spriteset_Battle_createBattleField.call(this);
        this._hitBalloonSprites = [];
    };

    const _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        this.updateHitBalloons();
    };

    Spriteset_Battle.prototype.updateHitBalloons = function() {
        if (!this._actorSprites) return;

        // 새 말풍선 요청 확인
        for (const actorSprite of this._actorSprites) {
            const actor = actorSprite._actor;
            if (actor && actor.isHitBalloonRequested()) {
                actor.clearHitBalloonRequest();
                this.createHitBalloon(actorSprite);
            }
        }

        // 재생 완료된 말풍선 제거
        this._hitBalloonSprites = this._hitBalloonSprites.filter(balloon => {
            if (!balloon.isPlaying()) {
                this._battleField.removeChild(balloon);
                return false;
            }
            return true;
        });
    };

    Spriteset_Battle.prototype.createHitBalloon = function(actorSprite) {
        const balloon = new Sprite_BattleHitBalloon(BALLOON_TYPE, actorSprite);
        this._battleField.addChild(balloon);
        this._hitBalloonSprites.push(balloon);
    };

})();
