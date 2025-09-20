// Akena_Message_ImageShow.js
/*:
 * @target MZ
 * @plugindesc (v1.0) 메시지와 함께 이미지 열기/닫기 (L/C/R 영역 배치 · 자동축소/페이드 · 화자강조 Brightness · FOCUS 지원) <Akena_Message_ImageShow>
 * @author Akena with GPTS
 *
 * @help
 * ========================================================================
 * ■ 플러그인 개요
 * ------------------------------------------------------------------------
 *  - 대화 중 캐릭터 이미지를 화면에 띄우고(L/C/R), 자연스러운 페이드로
 *    등장/퇴장을 연출합니다.
 *  - 화면 가로를 L/C/R 3등분한 "영역(Rect)" 안에 이미지를 비율 유지
 *    Contain 방식으로 배치(업스케일 금지)합니다.
 *  - 화자 강조 모드(옵션): 말하는 슬롯만 밝기 1.0, 나머지는 0.7로 어둡게.
 *    (Opacity가 아닌 Brightness 필터로 처리 → 투명해지지 않음)
 *  - 메시지창 위치(상/중/하) 변경, 해상도 변경에도 매 프레임 리레이아웃
 *    하여 안정적으로 정렬/스케일을 유지합니다.
 *
 * ========================================================================
 * ■ 사용 방법 (Show Text 내 제어문)
 * ------------------------------------------------------------------------
 *  \SHOW[파일명,슬롯]  : 이미지 표시 (파일=img/pictures/의 파일명, 확장자 생략)
 *  \HIDE[슬롯...]      : 슬롯별 페이드아웃 (L, C, R, ALL 지원)
 *  \FOCUS[슬롯]        : 화자 전환 (L/C/R), \FOCUS[OFF] : 화자 없음(모두 밝게)
 *
 *  예)
 *   \SHOW[Hero,L]\SHOW[Priest,C]\SHOW[Knight,R]
 *   \FOCUS[L]안녕?     ← L만 밝기 1.0, 나머지 0.7
 *   \FOCUS[C]설명할게요
 *   \HIDE[C]           ← C 퇴장
 *   \FOCUS[OFF]        ← 모두 밝기 1.0
 *
 * ========================================================================
 * ■ 규칙/특징
 * ------------------------------------------------------------------------
 *  - Scene_Map 전용 (맵에서만 표시), 메시지창 뒤 레이어에 렌더링
 *  - "그림 표시"(Show Picture)와 레이어 분리 → 서로 간섭 없음
 *  - 자동 ALL 제거 없음: 반드시 \HIDE[...] 를 사용해 명시적으로 퇴장 처리
 *  - 정렬: 가로 중앙, 세로 하단(메시지창 윗변 - GapY)
 *  - 영역 높이 비율(RegionHeightPercent) × 메시지창 윗변 높이를 사용
 *  - 안전성: 파라미터 상한/하한, 내부 값 클램프로 비정상 입력 방지
 *
 * ========================================================================
 * ■ 파라미터 설명(원복용 기본값)
 * ------------------------------------------------------------------------
 *  - FadeInFrames (30)      : \SHOW 페이드 인 시간(프레임)
 *  - FadeOutFrames (30)     : \HIDE 페이드 아웃 시간(프레임)
 *  - RegionPaddingX (8)     : L/C/R 영역 좌우 여백(px)
 *  - GapY (8)               : 이미지 하단과 메시지창 윗변 간격(px)
 *  - RegionHeightPercent(0.85): 화면상단~메시지창 윗변 높이 중 사용할 비율
 *  - DimOthersEnabled (false): 화자강조 모드 ON/OFF
 *
 * ========================================================================
 * ■ 트러블슈팅
 * ------------------------------------------------------------------------
 *  - 이미지가 너무 작다  : 업스케일 금지 정책 → 원본이 작으면 그대로 작게 출력됨
 *  - 위치가 어긋난다    : 메시지창 위치/해상도 변경도 매 프레임 보정(자동)
 *  - 너무 어둡다        : 화자강조 OFF로 사용(파라미터)
 *  - 사라지지 않는다    : 자동 ALL 제거 없음 → \HIDE[...] 필요
 *
 * ========================================================================
 * @param FadeInFrames
 * @text 페이드 인 프레임
 * @type number
 * @min 1
 * @max 600
 * @default 30
 *
 * @param FadeOutFrames
 * @text 페이드 아웃 프레임
 * @type number
 * @min 1
 * @max 600
 * @default 30
 *
 * @param RegionPaddingX
 * @text 영역 좌우 여백(px)
 * @type number
 * @min 0
 * @max 100
 * @default 8
 *
 * @param GapY
 * @text 메시지창 윗선 여백(px)
 * @type number
 * @min 0
 * @max 100
 * @default 8
 *
 * @param RegionHeightPercent
 * @text 영역 높이 비율
 * @type number
 * @decimals 2
 * @min 0.10
 * @max 1.00
 * @default 0.85
 *
 * @param DimOthersEnabled
 * @text 화자 강조 모드
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 */

(() => {
  "use strict";

  // ─────────────────────────────────────────────────────────────────────
  // 파라미터 로드
  // ─────────────────────────────────────────────────────────────────────
  const P = PluginManager.parameters("Akena_Message_ImageShow");
  const FADE_IN_FRAMES  = Number(P.FadeInFrames  || 30);   // \SHOW 페이드 인 프레임
  const FADE_OUT_FRAMES = Number(P.FadeOutFrames || 30);   // \HIDE 페이드 아웃 프레임
  const PADDING_X       = Number(P.RegionPaddingX || 8);   // 영역 좌우 여백(px)
  const GAP_Y           = Number(P.GapY || 8);             // 메시지창 윗선과의 간격(px)
  const HEIGHT_RATE     = Number(P.RegionHeightPercent || 0.85); // 영역 높이 비율(0.1~1.0)
  const DIM_ENABLED     = P.DimOthersEnabled === "true";   // 화자강조 ON/OFF

  // 화자강조 고정값(파라미터화하지 않음)
  const DIM_BRIGHTNESS  = 0.7;  // 비화자 밝기(0.0~1.0, 1.0=정상)
  const DIM_FADE_FRAMES = 15;   // 밝기 전환 프레임(부드럽게)

  // ─────────────────────────────────────────────────────────────────────
  // 전용 레이어 확보 (메시지창 뒤에 삽입)
  // ─────────────────────────────────────────────────────────────────────
  function ensureLayer(scene) {
    if (!(scene instanceof Scene_Map)) return null;     // 맵 전용
    if (!scene._imageShowLayer) {
      const layer = new Sprite();                       // 스프라이트 컨테이너
      const idx = Math.max(0, scene.children.indexOf(scene._windowLayer));
      scene.addChildAt(layer, idx);                     // 메시지창 뒤에 삽입
      // 레이어 업데이트(매 프레임): 페이드/밝기/리레이아웃
      layer.update = function() {
        Sprite.prototype.update.call(this);
        ImageShow._updateFades();                       // 페이드 보간
        ImageShow._updateDim();                         // 화자강조 밝기 보간
        ImageShow._relayoutAll();                       // 메시지창/해상도 변화 대응
      };
      scene._imageShowLayer = layer;
    }
    return scene._imageShowLayer;
  }

  // ─────────────────────────────────────────────────────────────────────
  // 슬롯별 영역(Rect) 계산
  //  - 화면 가로를 3등분(L/C/R) 후 좌우 여백 적용
  //  - 세로 높이는 "메시지창 윗변"까지의 높이 × 비율(클램프 0.1~1.0)
  //  - baseY: 이미지 하단이 붙을 Y(= 메시지창 윗변 - GapY), 0 미만 방지
  // ─────────────────────────────────────────────────────────────────────
  function calcRegion(slot, msgTop) {
    const rate = Math.min(1.0, Math.max(0.1, HEIGHT_RATE)); // 안전 클램프
    const W = Graphics.width;                               // 화면 너비
    const regionH = Math.max(0, msgTop * rate);             // 사용 높이
    const baseY = msgTop - GAP_Y;                           // 하단 기준

    // 가로 3등분
    let left = 0, right = W;
    if (slot === "L") { left = 0;      right = W / 3; }
    else if (slot === "C") { left = W / 3; right = (2 * W) / 3; }
    else { left = (2 * W) / 3; right = W; }

    left  += PADDING_X;                                     // 좌 여백
    right -= PADDING_X;                                     // 우 여백
    return { x: left, width: right - left, height: regionH, baseY };
  }

  // ─────────────────────────────────────────────────────────────────────
  // Contain 스케일 계산 (비율 유지, 업스케일 금지)
  // ─────────────────────────────────────────────────────────────────────
  function calcScale(imgW, imgH, regionW, regionH) {
    return Math.min(regionW / imgW, regionH / imgH, 1.0);
  }

  // ─────────────────────────────────────────────────────────────────────
  // 메인 매니저
  // ─────────────────────────────────────────────────────────────────────
  const ImageShow = {
    sprites: { L: null, C: null, R: null },   // 슬롯별 스프라이트 참조
    _fades:  { L: null, C: null, R: null },   // 페이드 상태
    _speaker: null,                            // 현재 화자 슬롯 (null=없음)

    // 현재 메시지창 참조
    _msg() {
      const sc = SceneManager._scene;
      return sc && sc._messageWindow ? sc._messageWindow : null;
    },

    // ───── \SHOW 처리: 이미지 로드→스프라이트 생성→레이어 추가
    show(filename, slotRaw) {
      const slot = this._slot(slotRaw || "C");           // 슬롯 정규화(L/C/R/ALL)
      if (!slot) return;
      const scene = SceneManager._scene;
      if (!(scene instanceof Scene_Map)) return;         // 맵에서만 동작
      const layer = ensureLayer(scene);                  // 전용 레이어
      if (!layer) return;

      this._remove(slot);                                // 같은 슬롯 기존 이미지 제거

      const bmp = ImageManager.loadPicture(filename);    // 그림 로드(pictures/)
      bmp.addLoadListener(() => {                        // 로드 완료 후 배치
        const msgTop = (this._msg()?.y) ?? Graphics.height;   // 메시지창 윗변 Y
        const region = calcRegion(slot, msgTop);              // 슬롯 영역 계산
        const scale  = calcScale(bmp.width, bmp.height, region.width, region.height);

        const sp = new Sprite(bmp);
        sp.anchor.set(0.5, 1.0);                        // 중앙·하단 기준
        sp.scale.set(scale, scale);                     // Contain 스케일
        sp.x = region.x + region.width / 2;             // 가로 중앙
        sp.y = Math.max(0, region.baseY);               // 세로 하단(0 미만 방지)
        sp.opacity = 0;                                 // 페이드 인 시작

        if (DIM_ENABLED) {                              // 화자강조 Brightness 필터
          const filter = new PIXI.filters.ColorMatrixFilter();
          filter.reset();                               // 매트릭스 기본값
          filter.brightness(1.0, false);                // 밝기 1.0 (누적 모드)
          filter._ak_brightness = 1.0;                  // 현재 밝기 캐시
          sp.filters = [filter];
        }

        layer.addChild(sp);                              // 레이어에 추가
        this.sprites[slot] = sp;                         // 참조 저장
        this._startFade(slot, 0, 255, FADE_IN_FRAMES, false); // 페이드 인

        if (DIM_ENABLED) this._speaker = slot;           // 새 \SHOW 슬롯을 화자로
      });
    },

    // ───── \HIDE 처리: 슬롯/ALL 페이드 아웃
    hide(slotRaw) {
      const slot = this._slot(slotRaw || "C");
      if (!slot) return;
      if (slot === "ALL") {
        ["L", "C", "R"].forEach(s => this._fadeOutSlot(s, FADE_OUT_FRAMES));
      } else {
        this._fadeOutSlot(slot, FADE_OUT_FRAMES);
      }
      if (this._speaker === slot) this._speaker = null;  // 화자 사라지면 화자 없음
    },

    // \HIDE 여러 슬롯 지원 (["L","R"] / ["ALL"] / 빈값→"C")
    hideMany(list) {
      const arr  = (Array.isArray(list) ? list : [list]).map(s => String(s).toUpperCase());
      if (arr.includes("ALL")) { this.hide("ALL"); return; }
      const uniq = [...new Set(arr.filter(s => ["L", "C", "R"].includes(s)))];
      if (!uniq.length) this.hide("C"); else uniq.forEach(s => this.hide(s));
    },

    // ───── \FOCUS 처리: 화자 전환 / OFF
    focus(slotRaw) {
      const slot = this._slot(slotRaw || "");
      // ALL 또는 빈값은 화자 없음으로 처리
      this._speaker = (slot && slot !== "ALL") ? slot : null;
    },

    // ───── 페이드 보간
    _startFade(slot, from, to, dur, removeOnEnd) {
      const sp = this.sprites[slot]; if (!sp) return;
      this._fades[slot] = { sp, from, to, dur: Math.max(1, dur | 0), t: 0, removeOnEnd };
    },
    _updateFades() {
      ["L", "C", "R"].forEach(slot => {
        const f = this._fades[slot]; if (!f) return;
        f.t++;
        const t = Math.min(1, f.t / f.dur);
        const next = Math.round(f.from + (f.to - f.from) * t);
        if (f.sp) f.sp.opacity = next;                  // 투명도 보간
        if (t >= 1) {                                   // 종료 처리
          if (f.removeOnEnd && this.sprites[slot] === f.sp) this._remove(slot);
          this._fades[slot] = null;
        }
      });
    },

    // ───── 화자강조 Brightness 보간
    _updateDim() {
      if (!DIM_ENABLED) return;
      const slots = ["L", "C", "R"];

      // 자동 보조: 화자 미지정 + 표시중 슬롯 1개면 그 슬롯 = 화자
      if (!this._speaker) {
        const visible = slots.filter(s => this.sprites[s]);
        if (visible.length === 1) this._speaker = visible[0];
      }

      slots.forEach(s => {
        const sp = this.sprites[s];
        if (!sp || !sp.filters) return;
        const filter = sp.filters[0];
        if (!(filter instanceof PIXI.filters.ColorMatrixFilter)) return;

        // 목표 밝기: 화자 1.0 / 비화자 0.7 / 화자 없음 1.0
        const target = this._speaker ? (this._speaker === s ? 1.0 : DIM_BRIGHTNESS) : 1.0;
        const cur    = (filter._ak_brightness ?? 1.0);
        const next   = cur + (target - cur) / Math.max(1, DIM_FADE_FRAMES);

        filter.reset();                   // 매 프레임 초기화(색/채도 보존)
        filter.brightness(next, false);   // 누적 모드로 밝기 적용
        filter._ak_brightness = next;     // 캐시 갱신
      });
    },

    // ───── 리레이아웃: 메시지창 위치/해상도/파라미터 변경에 대응
    _relayoutAll() {
      const msg = this._msg(); if (!msg) return;
      const msgTop = msg.y;                                   // 메시지창 윗변
      ["L", "C", "R"].forEach(slot => {
        const sp = this.sprites[slot];
        if (!sp || !sp.bitmap || !sp.bitmap.isReady()) return;

        const region = calcRegion(slot, msgTop);              // 최신 영역
        const sc = calcScale(sp.bitmap.width, sp.bitmap.height, region.width, region.height);

        if (sp.scale.x !== sc || sp.scale.y !== sc) sp.scale.set(sc, sc); // 스케일 보정
        sp.x = region.x + region.width / 2;                   // 가로 중앙
        sp.y = Math.max(0, region.baseY);                     // 세로 하단(0 미만 방지)
      });
    },

    // ───── 내부 유틸: 페이드 아웃 시작 / 즉시 제거
    _fadeOutSlot(slot, dur) {
      const sp = this.sprites[slot]; if (!sp) return;
      this._startFade(slot, sp.opacity, 0, Math.max(1, dur | 0), true);
    },
    _remove(slot) {
      const f = this._fades[slot];
      if (f && f.sp && f.sp.parent) f.sp.parent.removeChild(f.sp);
      this._fades[slot] = null;

      const sp = this.sprites[slot];
      if (sp && sp.parent) sp.parent.removeChild(sp);
      this.sprites[slot] = null;
    },

    // ───── 슬롯 문자열 정규화 (L/C/R/ALL 외 무효 처리)
    _slot(s) {
      const u = String(s || "").trim().toUpperCase();
      return (["L", "C", "R", "ALL"].includes(u) ? u : null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Window_Message 이스케이프 코드 확장: \SHOW / \HIDE / \FOCUS
  // ─────────────────────────────────────────────────────────────────────
  const _processEsc = Window_Message.prototype.processEscapeCharacter;
  Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
      case "SHOW": {                                         // \SHOW[파일,슬롯]
        const [file = "", slot = "C"] = readArgs(textState);
        if (file) ImageShow.show(file, slot);
        return;
      }
      case "HIDE": {                                         // \HIDE[L], \HIDE[L,R], \HIDE[ALL]
        const args = readArgs(textState);
        ImageShow.hideMany(args.length ? args : ["C"]);
        return;
      }
      case "FOCUS": {                                        // \FOCUS[L/C/R], \FOCUS[OFF]
        const [slot = ""] = readArgs(textState);
        ImageShow.focus(slot);
        return;
      }
      default:
        _processEsc.call(this, code, textState);             // 원본 처리
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // [ ... ] 인자 파서: 콤마 구분, 양끝 따옴표 제거
  // ─────────────────────────────────────────────────────────────────────
  function readArgs(textState) {
    const buf = textState.text;
    let i = textState.index;
    if (buf[i] !== "[") return [];
    i++;
    const start = i;
    let depth = 1;
    while (i < buf.length && depth > 0) {
      const ch = buf[i];
      if (ch === "[") depth++;
      else if (ch === "]") depth--;
      i++;
    }
    const raw = buf.slice(start, i - 1);
    textState.index = i;
    return raw.split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ""));
  }
})();
