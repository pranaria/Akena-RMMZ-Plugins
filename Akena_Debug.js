/*:
 * @target MZ
 * @plugindesc (v1.00) 디버그 뷰어: 파티 HP/MP · 변수 · 스위치 (F10 토글) <Akena_Debug>
 * @author Akena with GPTS
 *
 * @help
 * v1.00 - 최초 제작
 *
 * 사용 방법:
 *  - F10로 디버그 창을 토글합니다.
 *  - WindowWidth / WindowHeight 로 창 크기를 지정합니다.
 *  - ShowFrame, BackOpacity 로 모양을 설정합니다.
 *  - 파티 / 변수 / 스위치 표시 On/Off 및 ID 목록을 입력합니다.
 *
 * @param WindowWidth
 * @text 윈도우 폭(px)
 * @type number
 * @default 260
 *
 * @param WindowHeight
 * @text 윈도우 높이(px)
 * @type number
 * @default 370
 *
 * @param ShowFrame
 * @text 윈도우 테두리 표시
 * @type boolean
 * @default true
 *
 * @param BackOpacity
 * @text 배경 불투명도
 * @type number
 * @min 0
 * @max 255
 * @default 10
 *
 * @param ShowParty
 * @text 파티 표시
 * @type boolean
 * @default true
 *
 * @param ShowVariables
 * @text 변수 표시
 * @type boolean
 * @default true
 *
 * @param ShowSwitches
 * @text 스위치 표시
 * @type boolean
 * @default true
 *
 * @param VariableIds
 * @text 표시할 변수 ID
 * @type string
 * @default 1,2,3,4,5
 *
 * @param SwitchIds
 * @text 표시할 스위치 ID
 * @type string
 * @default 1,2,3,4,5
 */

var Akena = Akena || {};          // 제작자 네임스페이스 루트
Akena.Debug = Akena.Debug || {};  // 디버그 기능 공간

(() => {
  "use strict";

  // ===== 표시 기본값 =====
  const FONT = 14;   // 폰트 크기
  const LINE = 18;   // 줄 간격(px)
  const PAD  = 12;   // 내부 패딩(px)

  // ===== 파라미터 로드 & 변환 =====
  const P   = PluginManager.parameters("Akena_Debug");                     // 모든 파라미터
  const b   = v => String(v).toLowerCase() === "true";                     // 문자열 → boolean
  const num = (v, d) => (isNaN(+v) ? d : +v);                              // 문자열 → number
  const ids = s => String(s).split(",").map(t => +t.trim()).filter(n=>n>0); // "1,2,3" → [1,2,3]

  // 창 크기
  const WIN_W = num(P.WindowWidth,  260);   // 외곽 폭
  const WIN_H = num(P.WindowHeight, 370);   // 외곽 높이
  // 창 모양
  const SHOW_FRAME = b(P.ShowFrame);        // 테두리 표시
  const BACK_OPA   = num(P.BackOpacity,10); // 배경 불투명도(0~255)
  // 섹션 표시
  const SHOW_PARTY = b(P.ShowParty);        // 파티 섹션
  const SHOW_VARS  = b(P.ShowVariables);    // 변수 섹션
  const SHOW_SW    = b(P.ShowSwitches);     // 스위치 섹션
  // 표시 ID
  const VAR_IDS = ids(P.VariableIds);       // 변수 ID 배열
  const SW_IDS  = ids(P.SwitchIds);         // 스위치 ID 배열

  // ===== F10 토글 등록 =====
  if (!Object.values(Input.keyMapper).includes("akenaDebugToggle")) {
    Input.keyMapper[121] = "akenaDebugToggle"; // 121 = F10
  }

  // ===== 디버그 윈도우 정의 =====
  class Window_AkenaDebug extends Window_Base {
    constructor(rect) {
      super(rect);
      this._padding = PAD;                 // 내부 여백
      this.contents.fontSize = FONT;       // 폰트 크기
      this.frameVisible = SHOW_FRAME;      // 테두리 On/Off
      this.opacity = SHOW_FRAME ? 255 : 0; // 프레임 투명도(테두리 숨김 시 0)
      this.backOpacity = BACK_OPA;         // 배경 불투명도
      this.refresh();                      // 초기 그리기
    }

    update() {
      super.update();
      this.refresh();                      // 매 프레임 갱신(간단 구현)
    }

    refresh() {
      this.contents.clear();               // 이전 내용 지우기
      const lh = LINE;                     // 한 줄 높이(상수)
      let y = 0;                           // 현재 Y 좌표
      const w = this.contents.width;       // 내용 폭

      // --- 헤더 ---
      this.changeTextColor(ColorManager.systemColor()); // 시스템 색
      this.drawText("Akena Debug Viewer", 0, y, w);     // 타이틀
      this.resetTextColor();                            // 색상 복귀
      y += lh;                                          // 다음 줄

      // --- 골드 ---
      this.drawText("Gold:", 0, y, w, "left");                 // 라벨(좌)
      this.drawText(" " + $gameParty.gold(), 0, y, w, "right");// 값(우)
      y += lh;                                                 // 줄 이동

      // --- 파티 ---
      if (SHOW_PARTY) {
        this.changeTextColor(ColorManager.systemColor()); // 섹션 색
        this.drawText("- Party -", 0, y, w);              // 섹션 제목
        this.resetTextColor();                            // 색 복귀
        y += lh;

        const members = $gameParty.members();             // 파티 멤버 배열
        if (members.length === 0) {                       // 멤버 없을 때
          this.drawText("Party:", 0, y, w, "left");       // 라벨
          this.drawText(" (none)", 0, y, w, "right");     // 값
          y += lh;
        }
        for (const a of members) {                        // 멤버별 한 줄
          this.drawText(`${a.name()}:`, 0, y, w, "left"); // 이름
          this.drawText(` HP ${a.hp}/${a.mhp}  MP ${a.mp}/${a.mmp}`, 0, y, w, "right"); // HP/MP
          y += lh;
        }
      }

      // --- 변수 ---
      if (SHOW_VARS) {
        this.changeTextColor(ColorManager.systemColor()); // 섹션 색
        this.drawText("- Variables -", 0, y, w);          // 섹션 제목
        this.resetTextColor();
        y += lh;

        for (const id of VAR_IDS) {                       // 변수 ID 순회
          const name = $dataSystem.variables?.[id] || "(no name)"; // 변수명
          this.drawText(`#${id} ${name}`, 0, y, w, "left");        // 라벨
          this.drawText(" " + $gameVariables.value(id), 0, y, w, "right"); // 값
          y += lh;
        }
      }

      // --- 스위치 ---
      if (SHOW_SW) {
        this.changeTextColor(ColorManager.systemColor()); // 섹션 색
        this.drawText("- Switches -", 0, y, w);           // 섹션 제목
        this.resetTextColor();
        y += lh;

        for (const id of SW_IDS) {                        // 스위치 ID 순회
          const name = $dataSystem.switches?.[id] || "(no name)"; // 스위치명
          const on = $gameSwitches.value(id);             // 상태(bool)
          this.changeTextColor(on ? "#3bd16f" : "#aaaaaa");       // ON/OFF 색
          this.drawText(`#${id} ${name}`, 0, y, w, "left");       // 라벨
          this.drawText(" " + (on ? "ON" : "OFF"), 0, y, w, "right"); // 값
          this.resetTextColor();
          y += lh;
        }
      }
    }
  }

  // 네임스페이스에 클래스 등록(외부에서 접근 가능)
  Akena.Debug.Window = Window_AkenaDebug;

  // ===== Scene_Map 확장(생성/토글) =====
  const _createAllWindows = Scene_Map.prototype.createAllWindows; // 원본 보관
  Scene_Map.prototype.createAllWindows = function() {
    _createAllWindows.call(this);                                // 원본 호출
    const rect = new Rectangle(8, 0, WIN_W, WIN_H);              // 위치(x,y)+크기
    this._akenaDebugWindow = new Akena.Debug.Window(rect);       // 디버그 창 생성
    this._akenaDebugWindow.visible = false;                      // 기본은 숨김
    this.addWindow(this._akenaDebugWindow);                      // 씬에 추가
  };

  const _update = Scene_Map.prototype.update;                    // 원본 보관
  Scene_Map.prototype.update = function() {
    _update.call(this);                                          // 원본 호출
    if (Input.isTriggered("akenaDebugToggle")) {                 // F10 눌림
      const w = this._akenaDebugWindow;                          // 창 참조
      if (w) { w.visible = !w.visible; if (w.visible) w.refresh(); } // 토글+즉시 갱신
    }
  };
})();
