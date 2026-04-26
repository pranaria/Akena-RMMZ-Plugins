//=============================================================================
// Akena_ItemPopup.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0] 아이템 획득 시 화면 상단 전체폭 팝업 표시 <Akena_ItemPopup>
 * @author Akena
 *
 * @help
 * ============================================================
 * Akena_ItemPopup - 아이템 획득 팝업
 * ============================================================
 * [개요]
 * 아이템/무기/방어구/골드를 획득하면 화면 상단 전체폭으로
 * 아이콘과 획득 메시지를 한 줄 팝업으로 표시합니다.
 * 일정 시간 후 자동 페이드아웃, OK키로 즉시 닫기 가능.
 * 여러 항목을 동시에 얻으면 순차적으로 표시합니다.
 *
 * [사용법]
 * 이벤트 커맨드 "아이템 증감", "무기 증감", "방어구 증감",
 * "소지금 증감"으로 자동 적용됩니다.
 *
 * [주의사항]
 * - 맵 씬에서만 동작합니다.
 * - 감소(손실)에는 팝업이 표시되지 않습니다.
 *
 * @param popupDuration
 * @text 표시 시간 (프레임)
 * @type number
 * @default 60
 * @desc 팝업이 표시되는 시간. 60 = 1초 기준.
 *
 * @param popupY
 * @text 팝업 Y 위치
 * @type number
 * @default 4
 * @desc 화면 상단에서의 팝업 Y 좌표. 4 이상 권장 (0이면 테두리 짤림)
 *
 * @param popupHeight
 * @text 팝업 높이
 * @type number
 * @default 0
 * @desc 팝업 바 높이 (픽셀). 0 = 자동 (아이콘 크기 + 여백 기준)
 *
 * @param bgOpacity
 * @text 배경 투명도
 * @type number
 * @min 0
 * @max 255
 * @default 200
 * @desc 팝업 배경의 불투명도. 0 = 완전 투명, 255 = 완전 불투명
 *
 * @param fontSize
 * @text 폰트 크기
 * @type number
 * @default 24
 * @desc 팝업 텍스트 폰트 크기
 *
 * @param labelText
 * @text 획득 메시지
 * @type string
 * @default %1을(를) 얻었습니다
 * @desc 획득 메시지. %1 = 아이템명, %2 = 수량
 *
 * @param showAmount
 * @text 수량 표시
 * @type boolean
 * @default true
 * @desc true = 수량이 2 이상일 때 아이템명 뒤에 ×N 표시
 *
 * @param enableGoldPopup
 * @text 골드 팝업 사용
 * @type boolean
 * @default true
 * @desc 소지금 획득 시에도 팝업을 표시할지 여부
 *
 * @param goldIconIndex
 * @text 골드 아이콘 번호
 * @type number
 * @default 314
 * @desc 골드 팝업에 사용할 아이콘 인덱스 (IconSet 기준)
 *
 * @param goldLabelText
 * @text 골드 메시지
 * @type string
 * @default %1 %2을(를) 얻었습니다
 * @desc 골드 획득 메시지. %1 = 수량, %2 = 화폐 단위
 *
 * @param bgColor
 * @text 배경 색상
 * @type string
 * @default #375FA5
 * @desc 팝업 배경 색상 (hex). 투명도는 "배경 투명도" 파라미터로 별도 조절.
 *
 * @param borderOutColor
 * @text 외곽 테두리 색상
 * @type string
 * @default #142D5F
 * @desc 팝업 외곽 테두리 색상 (hex).
 *
 * @param borderInColor
 * @text 내부 하이라이트 색상
 * @type string
 * @default #AAD2FF
 * @desc 팝업 내부 하이라이트 테두리 색상 (hex).
 */

(() => {
    "use strict";

    const pluginName = "Akena_ItemPopup";
    const params = PluginManager.parameters(pluginName);

    // 파라미터
    const DURATION    = Number(params.popupDuration) || 60;
    const POPUP_Y     = params.popupY    !== undefined ? Number(params.popupY)    : 4;
    const POPUP_H     = Number(params.popupHeight) || 0;   // 0 = 자동
    const FONT_SIZE   = Number(params.fontSize)    || 24;
    const LABEL       = String(params.labelText    || "%1을(를) 얻었습니다");
    const SHOW_AMT    = params.showAmount !== "false";
    const BG_ALPHA    = (params.bgOpacity !== undefined ? Number(params.bgOpacity) : 200) / 255;
    const ENABLE_GOLD = params.enableGoldPopup !== "false";
    const GOLD_ICON   = Number(params.goldIconIndex) || 314;
    const GOLD_LABEL  = String(params.goldLabelText || "%1 %2을(를) 얻었습니다");

    // 레이아웃 상수
    const BORDER_OUT = 3;   // 외곽 테두리 두께
    const BORDER_IN  = 1;   // 내부 하이라이트 두께
    const ICON_GAP   = 8;   // 아이콘 ↔ 텍스트 간격
    const SIDE_PAD   = 8;   // 좌우 여백
    const FADE_STEP  = 15;  // 페이드아웃 속도 (1프레임당 알파 감소량)
    const AUTO_VPAD  = 36;  // 자동 높이 계산 시 아이콘 위/아래 추가 여백

    // 색상 — hex(#RRGGBB) → rgba 변환. 알파는 배경만 BG_ALPHA로 가변, 테두리는 고정.
    function hexToRgb(hex) {
        const m = String(hex).replace("#", "").match(/.{2}/g) || ["00", "00", "00"];
        return m.slice(0, 3).map(c => parseInt(c, 16));
    }
    function rgbaStr(hex, alpha) {
        const [r, g, b] = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    const COLOR_BG         = rgbaStr(params.bgColor         || "#375FA5", BG_ALPHA.toFixed(2));
    const COLOR_BORDER_OUT = rgbaStr(params.borderOutColor  || "#142D5F", "0.95");
    const COLOR_BORDER_IN  = rgbaStr(params.borderInColor   || "#AAD2FF", "0.85");

    function calcPopupHeight() {
        const iconH = ImageManager.iconHeight || 32;
        return POPUP_H > 0 ? POPUP_H : iconH + AUTO_VPAD;
    }

    //-------------------------------------------------------------------------
    // 네임스페이스 & 큐
    //-------------------------------------------------------------------------
    window.Akena = window.Akena || {};
    Akena.ItemPopup = {
        queue: [],
        push(iconIndex, label) { this.queue.push({ iconIndex, label }); },
        shift()                { return this.queue.shift(); },
        hasPending()           { return this.queue.length > 0; }
    };

    //-------------------------------------------------------------------------
    // Window_ItemPopup
    //-------------------------------------------------------------------------
    function Window_ItemPopup() {
        this.initialize(...arguments);
    }
    Window_ItemPopup.prototype = Object.create(Window_Base.prototype);
    Window_ItemPopup.prototype.constructor = Window_ItemPopup;

    // [중요] Window_Base.initialize는 updatePadding() → createContents() 순으로 호출됨.
    // initialize 종료 후 padding을 바꿔도 contents 비트맵은 이미 padding=12 기준으로
    // (width-24)×(height-24) 작게 생성된 상태라 우측·하단이 잘림. updatePadding을
    // 가로채서 padding=0을 미리 잡아야 비트맵이 풀사이즈로 생성됨.
    Window_ItemPopup.prototype.updatePadding = function() {
        this.padding = 0;
    };

    Window_ItemPopup.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this.setBackgroundType(2);
        this.contentsOpacity = 0;
        this._iconIndex = -1;
        this._label = "";
        this._timer = 0;
        this._fadingOut = false;
    };

    // 스크롤바/화살표 UI 비활성화 (Window_Scrollable 상속분)
    Window_ItemPopup.prototype._createScrollArrowSprites  = function() {};
    Window_ItemPopup.prototype._refreshScrollBarBitmap    = function() {};
    Window_ItemPopup.prototype._updateScrollBarVisibility = function() {};

    Window_ItemPopup.prototype.setup = function(iconIndex, label) {
        this._iconIndex = iconIndex;
        this._label = label;
        this._timer = DURATION;
        this._fadingOut = false;
        this.contentsOpacity = 255;
        this.refresh();
    };

    Window_ItemPopup.prototype.refresh = function() {
        this.contents.clear();
        if (!this._label) return;

        const c = this.contents;
        const w = this.contentsWidth();
        const h = this.contentsHeight();

        c.fillRect(0, 0, w, h, COLOR_BG);

        c.fillRect(0,             0,             w,             BORDER_OUT, COLOR_BORDER_OUT);
        c.fillRect(0,             h - BORDER_OUT, w,            BORDER_OUT, COLOR_BORDER_OUT);
        c.fillRect(0,             0,             BORDER_OUT,    h,          COLOR_BORDER_OUT);
        c.fillRect(w - BORDER_OUT, 0,            BORDER_OUT,    h,          COLOR_BORDER_OUT);

        const innerX = BORDER_OUT;
        const innerY = BORDER_OUT;
        const innerW = w - BORDER_OUT * 2;
        const innerH = h - BORDER_OUT * 2;
        c.fillRect(innerX,                       innerY,                       innerW,   BORDER_IN, COLOR_BORDER_IN);
        c.fillRect(innerX,                       innerY + innerH - BORDER_IN,  innerW,   BORDER_IN, COLOR_BORDER_IN);
        c.fillRect(innerX,                       innerY,                       BORDER_IN, innerH,   COLOR_BORDER_IN);
        c.fillRect(innerX + innerW - BORDER_IN,  innerY,                       BORDER_IN, innerH,   COLOR_BORDER_IN);

        c.fontSize = FONT_SIZE;
        const iconW  = ImageManager.iconWidth;
        const iconH  = ImageManager.iconHeight;
        const textW  = c.measureTextWidth(this._label);
        const startX = Math.max(SIDE_PAD, Math.floor((w - (iconW + ICON_GAP + textW)) / 2));
        const iconY  = Math.floor((h - iconH) / 2);

        this.drawIcon(this._iconIndex, startX, iconY);

        c.textColor    = "#ffffff";
        c.outlineColor = "rgba(0, 0, 0, 0.75)";
        c.outlineWidth = 3;
        c.drawText(this._label, startX + iconW + ICON_GAP, 0,
                   w - startX - iconW - ICON_GAP - SIDE_PAD, h, "left");
    };

    Window_ItemPopup.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (!this._label) return;

        if (this._fadingOut) {
            this.contentsOpacity -= FADE_STEP;
            if (this.contentsOpacity <= 0) {
                this.contentsOpacity = 0;
                this._label = "";
            }
            return;
        }

        if (this._timer > 0) this._timer--;
        else this.startFadeOut();
    };

    Window_ItemPopup.prototype.startFadeOut = function() { this._fadingOut = true; };
    Window_ItemPopup.prototype.isActive     = function() { return !!this._label; };

    //-------------------------------------------------------------------------
    // Game_Party 훅 — 획득 감지 → 라벨 포맷 후 큐에 추가
    //-------------------------------------------------------------------------
    const _Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        _Game_Party_gainItem.call(this, item, amount, includeEquip);
        if (item && item.name && amount > 0) {
            const nameText = (SHOW_AMT && amount > 1)
                ? `${item.name} ×${amount}`
                : item.name;
            const label = LABEL.replace("%1", nameText).replace("%2", amount);
            Akena.ItemPopup.push(item.iconIndex, label);
        }
    };

    const _Game_Party_gainGold = Game_Party.prototype.gainGold;
    Game_Party.prototype.gainGold = function(amount) {
        _Game_Party_gainGold.call(this, amount);
        if (ENABLE_GOLD && amount > 0) {
            const label = GOLD_LABEL
                .replace("%1", amount.toLocaleString())
                .replace("%2", TextManager.currencyUnit);
            Akena.ItemPopup.push(GOLD_ICON, label);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map 훅 — 팝업 윈도우 생성 + 매 프레임 큐 처리
    //-------------------------------------------------------------------------
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        // WindowLayer는 (Graphics.width - Graphics.boxWidth)/2 만큼 x 오프셋되므로,
        // 화면 전체폭(레터박스 포함)을 채우려면 음수 x로 보정 + width=Graphics.width.
        const lx   = Math.floor((Graphics.width - Graphics.boxWidth) / 2);
        const rect = new Rectangle(-lx, POPUP_Y, Graphics.width, calcPopupHeight());
        this._itemPopupWindow = new Window_ItemPopup(rect);
        this.addWindow(this._itemPopupWindow);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this._updateItemPopup();
    };

    Scene_Map.prototype._updateItemPopup = function() {
        const popup = this._itemPopupWindow;
        if (!popup) return;

        if (popup.isActive()) {
            if (!popup._fadingOut && Input.isTriggered("ok")) {
                popup.startFadeOut();
            }
        } else if (Akena.ItemPopup.hasPending()) {
            const next = Akena.ItemPopup.shift();
            popup.setup(next.iconIndex, next.label);
        }
    };

})();
