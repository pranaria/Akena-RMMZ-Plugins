/*:
 * @target MZ
 * @plugindesc (v1.00) 다수의 스위치/변수 조건을 한 번에 평가 <Akena_EventHelper>
 * @author Akena
 *
 * @help
 * ■ 개요
 * 여러 개의 스위치와 변수 조건을 한 번에 처리할 수 있는 플러그인입니다.
 * 모든 조건은 AND(모두 참일 때만 true)로 결합합니다.
 *
 * ■ 왜 필요한가?
 * - 원래는 스위치/변수 조건 분기를 여러 번 나눠 써야 합니다.
 * - 이 플러그인을 쓰면 한 번에 묶어서 평가할 수 있어 이벤트가 간결해집니다.
 *
 * ■ 입력 방법 (플러그인 명령: Evaluate Basic)
 * 1) Switches(스위치 조건)
 *    - 콤마(,)로 여러 개 구분, 공백은 무시
 *    - 예시 입력 → 의미
 *      "1"       → 스위치 #1 이 ON 일 때
 *      "!2"      → 스위치 #2 가 OFF 일 때
 *      "3=ON"    → 스위치 #3 이 ON 일 때
 *      "4=OFF"   → 스위치 #4 가 OFF 일 때
 *    - "switch3=ON" 같은 표기도 허용 (대소문자 무시)
 *
 * 2) Variables(변수 조건)
 *    - 콤마(,)로 여러 개 구분, 공백은 무시
 *    - 지원 연산자: ==, !=, >=, <= (초과 > / 미만 < 은 초급판에서 미지원)
 *    - 예시 입력 → 의미
 *      "10==5"    → 변수 #10 이 5 와 같다
 *      "11!=3"    → 변수 #11 이 3 이 아니다
 *      "12>=100"  → 변수 #12 가 100 이상(경계 포함)
 *      "13<=20"   → 변수 #13 이 20 이하(경계 포함)
 *
 * 3) ResultKey(선택)
 *    - 결과를 이름으로 저장합니다. 비우면 "최근 결과"만 저장합니다.
 *    - 예: "QuestStart", "DoorA", "Event1" 등
 *
 * ■ 조건 결과를 쓰는 방법 (조건 분기 → 스크립트 탭)
 * 1) ResultKey 를 지정한 경우
 *    - 플러그인 명령에서 ResultKey: "QuestStart"
 *    - 조건 분기(스크립트)에서 다음과 같이 작성:
 *        Akena.EventHelper.get("QuestStart") === true
 *
 *    예시 이벤트 흐름:
 *      ◆ 플러그인 명령: Evaluate Basic
 *            Switches: 1,!2
 *            Variables: 3>=10
 *            ResultKey: QuestStart
 *      ◆ 조건 분기(스크립트): Akena.EventHelper.get("QuestStart") === true
 *        ◆ 텍스트: 조건 만족! 퀘스트 시작
 *      ：그 외의 경우
 *        ◆ 텍스트: 조건 불충족
 *
 * 2) ResultKey 를 비운 경우(최근 결과 사용)
 *    - 플러그인 명령에서 ResultKey 공란
 *    - 조건 분기(스크립트)에서 다음과 같이 작성:
 *        Akena.EventHelper.get() === true
 *
 *    예시:
 *      ◆ 플러그인 명령: Evaluate Basic
 *            Switches: 5,6
 *            Variables: 1==10
 *            ResultKey: (비움)
 *      ◆ 조건 분기(스크립트): Akena.EventHelper.get() === true
 *        ◆ 텍스트: 조건 충족!
 *
 * ■ 동작 규칙 요약
 * - 모든 조건은 AND 로 묶입니다(하나라도 거짓이면 false).
 * - 입력이 모두 비어 있으면 결과는 false 입니다.
 * - 잘못된 입력(형식 오류/존재하지 않는 ID 등)은 조용히 false 처리됩니다.
 *
 * ■ 팁
 * - 같은 이벤트 페이지에서 "플러그인 명령 → 바로 조건분기"로 사용하면 안전합니다.
 * - 병렬/자동실행 등 동시 실행이 많은 경우엔 ResultKey 로 이름을 붙여 저장하면
 *   서로의 결과가 덮어쓰이지 않아 관리가 쉽습니다.
 *
 * 이 플러그인은 초급자도 이해하기 쉽도록 간단한 규칙만 제공합니다.
 *
 * @command EvalBasic
 * @text Evaluate Basic
 * @desc (초급) Switches/Variables 조건을 AND로 평가하고 내부 상태에 저장합니다.
 *
 * @arg Switches
 * @text Switches
 * @type string
 * @default
 * @desc 예: 1,!2,3=ON,4=OFF  (콤마 구분, 공백 무시)
 *
 * @arg Variables
 * @text Variables
 * @type string
 * @default
 * @desc 예: 10>=5, 11==3, 12!=0  (지원: ==, !=, >=, <=)
 *
 * @arg ResultKey
 * @text Result Key (선택)
 * @type string
 * @default
 * @desc 결과를 이름으로 저장(예: QuestStart). 비우면 최근 결과만 저장.
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "Akena_EventHelper";

  // ---------------- 내부 상태 저장소 ----------------
  // $gameTemp._AkenaEH = { last: boolean, map: { [key: string]: boolean } }
  function ensureStore() {
    if (!$gameTemp._AkenaEH) {
      $gameTemp._AkenaEH = { last: false, map: Object.create(null) }; // 최초 1회 생성
    }
    return $gameTemp._AkenaEH;
  }

  // 외부(스크립트)에서 결과를 가져오기 위한 간단 API
  window.Akena = window.Akena || {};
  Akena.EventHelper = {
    get(key) {                                // 최근 or 키별 결과 반환
      const store = ensureStore();
      if (typeof key === "string" && key.length > 0) {
        return !!store.map[key];              // 지정 키 결과(true/false)
      }
      return !!store.last;                    // 최근 실행 결과(true/false)
    },
    _set(key, value) {                        // 내부 저장용(플러그인 명령에서 호출)
      const store = ensureStore();
      store.last = !!value;                   // 최근 결과 저장
      if (typeof key === "string" && key.length > 0) {
        store.map[key] = !!value;             // 키 이름으로 결과 저장
      }
    }
  };

  // ---------------- 유틸 함수 ----------------
  const trim = s => (typeof s === "string" ? s.trim() : "");                         // 앞뒤 공백 제거
  const splitCSV = s => (s ? s.split(",").map(t => t.trim()).filter(Boolean) : []);  // 콤마 분리
  const isPosInt = n => Number.isSafeInteger(n) && n > 0;                            // 양의 정수?

  // ---------------- 파서(문자열 → 조건 노드) ----------------
  // 스위치 토큰 파싱: "1", "!2", "3=ON", "4=OFF", "switch5=on"
  function parseSwitchToken(tok) {
    if (/^!\s*\d+$/.test(tok)) {                           // "!N" → OFF 기대
      const id = Number(tok.replace("!", "").trim());
      return isPosInt(id) ? { id, expect: false } : null;  // 유효 ID면 노드 생성
    }
    const m = /^(?:switch)?\s*(\d+)(?:\s*=\s*(on|off))?$/i.exec(tok); // N[=ON|OFF]
    if (!m) return null;
    const id = Number(m[1]);
    if (!isPosInt(id)) return null;
    const state = m[2];
    if (!state) return { id, expect: true };               // "N" 단독 → ON 기대
    return { id, expect: state.toLowerCase() === "on" };   // "N=ON/OFF"
  }

  // 변수 토큰 파싱: "10>=5", "11==3" (연산자 4종만 지원)
  function parseVariableToken(tok) {
    const m = /^(\d+)\s*(==|!=|>=|<=)\s*(-?\d+)$/.exec(tok);
    if (!m) return null;
    const id  = Number(m[1]);
    const op  = m[2];
    const rhs = Number(m[3]);
    if (!isPosInt(id) || !Number.isFinite(rhs)) return null; // 정수 ID/값만
    return { id, op, rhs };                                  // {변수ID, 연산자, 비교값}
  }

  // ---------------- 평가기(AND 고정) ----------------
  function evalSwitches(tokens) {
    for (const t of tokens) {
      const node = parseSwitchToken(t);
      if (!node) return false;                              // 잘못된 입력 → 실패
      const cur = $gameSwitches.value(node.id) === true;    // 현재 스위치 상태(true/false)
      if (cur !== node.expect) return false;                // 기대와 다르면 실패
    }
    return true;                                            // 모두 통과 → true
  }

  function evalVariables(tokens) {
    for (const t of tokens) {
      const node = parseVariableToken(t);
      if (!node) return false;                              // 잘못된 입력 → 실패
      const cur = Number($gameVariables.value(node.id) || 0); // 변수 값(없으면 0으로 간주)
      switch (node.op) {
        case "==": if (cur !== node.rhs) return false; break; // "같다"가 아니면 실패
        case "!=": if (cur === node.rhs) return false; break; // "같지 않다"가 아니면 실패
        case ">=": if (cur <  node.rhs) return false; break; // rhs 미만이면 실패
        case "<=": if (cur >  node.rhs) return false; break; // rhs 초과이면 실패
      }
    }
    return true;                                            // 모두 통과 → true
  }

  // ---------------- 플러그인 명령 ----------------
  PluginManager.registerCommand(PLUGIN_NAME, "EvalBasic", (args) => {
    const swTokens  = splitCSV(trim(args.Switches  || "")); // 스위치 조건들 배열
    const varTokens = splitCSV(trim(args.Variables || "")); // 변수 조건들 배열
    const key       = trim(args.ResultKey || "");           // 결과 키(선택)

    // 조건이 하나도 없으면 false
    let result = false;
    if (swTokens.length === 0 && varTokens.length === 0) {
      result = false;
    } else {
      // 각각의 그룹을 평가(비어 있으면 true로 간주하여 AND에 영향 없도록)
      const okSw  = swTokens.length  ? evalSwitches(swTokens)   : true; // 스위치 모두 충족?
      const okVar = varTokens.length ? evalVariables(varTokens) : true; // 변수   모두 충족?
      result = okSw && okVar;                                         // 둘 다 true 여야 최종 true
    }

    Akena.EventHelper._set(key, result); // 최근/키별 결과 저장
  });

})();
