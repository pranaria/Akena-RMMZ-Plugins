//=============================================================================
// Akena_EnemyIdleFloat.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.1] 전투 중 몬스터에게 상하 부유 애니메이션 적용 <Akena_EnemyIdleFloat>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_EnemyIdleFloat - 몬스터 아이들 부유 애니메이션
 * ============================================================
 * [개요]
 * 전투 화면에서 몬스터 스프라이트에 사인파 기반의 상하 부유(float)
 * 애니메이션을 적용합니다. 액터의 아이들 모션과 유사한 생동감을 줍니다.
 *
 * [사용법]
 * 플러그인을 적용하면 자동으로 전투 내 모든 몬스터에 적용됩니다.
 * yAmount와 speed 파라미터로 움직임의 크기와 속도를 조정하세요.
 *
 * [랜덤 위상(RandomPhase)]
 * true로 설정하면 각 몬스터가 서로 다른 타이밍에 움직여
 * 더 자연스러운 느낌을 줍니다.
 * false이면 모든 몬스터가 동시에 같은 방향으로 움직입니다.
 *
 * [주의사항]
 * - 사이드뷰 / 프론트뷰 모두 동작합니다.
 * - 사망한 몬스터에는 애니메이션이 적용되지 않습니다.
 *
 * @param yAmount
 * @text Y 이동량 (픽셀)
 * @type number
 * @decimals 1
 * @default 2
 * @desc 위아래로 움직이는 최대 픽셀 수 (권장: 1 ~ 4)
 *
 * @param speed
 * @text 속도
 * @type number
 * @decimals 3
 * @default 0.03
 * @desc 부유 속도. 낮을수록 느리게 (권장: 0.02 ~ 0.06)
 *
 * @param RandomPhase
 * @text 랜덤 위상
 * @type boolean
 * @default true
 * @desc true: 몬스터마다 움직임 타이밍이 달라짐 / false: 동시에 같은 방향
 */

(() => {
    "use strict";

    const pluginName = "Akena_EnemyIdleFloat";
    const params = PluginManager.parameters(pluginName);

    const Y_AMOUNT   = Number(params.yAmount)              || 2;
    const SPEED      = Number(params.speed)                || 0.03;
    const RAND_PHASE = params.RandomPhase !== "false";

    //-------------------------------------------------------------------------
    // Sprite_Enemy.prototype.initMembers
    // 스프라이트 초기화 시 각 몬스터에 랜덤 위상 오프셋 부여
    //-------------------------------------------------------------------------
    const _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._floatTimer = RAND_PHASE
            ? Math.random() * Math.PI * 2  // 랜덤 위상 (Akena_BattleIdle 동일 방식)
            : 0;                            // 고정 위상
    };

    //-------------------------------------------------------------------------
    // Sprite_Enemy.prototype.update
    // update 훅 이후 y에 사인파 오프셋을 적용
    // updatePosition 내부가 아닌 update 단계에서 처리해야
    // 자식 스프라이트(상태 아이콘 등)와의 렌더링 충돌이 없음
    //-------------------------------------------------------------------------
    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        if (this._battler && this._battler.isAlive()) {
            this._floatTimer += SPEED;
            this.y -= Math.round(Math.sin(this._floatTimer) * Y_AMOUNT);
        }
    };

})();
