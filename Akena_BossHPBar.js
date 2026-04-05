//=============================================================================
// Akena_BossHPBar.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v3.0] 전투 중 보스 HP바를 화면 상단에 표시합니다 (다중 보스 지원) <Akena_BossHPBar>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_BossHPBar - 보스 HP바 (다중 보스 지원)
 * ============================================================
 * [개요]
 * 전투 중 <boss> 노트 태그가 있는 적을 보스로 인식하여
 * 화면 상단에 HP바를 한 줄로 표시합니다.
 * 보스가 여러 명이면 세로로 쌓아서 각각 표시하며,
 * 보스가 사망하면 해당 바가 페이드아웃 후 제거되고
 * 남은 바가 부드럽게 재정렬됩니다.
 *
 * [사용법]
 * 1. 데이터베이스 > 적 탭 > 메모란에 <boss> 를 입력합니다.
 * 2. 전투 시 자동으로 HP바가 화면 상단에 표시됩니다.
 * 3. 전투 중 이벤트로 소환된 보스도 자동으로 감지합니다.
 *
 * [한 줄 레이아웃]
 * [이름] [====== HP 게이지 ======] [현재HP / 최대HP]
 * 이름이 영역보다 길면 폰트 크기를 자동으로 줄입니다.
 *
 * [HP 게이지 색상]
 * - 70% 이상 : 녹색
 * - 30% ~ 70% : 노랑
 * - 30% 미만  : 빨강
 *
 * @param barY
 * @text 상단 Y 오프셋
 * @type number
 * @min 0
 * @max 200
 * @default 20
 * @desc 화면 상단에서 첫 번째 HP바까지의 거리(px)입니다.
 *
 * @param barSpacing
 * @text 바 간격 (픽셀)
 * @type number
 * @min 0
 * @max 40
 * @default 6
 * @desc 보스가 여러 명일 때 HP바 사이의 간격(px)입니다.
 *
 * @param showHpNumber
 * @text HP 수치 표시
 * @type boolean
 * @default true
 * @desc true: HP 수치를 표시합니다 / false: 게이지만 표시합니다 (긴장감 유지)
 */

(() => {
    "use strict";

    const pluginName = "Akena_BossHPBar";
    const params     = PluginManager.parameters(pluginName);

    const BAR_Y       = Number(params.barY)      || 20;
    const BAR_SPACING = Number(params.barSpacing) || 6;
    const SHOW_HP_NUM = params.showHpNumber !== "false";
    const PADDING     = 8;
    const FADE_SPEED  = 8;    // 프레임당 opacity 변화량
    const HP_LERP     = 0.08; // HP 게이지 보간 속도
    const SLIDE_LERP  = 0.15; // 슬롯 재정렬 이동 속도

    //=========================================================================
    // Sprite_BossHPBar
    // 보스 1마리에 대응하는 단일 HP바 스프라이트
    //=========================================================================

    class Sprite_BossHPBar extends Sprite {

        initialize(boss, index) {
            super.initialize();

            this._boss        = boss;
            this._displayedHp = boss.hp;
            this._fadeDir     = 1;   // 생성 즉시 페이드인
            this.opacity      = 0;

            // 해상도 기준 크기 계산
            this._barWidth  = Math.floor(Graphics.boxWidth  * 0.9);
            this._rowH      = Math.floor(Graphics.boxHeight * 0.05);
            this._barHeight = Math.floor(this._rowH * 0.45);
            this._nameW     = Math.floor(this._barWidth * 0.18);
            this._hpTextW   = SHOW_HP_NUM ? Math.floor(this._barWidth * 0.14) : 0;
            this._gaugeW    = this._barWidth - this._nameW - this._hpTextW - PADDING;

            const bmpW = this._barWidth + PADDING * 2;
            const bmpH = PADDING + this._rowH + PADDING;
            this.bitmap = new Bitmap(bmpW, bmpH);

            this.x        = Math.floor((Graphics.boxWidth - bmpW) / 2);
            this._targetY = BAR_Y + index * (bmpH + BAR_SPACING);
            this.y        = this._targetY;
        }

        // 슬롯 인덱스 변경 → 목표 Y 갱신 (lerp 슬라이드 시작)
        setSlotIndex(index) {
            const bmpH    = this.bitmap.height;
            this._targetY = BAR_Y + index * (bmpH + BAR_SPACING);
        }

        // 페이드아웃 + opacity 0 → Scene이 제거 타이밍 판정
        isDone() {
            return this._fadeDir === -1 && this.opacity === 0;
        }

        update() {
            super.update();
            this._updateDeath();
            this._updateFade();
            this._updateSlide();
            if (this.opacity > 0) {
                this._updateDisplayedHp();
                this._redraw();
            }
        }

        //----------------------------------------------------------------------
        // 보스 사망 감지 → 페이드아웃 트리거
        //----------------------------------------------------------------------
        _updateDeath() {
            if (this._boss && !this._boss.isAlive() && this._fadeDir !== -1) {
                this._displayedHp = 0;
                this._fadeDir = -1;
            }
        }

        //----------------------------------------------------------------------
        // 페이드인 / 페이드아웃
        //----------------------------------------------------------------------
        _updateFade() {
            if (this._fadeDir === 1) {
                this.opacity = Math.min(255, this.opacity + FADE_SPEED);
                if (this.opacity >= 255) this._fadeDir = 0;
            } else if (this._fadeDir === -1) {
                this.opacity = Math.max(0, this.opacity - FADE_SPEED);
            }
        }

        //----------------------------------------------------------------------
        // 슬롯 재정렬 시 lerp로 targetY까지 부드럽게 이동
        //----------------------------------------------------------------------
        _updateSlide() {
            const diff = this._targetY - this.y;
            if (Math.abs(diff) < 0.5) {
                this.y = this._targetY;
            } else {
                this.y += diff * SLIDE_LERP;
            }
        }

        //----------------------------------------------------------------------
        // HP 부드러운 감소 (lerp)
        //----------------------------------------------------------------------
        _updateDisplayedHp() {
            if (!this._boss) return;
            const target = this._boss.hp;
            const diff   = target - this._displayedHp;
            if (Math.abs(diff) < 0.5) {
                this._displayedHp = target;
            } else {
                this._displayedHp += diff * HP_LERP;
            }
        }

        //----------------------------------------------------------------------
        // HP 비율에 따른 게이지 색상
        //----------------------------------------------------------------------
        _gaugeColor() {
            const maxHp = this._boss ? this._boss.mhp : 1;
            const rate  = maxHp > 0 ? this._displayedHp / maxHp : 0;
            if (rate >= 0.7) return "#4caf50";
            if (rate >= 0.3) return "#ffcc00";
            return "#e03030";
        }

        //----------------------------------------------------------------------
        // 이름 자동 폰트 축소
        // measureTextWidth로 너비를 측정하면서 maxW 안에 들어올 때까지 축소
        //----------------------------------------------------------------------
        _drawNameAutoFit(bmp, name, x, y, maxW, rowH) {
            let fontSize = Math.floor(rowH * 0.60);
            bmp.fontFace = $gameSystem.mainFontFace();
            bmp.fontSize = fontSize;
            while (fontSize > 8 && bmp.measureTextWidth(name) > maxW) {
                fontSize--;
                bmp.fontSize = fontSize;
            }
            bmp.textColor = "#ffffff";
            bmp.drawText(name, x, y, maxW, rowH, "left");
        }

        //----------------------------------------------------------------------
        // 비트맵 그리기
        // 한 줄 레이아웃: [이름] [==== 게이지 ====] [HP/MaxHP]
        //----------------------------------------------------------------------
        _redraw() {
            const bmp  = this.bitmap;
            const bmpW = bmp.width;
            const bmpH = bmp.height;
            bmp.clear();

            const name    = this._boss ? this._boss.name() : "";
            const current = Math.max(0, Math.ceil(this._displayedHp));
            const maxHp   = this._boss ? this._boss.mhp : 1;
            const rate    = Math.max(0, Math.min(1, current / maxHp));

            const rowH    = this._rowH;
            const bh      = this._barHeight;
            const nameW   = this._nameW;
            const hpTextW = this._hpTextW;
            const gaugeW  = this._gaugeW;

            const bx      = PADDING;
            const gaugeX  = bx + nameW + PADDING;
            const hpTextX = gaugeX + gaugeW;
            const rowY    = PADDING;
            const barY    = rowY + Math.floor((rowH - bh) / 2);

            // 패널 배경 (반투명 검정)
            bmp.fillRect(0, 0, bmpW, bmpH, "rgba(0,0,0,0.65)");

            // 이름 (영역보다 길면 자동 축소)
            this._drawNameAutoFit(bmp, name, bx, rowY, nameW, rowH);

            // 게이지 배경
            bmp.fillRect(gaugeX, barY, gaugeW, bh, "#303030");

            // 게이지 채우기
            const fillW = Math.floor(gaugeW * rate);
            if (fillW > 0) {
                bmp.fillRect(gaugeX, barY, fillW, bh, this._gaugeColor());
            }

            // 게이지 테두리
            bmp.fillRect(gaugeX,              barY,          gaugeW, 1,  "#000000");
            bmp.fillRect(gaugeX,              barY + bh - 1, gaugeW, 1,  "#000000");
            bmp.fillRect(gaugeX,              barY,           1,     bh, "#000000");
            bmp.fillRect(gaugeX + gaugeW - 1, barY,           1,     bh, "#000000");

            // HP 수치 (showHpNumber = true일 때만)
            if (SHOW_HP_NUM) {
                const hpText = `${current} / ${maxHp}`;
                bmp.fontSize  = Math.floor(rowH * 0.52);
                bmp.textColor = "#dddddd";
                bmp.drawText(hpText, hpTextX, rowY, hpTextW, rowH, "right");
            }
        }
    }

    //=========================================================================
    // Scene_Battle Hook
    //=========================================================================

    const _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        this._bossHPBars    = [];
        this._trackedBosses = new Set(); // 이미 바가 생성된 보스 추적 (중복 방지)
        this._updateBossHPBars();        // 전투 시작 시 초기 스캔
    };

    // 매 프레임: 완료된 바 제거 + 재정렬 + 신규 보스 감지
    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        this._updateBossHPBars();
    };

    Scene_Battle.prototype._updateBossHPBars = function() {
        if (!$gameTroop) return;

        // ① 페이드아웃 완료된 바 제거 → 재정렬
        let removed = false;
        for (let i = this._bossHPBars.length - 1; i >= 0; i--) {
            if (this._bossHPBars[i].isDone()) {
                const bar = this._bossHPBars[i];
                this.removeChild(bar);
                bar.bitmap.destroy(); // GPU 메모리 해제
                this._bossHPBars.splice(i, 1);
                removed = true;
            }
        }
        if (removed) this._reorderBossHPBars();

        // ② 아직 추적하지 않은 살아있는 보스 감지 → 바 추가
        for (const enemy of $gameTroop.members()) {
            if (enemy.isAlive() && enemy.enemy().meta.boss && !this._trackedBosses.has(enemy)) {
                this._trackedBosses.add(enemy);
                const index = this._bossHPBars.length;
                const bar   = new Sprite_BossHPBar(enemy, index);
                this._bossHPBars.push(bar);
                this.addChild(bar);
            }
        }
    };

    // 남은 바들의 슬롯 인덱스를 재할당 → lerp 슬라이드 시작
    Scene_Battle.prototype._reorderBossHPBars = function() {
        this._bossHPBars.forEach((bar, i) => bar.setSlotIndex(i));
    };

    //=========================================================================
    // 전투 로그 커스터마이징
    //=========================================================================

    const _Window_BattleLog_resetFontSettings = Window_BattleLog.prototype.resetFontSettings;
    Window_BattleLog.prototype.resetFontSettings = function() {
        _Window_BattleLog_resetFontSettings.call(this);
        this.contents.fontSize = Math.floor($gameSystem.mainFontSize() * 0.5);
    };

    Window_BattleLog.prototype.lineHeight = function() {
        return Math.floor($gameSystem.mainFontSize() * 0.5) + 8;
    };

    Window_BattleLog.prototype.backRect = function() {
        return new Rectangle(0, 0, this.innerWidth, this.innerHeight);
    };

    Window_BattleLog.prototype.lineRect = function(index) {
        const pad = this.itemPadding();
        const h   = this.itemHeight();
        return new Rectangle(pad, pad + index * h, this.innerWidth - pad * 2, h);
    };

    const _logRect = function(scene) {
        const ww      = Math.floor(Graphics.boxWidth * 0.3);
        const lineH   = Math.floor($gameSystem.mainFontSize() * 0.5) + 8;
        const wPad    = $gameSystem.windowPadding() * 2;
        const logH    = lineH * 5 + wPad;
        const statusY = scene.statusWindowRect().y;
        return new Rectangle(0, statusY - logH, ww, logH);
    };

    Scene_Battle.prototype.logWindowRect = function() {
        return _logRect(this);
    };

})();
