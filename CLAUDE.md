# htjworld — CLAUDE.md

## 이게 뭔가

`htjworld.github.io` — 비행기를 타고 도시 위를 날아다니며 블로그 글과 프로젝트를 탐험하는 3D 포트폴리오 사이트.

**블로그다. 게임이 아니다.** 방문자가 빌딩 전광판을 클릭해서 글로 이동하는 것이 목적.

---

## 기술 스택

- React 19 + TypeScript (Vite)
- `@react-three/fiber` — Three.js React 바인딩
- `@react-three/drei` — Sky, Text, PointerLockControls, useTexture
- Zustand — 최소 상태 관리 (`started` 여부만)
- GitHub Pages + GitHub Actions 자동 배포

---

## 핵심 설계 원칙

1. **단일 테마** — Creative City (비행 도시)만. 테마 선택 없음.
2. **항상 비행 모드** — 걷기·탱크·탑승 없음. 플레이어는 항상 하늘을 난다.
3. **충돌 있는 건물** — 건물 통과 불가. 최저 고도 `MIN_HEIGHT=5`.
4. **설정 파일 하나** — `src/config/posts.ts`만 수정하면 글 추가/삭제/수정 가능.
5. **게임적 요소 없음** — 체력, 몬스터, 총, 미로, 탈것 없음.
6. **재사용성·확장성** — 새 Town 추가 = `ZONES` 배열에 항목 1개 추가.

---

## 폴더 구조

```
src/
  config/
    posts.ts          ← 글/프로젝트 설정 (유일한 컨텐츠 수정 지점)
  store/
    gameStore.ts      ← started: boolean
    buildings.ts      ← AABB 충돌 박스 (module-level 배열)
  components/
    Scene.tsx         ← Canvas + 조명 + Sky + 조건부 카메라
    PlayerController.tsx ← 비행 조작, PointerLockControls
    City.tsx          ← 3구역 도시 + 도로 + 나무 + 테마 데코
    Billboard.tsx     ← 빌딩 전광판 (이미지 or 텍스트)
    Particles.tsx     ← 절대 좌표 눈/파티클 효과
  App.tsx             ← 오버레이 UI (클릭하여 계속하기)
```

---

## 조작 방식

| 키 | 동작 |
|---|---|
| 화면 클릭 | 마우스 캡처 (Pointer Lock) |
| WASD | 이동 (시점 기준 — `camera.getWorldDirection` 사용) |
| Space | 상승 |
| Ctrl | 하강 |
| Shift | 가속 modifier (WASD·Space·Ctrl 전부에 적용) |
| ESC | 마우스 해제 → 오버레이 표시 |
| 크로스헤어 조준 + 클릭 | 빌딩 링크 오픈 (새 탭) |

---

## 타운 구조

| 타운 | 내용 | 좌표 | 시드 |
|---|---|---|---|
| AI TOWN | AI 관련 글 | x=-430 | 42 |
| WEB TOWN | 웹 개발 글 | x=0 | 137 |
| HTJ TOWN | 프로젝트·수상·포트폴리오 | x=+430 | 271 |

각 타운은 `GRID=7×7`, `SPACING=42`, `DENSITY=0.68`로 생성됨. 시드를 고정해서 매 로드마다 동일한 도시가 생성됨.

---

## 충돌 시스템

물리 엔진(cannon) 없이 순수 AABB 방식:
- `buildings.ts`의 `buildingColliders: Box3[]` — 건물 생성 시 등록, PLAYER_RADIUS만큼 pre-expanded
- `PlayerController`의 `isColliding(pos)` — 이동 전 충돌 검사
- 벽 슬라이딩: X·Z 축 분리 테스트 → 한 축이라도 이동 가능하면 슬라이딩

---

## 글 추가 방법

`src/config/posts.ts`에 항목 추가:
```ts
{ id: 'web4', town: 'web', title: '제목', linkUrl: 'https://...', imageUrl: '/thumbnail.png' }
```
- `imageUrl` 없으면 텍스트로 자동 표시
- 이미지는 `public/` 폴더에 놓고 `/파일명` 으로 참조

---

## 배포

```
git push main → GitHub Actions → npm run build → peaceiris/gh-pages → gh-pages 브랜치
```
- GitHub Pages 설정: Source = `gh-pages` 브랜치 루트
- `vite.config.ts`: `base: '/'`

---

## v2 예정

- 각 타운 캐릭터 (AI타운: 로봇 NPC, WEB타운: 개발자 NPC, HTJ타운: htj 캐릭터)
- 총 이스터에그: 맵에서 총 발견 → 클릭하면 장착 → 쏠 수 있음
- 폭탄 이스터에그
- HTJ Town 특별 이스터에그 (거대 htj 등장 또는 노래 재생)
- 야간/주간 전환
- 모바일 터치 조작
- 각 타운 진입 시 안내 팝업 (타운 이름 + 설명)
- 비행 속도에 따른 파티클 밀도 변화 (빠를수록 빽빽하게)
- 빌딩 호버 시 툴팁 (제목 미리보기)
