//=============================================================================
// Akena_SideviewActorPosition.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0] 사이드뷰 전투 액터 위치를 해상도 기반으로 동적 설정 <Akena_SideviewActorPosition>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_SideviewActorPosition - 사이드뷰 액터 위치 조정
 * ============================================================
 * [개요]
 * 기본 RMMZ의 사이드뷰 전투 액터 위치(600, 280)는 하드코딩되어 있습니다.
 * 이 플러그인은 게임 해상도(Graphics.boxWidth / boxHeight)를 기준으로
 * 액터 위치를 동적으로 계산하여 어떤 해상도에서도 자연스럽게 배치합니다.
 *
 * [사용법]
 * 1. 플러그인을 적용하면 자동으로 동작합니다.
 * 2. BaseX/BaseY 비율을 조정해 원하는 위치로 이동시킵니다.
 *    - BaseX: 1.0 = 화면 우측 끝 / 0.0 = 화면 좌측 끝
 *    - BaseY: 1.0 = 화면 하단 끝 / 0.0 = 화면 상단 끝
 * 3. StepX/StepY는 액터 간 간격 (픽셀 단위 고정값).
 *
 * [주의사항]
 * - 사이드뷰 전투(Side Battle)에서만 유효합니다.
 * - 액터 수에 따라 StepY를 조정하면 겹침 방지 가능합니다.
 *
 * @param BaseX
 * @text 기준 X 비율
 * @type number
 * @decimals 2
 * @min 0.00
 * @max 1.00
 * @default 0.78
 * @desc 화면 가로 폭 대비 액터 기준 X 위치 비율 (0.0 ~ 1.0)
 *
 * @param BaseY
 * @text 기준 Y 비율
 * @type number
 * @decimals 2
 * @min 0.00
 * @max 1.00
 * @default 0.45
 * @desc 화면 세로 높이 대비 액터 기준 Y 위치 비율 (0.0 ~ 1.0)
 *
 * @param StepX
 * @text X 간격 (픽셀)
 * @type number
 * @min -200
 * @max 200
 * @default 32
 * @desc 액터 인덱스당 X 좌표 간격 (픽셀)
 *
 * @param StepY
 * @text Y 간격 (픽셀)
 * @type number
 * @min -200
 * @max 200
 * @default 48
 * @desc 액터 인덱스당 Y 좌표 간격 (픽셀)
 */

(() => {
    "use strict";

    const pluginName = "Akena_SideviewActorPosition";
    const params = PluginManager.parameters(pluginName);

    const BASE_X  = Number(params.BaseX)  || 0.78;
    const BASE_Y  = Number(params.BaseY)  || 0.45;
    const STEP_X  = Number(params.StepX)  || 32;
    const STEP_Y  = Number(params.StepY)  || 48;

    //-------------------------------------------------------------------------
    // Sprite_Actor.prototype.setActorHome
    // 기본값: this.setHome(600 + index * 32, 280 + index * 48)
    // → 해상도 기반 동적 계산으로 교체
    //-------------------------------------------------------------------------
    const _Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
    Sprite_Actor.prototype.setActorHome = function(index) {
        const baseX = Math.floor(Graphics.boxWidth  * BASE_X) + index * STEP_X;
        const baseY = Math.floor(Graphics.boxHeight * BASE_Y) + index * STEP_Y;
        this.setHome(baseX, baseY);
    };

})();
