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
| WASD | 이동 (시점 기준 — yaw + **pitch 포함** 3D 방향벡터) |
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

## 비행기 모델 설정

- `MODEL_YAW_OFFSET = Math.PI` — GLB 모델이 기본적으로 뒤를 보므로 180° 보정
- `CAM_BACK = 12` — 카메라에서 비행기까지 거리 (줄일수록 비행기가 가까이 보임)
- `CAM_UP = 5` — 카메라 위 오프셋
- 이동 방향: pitch + yaw 모두 반영한 3D forward 벡터 사용 (위를 보고 W누르면 실제로 위로 이동)
- 카메라 back 벡터도 pitch 반영 → 급상승 시 카메라가 비행기 아래-뒤에서 따라옴

---

## 터미널 분리 워크플로우

Claude Code를 두 터미널로 나눠서 병렬 작업할 때의 규칙.

### 에셋 터미널 (리서치·다운로드 담당)
- **건드리는 폴더**: `public/` only
- **절대 금지**: `src/` 수정, `CLAUDE.md` 수정
- **완료 시**: `public/ASSETS_MANIFEST.md`에 다운로드된 파일 목록·경로·권장 scale 기록
- **참고 소스**: 아래 참고 문서 섹션 링크 활용

### 코딩 터미널 (구현 담당 — 메인)
- **건드리는 폴더**: `src/` only (+ `CLAUDE.md` 수정 가능)
- **에셋 확인**: `public/ASSETS_MANIFEST.md` 읽고 경로·scale 확인 후 구현
- **커밋**: `src/` 파일만 스테이징

### 핸드오프 파일 형식 (`public/ASSETS_MANIFEST.md`)
```markdown
## 완료된 에셋
- plane.glb → /plane.glb (scale 권장: 0.5)
- building_low.glb → /building_low.glb (scale 권장: 1.0)
```

> 두 터미널이 동시에 달라도 `public/` vs `src/` 분리라 git merge conflict 없음.

---

## Z-Fighting (바닥 지지직) 해결법

### 문제 정의
여러 평면이 같은 y=0에 겹쳐 있을 때 GPU depth buffer 정밀도 한계로 픽셀이 어느 면에 속하는지 매 프레임 랜덤하게 바뀌는 현상. 이 프로젝트에서는 기본 ground → 타운 컬러 패치 → 도로 → 차선 마킹이 모두 y=0에 쌓여 있어서 발생.

---

### ❌ 하면 안 되는 방법들

**1. `polygonOffset` (작은 값)**
```tsx
<meshStandardMaterial polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-2} />
```
- 비스듬한 각도(oblique angle)에서 `factor`가 0에 수렴 → `units`만 남는데 작은 값이면 정밀도 부족
- 카메라 거리가 멀어질수록 depth buffer 정밀도 자체가 낮아져 더 심해짐
- **결론**: 완전히 평평한 면들의 z-fighting에는 근본적으로 부적합

**2. `depthWrite={false}` 단독 사용**
```tsx
<meshStandardMaterial depthWrite={false} />
```
- depth buffer에 쓰지 않을 뿐, 읽기(depthTest)는 그대로
- base ground(depthWrite=true)가 depth를 쓴 뒤, 오버레이가 같은 y=0에서 depth test를 받으면 floating point 오차로 여전히 실패
- **결론**: 공중에 뜨거나 더 심하게 깜빡임

**3. `depthWrite={false}` + `renderOrder` 조합**
```tsx
<mesh renderOrder={1}>
  <meshStandardMaterial depthWrite={false} />
</mesh>
```
- renderOrder가 draw 순서를 보장해도, 두 면이 정확히 같은 y=0이면 오버레이 fragment depth가 base ground가 기록한 depth보다 floating point 오차로 미세하게 커서 depth test 실패
- 일부 픽셀/프레임에서 여전히 싸움
- **결론**: 이론상 맞지만 진짜 coplanar에서는 실패

**4. `depthTest={false}` 사용**
- depthTest를 끄면 해당 면이 건물·나무 위에도 그려짐 → 건물이 바닥에 묻힘
- **결론**: 장면 전체가 깨짐

**5. `logarithmicDepthBuffer`**
- 먼 거리 depth 정밀도를 개선하는 것이지, 완전히 같은 좌표의 z-fighting은 해결 안 됨
- 성능 ~50% 하락, antialiasing 깨짐, 모바일 불안정
- **결론**: 이 문제엔 맞지 않고 오히려 해롭다

**6. Y를 너무 크게 띄우기 (y=1, y=3, y=5 등)**
- 비스듬한 각도에서 바닥이 공중에 뜬 것처럼 보임
- 도로 측면이 벽처럼 보이거나 패치 가장자리가 경계선으로 보임
- **결론**: 시각적으로 망가짐

---

### ✅ 올바른 해결법 — 레이어별 미세 Y 오프셋

각 레이어를 물리적으로 다른 Y에 배치. 값이 극히 작으면 어떤 각도에서도 보이지 않음.

**이 프로젝트의 실제 레이어 구조 (`City.tsx`)**

| Y 위치 | 레이어 |
|---|---|
| `0.0` | 베이스 ground (갈색, 3000×3000) |
| `0.5` | 타운 외곽 컬러 패치 (360×360) |
| `1.0` | 타운 내곽 컬러 패치 (220×220) |
| `2.0` | 도로 |
| `2.5` | HTJ 레드 카펫 (도로 위에 있어서 도로 y보다 높아야 함) |
| `3.0` | HTJ 골드 트림 |
| `4.0` | 차선 마킹 (카펫 y=2.5와 겹치는 구역 있어서 카펫보다 높아야 함) |
| `3.5` | HTJ 별 오각형 |

**왜 0.5 이상이어야 하나**: depth buffer 정밀도는 카메라~fragment 거리의 제곱에 비례해 나빠짐 (`Δz_min ≈ d² × 1.2e-7`). 0.2 단위는 카메라 거리 ~1300 유닛 이상에서 부족. 0.5 단위는 ~2000 유닛까지 안전. 레이어 간 **최소 0.5 유닛** 간격 유지.

**새 ground-level 레이어 추가 시 규칙**: 기존 최대 Y(`2.5`)보다 `+0.5` 이상 높게 설정. 절대 `y=0`에 두지 말 것.

---

## 참고 문서

- **Drei 공식**: https://drei.pmnd.rs
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Rapier 물리**: https://rapier.rs/docs
- **Sketchfab CC0 모델**: https://sketchfab.com/search?features=downloadable&sort_by=-likeCount&q=lowpoly
- **Polyhaven 텍스처**: https://polyhaven.com/textures
- **GLTF 변환 (Blender 없이)**: https://gltf.report

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
