# Akena RMMZ Plugins

RPG Maker MZ 전용으로 제작한 Akena 플러그인 모음입니다.

---

## 다운로드 방법

아래 **다운로드** 링크는 `main` 브랜치의 최신 `.js` 파일을 엽니다. 코드가 화면에 표시되면 `Ctrl+S`로 저장하고, 파일명과 `.js` 확장자를 유지하세요.
다운로드된 파일을 프로젝트의 `js/plugins` 폴더에 넣은 뒤 플러그인 매니저에서 추가하면 됩니다.

---

## 플러그인 목록

| 플러그인 | 버전 | 설명 | 다운로드 |
|----------|------|------|----------|
| Akena_Debug | v1.0 | 디버그 뷰어 — 파티 HP/MP, 변수, 스위치 실시간 확인 (F10 토글) | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_Debug.js) |
| Akena_EventHelper | v1.0 | 다수의 스위치/변수 조건을 한 번에 평가 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_EventHelper.js) |
| Akena_Message_ImageShow | v1.0 | 메시지와 함께 이미지 표시 (L/C/R 배치, 페이드, 화자 강조 지원) | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_Message_ImageShow.js) |
| Akena_BattleHitBalloon | v1.0 | 전투 중 피격 시 액터 위에 말풍선 이펙트 표시 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_BattleHitBalloon.js) |
| Akena_BossHPBar | v3.0 | 전투 중 보스 HP바를 화면 상단에 표시 — 다중 보스 세로 스택, 이름 자동 축소, 전투 중 소환 감지, 메모리 자동 정리 지원 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_BossHPBar.js) |
| Akena_SideviewActorPosition | v1.0 | 사이드뷰 전투 액터 위치를 해상도(Graphics.boxWidth/Height) 기반으로 동적 계산하여 배치 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_SideviewActorPosition.js) |
| Akena_EnemyIdleFloat | v1.1 | 전투 중 몬스터 스프라이트에 사인파 기반 상하 부유 애니메이션 적용 — 랜덤 위상으로 각 몬스터 독립적으로 움직임 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_EnemyIdleFloat.js) |
| Akena_ItemPopup | v1.0 | 아이템/무기/방어구/골드 획득 시 화면 상단 전체폭 팝업 표시 — 큐 기반 순차 표시, 색상/투명도/메시지 커스터마이징 가능 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_ItemPopup.js) |
| Akena_CharacterScale | v1.0 | 캐릭터 크기 커스텀 — 등록한 이미지의 주인공·동료·NPC를 설정한 배율로 일괄 확대·축소 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_CharacterScale.js) |
| Akena_TitleImages | — | 타이틀 이미지 커스텀 — 배경·로고·메뉴 버튼 이미지 교체 및 배치 조정, 기본·선택 이미지와 메뉴 표시 설정 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_TitleImages.js) |
| Akena_Camera | — | 카메라 모드 커스텀 — 기본·부드러운 추적·항상 중앙 선택, 부드러운 추적률 조절, 항상 중앙 모드의 맵 밖 검정 표시 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_Camera.js) |
| Akena_CameraScene | — | 카메라 연출 — 목표 좌표로 이동·확대·유지·복귀, 대사형 연출과 단계별 시간·배율 설정, 즉시 취소·복원 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_CameraScene.js) |
| Akena_Message_Custom | v1.0 | 대화창 커스텀 — 이미지 한 장으로 본문·이름창·선택지 꾸미기, 창 크기·글자 여백 자동 처리 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_Message_Custom.js) |
| Akena_MG_MemoryCards | v1.0 | 전투 배경 위에서 액터 Face 이미지를 활용하는 카드 짝맞추기 미니게임 — 결과 변수/스위치 반환, 시작/종료 연출 지원 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_MG_MemoryCards.js) |
| Akena_PointAndClick | — | 포인트 앤 클릭 — 그림의 지정 영역에 마우스를 올리면 표식을 표시하고 클릭하면 맵 이벤트 실행, 이벤트 페이지로 조사 완료 관리 | [다운로드](https://raw.githubusercontent.com/pranaria/Akena-RMMZ-Plugins/main/Akena_PointAndClick.js) |

---

## 카메라 모드 사용

- 시작 모드에서 기본, 부드러운 추적, 항상 중앙 중 하나를 선택합니다.
- 추적률은 부드러운 추적 모드에만 적용됩니다. 낮을수록 카메라가 늦게 따라옵니다.
- 기본과 부드러운 추적은 맵 가장자리 제한을 유지합니다. 항상 중앙은 플레이어를 중앙에 유지하고 비루프 맵 밖을 검정으로 표시합니다.

---

## 카메라 연출 사용

- `Akena_CameraScene.js`를 추가하고 ON으로 설정합니다. 단독으로 사용할 수 있습니다.
- 잠깐 보여주고 돌아오려면 이벤트의 **자동 연출** 명령에서 목표 X/Y, 확대 배율과 이동·확대·유지·축소·복귀 시간을 설정합니다. 시간 단위는 초, 확대 배율은 1~4배입니다.
- 대사를 읽는 동안 화면을 유지하려면 **이동·확대 → 텍스트 표시 → 복귀** 순서로 구성합니다. 대사형 연출은 복귀 명령을 꼭 넣어야 합니다.
- 목표 좌표는 카메라로 보여줄 타일이며 플레이어의 이동 좌표가 아닙니다. 연출이 끝나면 실행 전 화면 위치와 확대 상태로 복원합니다.
- **즉시 취소·복원**으로 진행 중인 연출을 끝내고 화면과 입력 잠금을 복원할 수 있습니다.
- 맵 가장자리에서는 화면 이동이 제한됩니다. 연출 중에는 다른 화면 스크롤·확대·플레이어 강제 이동을 겹치지 마세요.
- `Akena_Camera`와 함께 쓰는 경우에만 해당 플러그인 아래에 배치합니다. 다른 카메라 플러그인과의 호환성은 별도 확인이 필요합니다.

---

## 대화창 커스텀 사용

- 사용 영상: [Custom Message Windows in RPG Maker MZ | MZ Plugin 41](https://www.youtube.com/watch?v=PySFkptQo0U)
- `Akena_Message_Custom.js`를 `js/plugins`에 넣고 플러그인 관리자에서 추가해 ON으로 설정합니다.
- **JS 파일만 제공합니다.** PNG는 직접 준비해 `img/pictures` 또는 그 하위 폴더에 넣고 관리자에서 **프레임 이미지**로 선택합니다. 특정 하위 폴더명은 필수가 아닙니다. 완성 게임 배포 시 선택한 PNG와 사용한 하위 폴더도 포함해야 합니다.
- 기본 **텍스트 표시·화자 이름·선택지 표시**를 그대로 사용합니다. 본문·이름창·선택지에 같은 이미지 한 장을 적용하며, 별도 플러그인 명령은 없습니다. 이미지 초기값은 비어 있고 미지정·누락 시 기본 MZ 창을 사용합니다.
- 이미지를 표시하려면 텍스트 표시와 선택지 표시의 배경을 **창(Window)** 으로 설정합니다. **어둡게(Dim)·투명(Transparent)** 은 커스텀 이미지의 테두리와 배경 모두 표시하지 않고 기본 MZ 방식으로 출력합니다.
- 이미지 예제 크기는 **1280×220**이며 필수 규격은 아닙니다. 원본의 바깥 **32px**를 테두리, 가운데를 글자 배경으로 준비하세요. 고정32px 기준을 쓰려면 가로·세로 모두 **65px 이상**으로 만드세요.
- 모양을 유지할 장식은 **각 모서리32×32px 안**에 그립니다. 네 모서리는 보존하고 위·아래 변은 가로로, 왼쪽·오른쪽 변은 세로로, 가운데 배경은 가로·세로로 늘립니다. 큰 장식·중앙을 침범하는 그림·이미지 안의 문자는 피하세요. 임의 이미지의 글자 안전 영역을 자동 인식하는 기능은 아닙니다.
- 창 크기·위치·글자 여백은 내부에서 처리하며 본문4줄 공간을 확보합니다. 숫자/아이템 입력창과 메뉴는 변경하지 않습니다. 같은 메시지 창을 변경하는 다른 플러그인과 함께 쓸 때는 별도 호환성 확인이 필요합니다.

---

## 포인트 앤 클릭 사용

- 사용 영상: [Point-and-Click Interaction in RPG Maker MZ | MZ Plugin 42](https://www.youtube.com/watch?v=KZ5mzy3iw6c)
- `Akena_PointAndClick.js`를 `js/plugins`에 넣고 플러그인 관리자에서 추가해 ON으로 설정합니다. 별도 플러그인 명령은 없습니다.
- **JS 파일만 제공합니다.** 배경과 표식 PNG는 직접 준비합니다. 공통 표식용 투명 PNG를 `img/pictures` 또는 그 하위 폴더에 넣고 **강조 이미지**에서 선택하세요. **조사 표식 크기**는 최대 가로·세로 픽셀 크기이며 클릭 영역과 별개입니다. 이미지를 지정하지 않으면 표식 없이 클릭만 처리합니다.
- 사용할 맵의 메모에 영문 소문자로 `<area>`를 입력합니다. 대상 맵 이벤트의 현재 페이지에 **주석**으로 `<area: X,Y,너비,높이>`를 입력합니다. 예를 들어 `<area: 20,320,145,55>`는 해당 물건에 맞춘 예시이며 고정 규격이 아닙니다. 좌표는 타일 위치가 아닌 게임 화면의 픽셀입니다.
- 이벤트 이미지는 비우고 트리거는 **결정 버튼**으로 설정합니다. 같은 페이지에 텍스트 표시·아이템 지급·스위치 변경 등 기존 이벤트 명령을 작성하면 클릭 시 해당 이벤트가 실행됩니다.
- 조사를 마치면 셀프 스위치 A를 켜고, 2페이지 출현 조건을 A로 설정합니다. 2페이지에 `area` 주석을 넣지 않으면 표식과 클릭 반응이 꺼집니다. 완료 상태는 각 이벤트의 셀프 스위치로 관리하며 대상 ID를 별도로 등록할 필요가 없습니다.
- 영역은 화면 좌표의 사각형이며 표식은 그 중심에 표시합니다. 배경 그림이나 카메라의 이동·확대를 따라가지 않습니다. 영역이 겹치면 이벤트 ID가 큰 대상 하나가 우선합니다.
- `<area>` 맵에서는 캐릭터 이동과 맵 클릭 이동을 차단합니다. 캐릭터 숨김·배경 표시·메뉴 설정은 기존 이벤트로 처리합니다. 이동 버튼은 제공하지 않으며, 필요한 경우 이벤트에 기본 **장소 이동** 명령을 작성합니다.
- 이벤트 실행·대화·화면 전환 중에는 조사 입력을 처리하지 않습니다. 마우스 오버 표시는 PC 마우스 기준이며, 같은 입력·맵 씬·캐릭터 이동을 변경하는 다른 플러그인과의 호환성은 별도 확인이 필요합니다.

---

## 주의사항

- 모든 플러그인은 **RPG Maker MZ 전용**입니다. RPG Maker MV 등 다른 버전과는 호환되지 않을 수 있습니다.
- 플러그인 적용 전 프로젝트 백업을 권장합니다.

---

## 라이선스

[MIT License](LICENSE)

본 플러그인은 자유롭게 사용, 수정, 재배포가 가능합니다.  
게임 엔딩 크레딧 또는 게임 내 플러그인 목록에 **Akena** 표기를 권장합니다.
