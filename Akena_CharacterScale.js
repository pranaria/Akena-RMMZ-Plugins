//=============================================================================
// Akena_CharacterScale.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0] 크기(%) 하나로 기본 인물 이미지를 일괄 확대·축소 <Akena_CharacterScale>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_CharacterScale - 인물 크기 조절
 * ============================================================
 * [사용법]
 * 1. 플러그인 관리자에 추가하고 ON으로 설정합니다.
 * 2. 크기(%)만 변경합니다. 기본값은 150%입니다.
 *    100 = 원래 크기 / 150 = 1.5배 / 75 = 0.75배
 * 3. 플레이테스트를 다시 실행하면 적용됩니다.
 *
 * [적용 이미지]
 * 기본 등록: Actor1~3, People1~4, SF_Actor1~3, SF_People1~2.
 * 등록된 파일을 사용하는 맵의 주인공, 동료, NPC에 모두 적용됩니다.
 * 새 인물 이미지는 적용 이미지 목록에 한 번만 추가하세요.
 * NPC별 메모, 주석, 플러그인 커맨드는 필요하지 않습니다.
 * 목록을 비우면 아무 이미지에도 적용하지 않습니다.
 *
 * [주의사항]
 * - 가로·세로를 같은 비율로 조절하며 발의 기준 위치를 유지합니다.
 * - 원본 이미지, 이동·통행·이벤트 판정은 변경하지 않습니다.
 * - 목록에 없는 문, 상자, 몬스터, 탈것과 타일 그래픽은 확대하지 않습니다.
 * - 얼굴, 메뉴, 전투 화면의 이미지는 변경하지 않습니다.
 * - Evil, Damage, 생성기로 만든 이미지 등은 필요할 때 목록에 추가하세요.
 * - 목록에 추가한 파일은 그 안의 모든 캐릭터에 같은 배율이 적용됩니다.
 * - 큰 배율에서는 벽·문 겹침과 도트 품질 저하가 나타날 수 있습니다.
 * - 풍선 위치, 수풀 깊이, 애니메이션 위치의 추가 보정은 하지 않습니다.
 * - Sprite_Character.updateBitmap 뒤에 표시 배율을 적용합니다.
 *   같은 스프라이트의 배율을 바꾸는 다른 플러그인과 충돌할 수 있습니다.
 * - 파일명은 Akena_CharacterScale.js를 유지하세요.
 *
 * @param ScalePercent
 * @text 크기(%)
 * @type number
 * @min 1
 * @decimals 0
 * @default 150
 * @desc 100: 원래 크기 / 150: 1.5배 / 75: 0.75배. 가로·세로에 같은 비율을 적용합니다.
 *
 * @param CharacterImages
 * @text 적용 이미지 목록
 * @type file[]
 * @dir img/characters
 * @default ["Actor1","Actor2","Actor3","People1","People2","People3","People4","SF_Actor1","SF_Actor2","SF_Actor3","SF_People1","SF_People2"]
 * @desc 기본 인물 파일이 등록되어 있습니다. 새 인물 이미지를 사용할 때만 목록에 추가하세요.
 */

(() => {
    "use strict";

    const pluginName = "Akena_CharacterScale";
    const params = PluginManager.parameters(pluginName);
    const defaultImages = ["Actor1","Actor2","Actor3","People1","People2","People3","People4","SF_Actor1","SF_Actor2","SF_Actor3","SF_People1","SF_People2"];

    // 잘못된 설정은 기본값으로 처리하되, 빈 목록([])은 그대로 유지합니다.
    const percent = Number(params.ScalePercent);
    let images = defaultImages;
    try {
        const parsed = JSON.parse(params.CharacterImages || "null");
        if (Array.isArray(parsed)) {
            images = parsed.filter(name => typeof name === "string" && name);
        }
    } catch {
        // 목록 형식이 손상된 경우 기본 인물 목록을 사용합니다.
    }

    window.Akena = window.Akena || {};
    const settings = window.Akena.CharacterScale = {
        scale: Number.isFinite(percent) && percent > 0 ? percent / 100 : 1.5,
        images: new Set(images)
    };

    // 이미지가 바뀌면 적용 여부도 즉시 반영하고, 비대상 이미지는 100%로 복원합니다.
    const _Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
    Sprite_Character.prototype.updateBitmap = function(...args) {
        const result = _Sprite_Character_updateBitmap.call(this, ...args);
        const scale = this._tileId === 0 && settings.images.has(this._characterName)
            ? settings.scale
            : 1;
        this.scale.set(scale, scale);
        return result;
    };
})();
