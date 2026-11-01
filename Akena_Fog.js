//=============================================================================
// Akena_Fog.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 전체 방향·손전등을 선택하는 맵별 시야 제한 <Akena_Fog>
 * @author Akena
 *
 * @help
 * Akena_Fog — 단순 포그 시스템
 *
 * [사용법]
 * 1. 플러그인을 켭니다. 별도 이미지는 필요하지 않습니다.
 * 2. 적용할 맵의 메모에 <AkenaFog>를 입력합니다.
 * 3. 표시 방식을 전체 방향 또는 바라보는 방향(손전등)으로 선택합니다.
 * 4. 시야 반경(타일)과 외곽 어둡기를 플러그인 관리자에서 조절합니다.
 * 태그가 없는 맵은 자동 해제됩니다. 설정 변경 후 게임을 재시작하세요.
 *
 * [범위]
 * 플레이어 발 위치에서 반 타일 위를 중심으로 주변만 보여줍니다.
 * 가까운 곳은 밝게 유지하고 멀어질수록 100→85→60→30→10%로 어두워집니다.
 * 예: 반경5타일이면 거리1/2/3/4/5타일의 밝기 기준입니다.
 * 반경 끝은 희미하게 보이고, 그 바깥0.5타일에서 부드럽게 완전히 가립니다.
 * 밝기는 원본 맵 대비 기준이며 외곽 어둡기255일 때 적용됩니다.
 * 전체 방향은 원형 시야, 손전등은 플레이어의 상하좌우 방향을 비춥니다.
 * 손전등은 발밑의 약한 시야를 남기며 가장자리도 부드럽게 어두워집니다.
 * 방향 전환 시 빛은 약0.13초(60fps 기준) 동안 짧게 회전합니다.
 * 회전 중 다시 방향을 바꾸면 현재 빛 각도에서 새 방향으로 이어집니다.
 * 빛의 폭과 발밑 시야는 자동 설정됩니다. 별도 각도·이미지 설정은 없습니다.
 * 탐험 기록·벽 차단·문 판정은 없습니다. 빛 범위 안이면 벽 너머도 보입니다.
 * 외곽 어둡기 255는 완전 은폐, 낮은 값은 배경이 비치는 연출입니다.
 * 메뉴·대화창·선택지·터치 메뉴 버튼은 가리지 않습니다.
 * 맵의 그림 표시·날씨·애니메이션은 포그 아래에 표시됩니다.
 * 저장 데이터나 이벤트 불투명도·통행 설정은 변경하지 않습니다.
 *
 * [호환성]
 * Scene_Map.createSpriteset을 원본 호출 후 확장합니다.
 * 기본 화면 확대·스크롤·흔들림을 따라가며 화면 전체를 가립니다.
 * 자체 카메라 변환·독자 맵 렌더러·화면 효과 플러그인은 별도 검수가 필요합니다.
 *
 * @param Mode
 * @text 표시 방식
 * @type select
 * @option 전체 방향
 * @value 전체 방향
 * @option 바라보는 방향 (손전등)
 * @value 바라보는 방향 (손전등)
 * @default 바라보는 방향 (손전등)
 * @desc 원형으로 주변을 보거나, 플레이어가 바라보는 상하좌우 방향만 비춥니다.
 *
 * @param Radius
 * @text 시야 반경
 * @type number
 * @decimals 0
 * @min 1
 * @max 20
 * @default 6
 * @desc 희미하게 보이는 마지막 거리(정수 타일). 반경 바깥0.5타일에서 완전히 가려집니다.
 *
 * @param Opacity
 * @text 외곽 어둡기
 * @type number
 * @min 0
 * @max 255
 * @default 255
 * @desc 255는 완전히 가림, 0은 효과 없음입니다.
 */
(() => {
    "use strict";

    const pluginName = "Akena_Fog";
    const params = PluginManager.parameters(pluginName);
    const number = (value, fallback, min, max) => {
        const parsed = value === "" || value == null ? fallback : Number(value);
        return Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : fallback));
    };
    // 이전에 소수로 저장한 반경도 정수 타일로 반올림합니다.
    const radius = Math.round(number(params.Radius, 6, 1, 20));
    const opacity = number(params.Opacity, 255, 0, 255);
    // 이전 영어 저장값도 인식해 기존 프로젝트 설정을 유지합니다.
    const mode = params.Mode === "전체 방향" || params.Mode === "circle" ? "circle" : "directional";
    // 마지막 거리를 바로 검게 자르지 않고 반 타일의 마무리 구간을 둡니다.
    const outerRadius = radius + 0.5;
    const rangeRatio = radius / outerRadius;
    const stops = [[0, 0], [rangeRatio * 0.2, 0], [rangeRatio * 0.4, 0.15],
        [rangeRatio * 0.6, 0.4], [rangeRatio * 0.8, 0.7], [rangeRatio, 0.9], [1, 1]];
    window.Akena = window.Akena || {};
    const fog = window.Akena.Fog = {};

    class Sprite_Fog extends Sprite {
        constructor(spriteset) {
            super();
            this._spriteset = spriteset;
            this._lastLayout = "";
            this._beamAngle = null;
            this._targetDirection = 0;
            this._turnFrame = 8;
            // 그라데이션은 한 번만 만들고 이동 시 위치와 외곽 사각형만 갱신합니다.
            this._shade = new PIXI.Graphics();
            this.addChild(this._shade);
            this._bitmaps = this.createBitmaps();
            this._gradient = new Sprite(this._bitmaps[mode === "circle" ? 0 : 6]);
            if (mode === "directional") {
                this._beamRoot = new Sprite();
                this._gradient.anchor.set(0.5);
                this._beamRoot.addChild(this._gradient);
                // 회전하는 사각 비트맵을 원 안으로 제한해 모서리가 새거나 겹치지 않게 합니다.
                this._beamMask = new PIXI.Graphics();
                this._beamMask.beginFill(0x000000).drawCircle(0, 0, 256).endFill();
                this._beamRoot.addChild(this._beamMask);
                this._gradient.mask = this._beamMask;
                this.addChild(this._beamRoot);
            } else {
                this.addChild(this._gradient);
            }
            this.alpha = opacity / 255;
            this.update();
        }

        createBitmaps() {
            const bitmap = new Bitmap(512, 512);
            const context = bitmap.context;
            if (mode === "circle") {
                const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 255);
                for (const [distance, alpha] of stops) {
                    gradient.addColorStop(distance, `rgba(0,0,0,${alpha})`);
                }
                context.fillStyle = gradient;
                context.fillRect(0, 0, 512, 512);
                bitmap.baseTexture.update();
                return { 0: bitmap };
            }

            // 오른쪽을 비추는 비트맵 한 장을 만들고 표시 각도만 부드럽게 회전합니다.
            const image = context.createImageData(512, 512);
            const localRadius = Math.min(0.7, 1.3 / outerRadius);
            for (let y = 0; y < 512; y++) {
                for (let x = 0; x < 512; x++) {
                    const dx = (x + 0.5 - 256) / 255;
                    const dy = (y + 0.5 - 256) / 255;
                    const distance = Math.hypot(dx, dy);
                    const angle = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;
                    const edge = Math.max(0, Math.min(1, (48 - angle) / 16));
                    let radialAlpha = 1;
                    for (let i = 1; i < stops.length; i++) {
                        if (distance <= stops[i][0]) {
                            const [start, a] = stops[i - 1];
                            const [end, b] = stops[i];
                            radialAlpha = a + (b - a) * (distance - start) / (end - start);
                            break;
                        }
                    }
                    const beam = (1 - radialAlpha) * edge * edge * (3 - 2 * edge);
                    const local = 0.9 * Math.pow(Math.max(0, 1 - distance / localRadius), 1.3);
                    image.data[(y * 512 + x) * 4 + 3] = Math.round(255 * (1 - Math.max(beam, local)));
                }
            }
            context.putImageData(image, 0, 0);
            bitmap.baseTexture.update();
            return { 6: bitmap };
        }

        updateRotation() {
            const direction = $gamePlayer.direction();
            const target = { 6: 0, 2: Math.PI / 2, 4: Math.PI, 8: -Math.PI / 2 }[direction] ?? 0;
            if (this._beamAngle === null) {
                // 맵에 처음 나타날 때는 현재 방향을 즉시 비춥니다.
                this._beamAngle = target;
                this._targetDirection = direction;
            } else if (direction !== this._targetDirection) {
                this._targetDirection = direction;
                this._turnStart = this._beamAngle;
                // 각도의 경계를 지나도 가장 짧은 방향으로 회전합니다.
                this._turnDelta = Math.atan2(Math.sin(target - this._beamAngle), Math.cos(target - this._beamAngle));
                this._turnFrame = 0;
            }
            if (this._turnFrame < 8) {
                const t = ++this._turnFrame / 8;
                this._beamAngle = this._turnStart + this._turnDelta * t * t * (3 - 2 * t);
            }
            this._gradient.rotation = this._beamAngle;
        }

        update() {
            super.update();
            this.visible = !!($dataMap && /<AkenaFog\s*>/i.test($dataMap.note || "")) && opacity > 0;
            if (!this.visible) return;
            // 좌표가 그대로여도 빛의 회전은 계속 진행합니다.
            if (mode === "directional") this.updateRotation();
            // 포그는 화면에 고정하고, 시야 중심에만 맵의 확대·흔들림을 반영합니다.
            const s = this._spriteset;
            // updateTransform 전의 프레임이므로 현재 spriteset 속성으로 계산합니다.
            const x = s.x + $gamePlayer.screenX() * s.scale.x;
            const y = s.y + ($gamePlayer.screenY() - $gameMap.tileHeight() / 2) * s.scale.y;
            const rx = outerRadius * $gameMap.tileWidth() * Math.abs(s.scale.x);
            const ry = outerRadius * $gameMap.tileHeight() * Math.abs(s.scale.y);
            const width = Graphics.width;
            const height = Graphics.height;
            const layout = [x, y, rx, ry, width, height].join(",");
            if (layout === this._lastLayout) return;
            this._lastLayout = layout;
            if (mode === "directional") {
                this._beamRoot.position.set(x, y);
                this._beamRoot.scale.set(rx / 256, ry / 256);
                const shade = this._shade;
                const left = Math.min(0, x - rx - 1);
                const top = Math.min(0, y - ry - 1);
                const right = Math.max(width, x + rx + 1);
                const bottom = Math.max(height, y + ry + 1);
                shade.clear();
                shade.beginFill(0x000000);
                shade.drawRect(left, top, right - left, bottom - top);
                shade.beginHole();
                shade.drawEllipse(x, y, rx, ry);
                shade.endHole();
                shade.endFill();
                return;
            }
            this._gradient.move(x - rx, y - ry);
            this._gradient.scale.set(rx / 256, ry / 256);
            const left = Math.max(0, Math.min(width, x - rx));
            const right = Math.max(0, Math.min(width, x + rx));
            const top = Math.max(0, Math.min(height, y - ry));
            const bottom = Math.max(0, Math.min(height, y + ry));
            const shade = this._shade;
            shade.clear();
            shade.beginFill(0x000000);
            shade.drawRect(0, 0, left, height);
            shade.drawRect(right, 0, width - right, height);
            shade.drawRect(left, 0, right - left, top);
            shade.drawRect(left, bottom, right - left, height - bottom);
            shade.endFill();
        }

        destroy() {
            // 이 스프라이트가 만든 비트맵만 해제하고 엔진의 자식 정리를 이어갑니다.
            for (const bitmap of Object.values(this._bitmaps)) bitmap.destroy();
            super.destroy();
        }
    }

    const _Scene_Map_createSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        _Scene_Map_createSpriteset.call(this);
        // 윈도우 레이어가 만들어지기 전에 추가하여 대화와 메뉴 입력을 유지합니다.
        this._akenaFog = new Sprite_Fog(this._spriteset);
        this.addChild(this._akenaFog);
    };

    // 읽기 전용 상태 확인용이며 게임 진행·설정값을 변경하지 않습니다.
    fog.settings = Object.freeze({ mode, radius, opacity });
})();
