# htjworld — Airplane Blog Plan
> Claude Code용 구현 스펙 문서

## 프로젝트 개요
- **컨셉**: hello world → htjworld (한태진 월드). 비행기로 날아다니며 탐험하는 3D 블로그
- **배포**: `htjworld.github.io` (정적 파일, 서버 없음)
- **기술**: Three.js (CDN), Vanilla JS, 단일 index.html + config.js

---

## 파일 구조
```
htjworld.github.io/
├── index.html        ← 메인 (Three.js import, 게임 루프)
├── config.js         ← 블로그 글 설정만 모아놓은 파일 (쉽게 수정)
├── img/              ← 빌딩 전광판 이미지들
│   ├── ai1.png
│   ├── web1.png
│   └── ...
└── README.md
```

---

## 기술 스펙

### 렌더링
- **Three.js r160** CDN (importmap 사용)
- **WebGL renderer** + shadowMap
- github.io는 정적 서버 → 외부 API 호출 없이 순수 클라이언트 사이드

### 카메라
- **3인칭 시점**: 비행기 뒤 + 약간 위에서 따라가는 카메라
- 비행 시 카메라 살짝 기울어지는 연출
- `THREE.PerspectiveCamera(65, aspect, 0.1, 500)`

---

## 맵 레이아웃

```
전체 너비: 약 250 units

[  AI TOWN  ] [  WEB TOWN  ] [  HTJ TOWN  ]
  x: -90       x: 0 (시작)    x: +90
  너비: 80      너비: 80        너비: 80
  gap: 5        gap: 5
```

- 플레이어 시작 위치: Web Town 중앙 `(0, 0, 0)`
- 각 타운은 평면 바닥 + 빌딩들로 구성
- 타운 경계는 색상/분위기로 구분 (물리 벽 없음, 자유롭게 이동 가능)

---

## 조작법

| 키 | 동작 |
|---|---|
| W / A / S / D | 전진 / 좌 / 후진 / 우 이동 |
| Space (더블탭) | 비행 모드 전환 ON |
| Space (꾹) | 비행 중 상승 |
| Shift + Space | 비행 중 하강 |
| 지상 상태 | 비행기가 땅 위를 걸어다니는 것처럼 |
| 비행 상태 | 3D 공중 이동 가능 |
| 마우스 클릭 | Raycasting으로 빌딩 클릭 → 링크 이동 |
| 마우스 호버 | 빌딩 위 툴팁 표시 |

### 비행 상태 머신
```
GROUND → (Space x2) → FLYING → (Land) → GROUND
```
- Space 더블탭 감지: 300ms 이내 두 번 누르면 비행 전환
- 비행 중 고도 0 이하로 내려가면 자동 착지 (GROUND 상태)

---

## 타운별 비주얼

### AI Town (왼쪽, x: -90)
- 바닥 색: `#1a0a2e` (어두운 보라)
- 강조 색: `#7b2fff` (보라 네온)
- 빌딩 스타일: 네온 테두리, 미래적
- 분위기 키워드: cyberpunk, AI, neural

### Web Town (가운데, x: 0, 시작점)
- 바닥 색: `#0d1117` (어두운 회색)
- 강조 색: `#00ff88` (초록 네온)
- 빌딩 스타일: 모던, 깔끔
- 분위기 키워드: developer, code, terminal

### HTJ Town (오른쪽, x: +90)
- 바닥 색: `#0f0a00` (어두운 황금)
- 강조 색: `#ffaa00` (골드)
- 빌딩 스타일: 따뜻한 톤, 개인적
- 분위기 키워드: personal, world, identity

---

## 빌딩 시스템 (핵심 재사용 구조)

### config.js 구조
```javascript
// 이 파일만 수정해서 글 추가/삭제/수정
const CONFIG = {
  ai: {
    label: 'AI TOWN',
    floorColor: 0x1a0a2e,
    accentColor: 0x7b2fff,
    shuffle: false, // true면 enabled 글들을 랜덤으로 빌딩에 배치
    posts: [
      {
        title: "MCP 공연 추천 개발기",
        url: "https://velog.io/@htjworld/...",
        image: "img/ai1.png", // null이면 텍스트 전광판으로 자동 생성
        enabled: true
      },
      { enabled: false }, // disabled → 일반 건물처럼 보임
    ]
  },
  web: { ... },
  htj: { ... }
};
```

### 빌딩 로직
1. `enabled: true` 포스트 → 이미지/텍스트 전광판 텍스처 생성, Hover/클릭 가능
2. `enabled: false` → 일반 회색 건물 (Hover/클릭 불가)
3. `shuffle: true` → enabled 포스트들을 빌딩 위치에 랜덤 순환 배치
4. 이미지가 null이면 Canvas로 텍스트 전광판 자동 생성

### 빌딩 배치
각 타운당 빌딩 슬롯: **6개** (3열 × 2행)
```
도로를 중심으로 좌우에 3개씩 배치
[B1] [B2] [B3]
     도로
[B4] [B5] [B6]
```

### 빌딩 텍스처 (Canvas 2D로 자동 생성)
- image가 있으면: 이미지 로드해서 전광판에 표시
- image가 null이면: Canvas에 타이틀 텍스트 + 강조색 테두리로 전광판 자동 생성

### Hover 효과
- `Raycaster`로 마우스 위치 계산
- enabled 빌딩 hover 시:
  - 빌딩 Y 위치 +0.5 애니메이션
  - 커서 pointer로 변경
  - 타이틀 툴팁 표시 (화면 하단 또는 마우스 근처)
- 클릭 시: `window.open(url, '_blank')`

---

## 기타 씬 요소

### Stars (별)
- `THREE.Points`로 3000개 별 랜덤 배치
- 높이 10 이상에 배치

### Fog
- `THREE.FogExp2(0x0a0a0f, 0.015)` — 멀리 있는 건물 자연스럽게 흐려짐

### 도로
- 각 타운 내 십자 도로 (X, Z 방향)
- 노란 점선 마킹

### 조명
- AmbientLight: 전체 약한 조명
- DirectionalLight: 태양광 + 그림자

### 타운 표지판
- 각 타운 입구(Z: -40)에 타운 이름 플로팅 텍스트 플레인

---

## HUD

```
[좌상단]
TOWN: WEB TOWN
MODE: ✈ FLYING  /  🚶 GROUND

[우하단]
WASD — 이동
SPACE×2 — 비행
SPACE — 상승
SHIFT+SPACE — 하강

[중앙]
십자선 (가는 선)

[마우스 근처]
툴팁 (hover된 빌딩 타이틀)
```

### 현재 타운 감지
플레이어 X 위치 기준:
- `x < -45` → AI TOWN
- `-45 <= x <= 45` → WEB TOWN
- `x > 45` → HTJ TOWN

---

## 온보딩 팝업

첫 진입 시 전체화면 오버레이:
```
htjworld
──────────────────
hello, world. — han taejin's world

WASD 이동 | Space×2 비행
Space 상승 | Shift+Space 하강
클릭 → 블로그 이동

📝 리스트로 보려면 velog →

— 클릭해서 탐험 시작 —
```

클릭하면 팝업 닫히고 게임 시작.

---

## MVP 이후 (v2 구현 목록)

- 각 타운 주민 캐릭터 (AI타운: 로봇, Web타운: 개발자, HTJ타운: htj 캐릭터)
- 총 이스터에그: 맵에 총 오브젝트 → 클릭 시 장착 → 연속 발사
- 폭탄 이스터에그: 클릭 시 장착 → 클릭마다 폭탄 투하
- 총/폭탄 맞으면 주민 도망가고 쓰러지는 이펙트
- HTJ Town 이스터에그: 특정 건물 클릭 시 노래 재생 or 거대 htj 등장
- 비행기 앞 1인칭 시점 토글 (F키)
- 모바일 터치 조작
- 로딩 화면

---

## 주의사항
- github.io = 정적 호스팅만 가능. Node.js 서버 없음.
- Three.js는 CDN importmap으로 로드 (npm 빌드 없음)
- config.js는 `<script src="config.js"></script>`로 로드 (ES module 아님)
  - ⚠️ index.html에서 config.js를 `<script>` 태그로 먼저 로드한 뒤 `<script type="module">`로 Three.js 코드 작성
  - config.js의 CONFIG 객체는 window.CONFIG 또는 전역 변수로 접근
- 이미지는 상대경로 `img/` 폴더 기준
- CORS 이슈 방지: 로컬 테스트는 `npx serve .` 또는 VS Code Live Server 사용
- Canvas Texture + 로컬 이미지: github.io는 same-origin이라 CORS 없음. 로컬 테스트 시 반드시 로컬 서버 사용 (file:// 프로토콜은 Canvas CORS 에러 발생)

---

## 플레이어 오브젝트 스펙 (명시 필요)

### 비행기 형태
- Three.js 기본 geometry 조합으로 만들기
  - 몸통: `BoxGeometry(1.5, 0.4, 3)` (흰색/회색)
  - 날개: `BoxGeometry(4, 0.1, 1)` (동일 색)
  - 꼬리: `BoxGeometry(0.1, 0.8, 0.8)`
- 전체를 `Group`으로 묶어서 플레이어 오브젝트로 사용
- 지상 이동 시 바퀴가 땅에 붙어있는 것처럼 y 고정
- > 💡 **Claude Code**: 더 나은 비행기 geometry 구성이 있으면 Three.js 공식 예제나 three.js journey 참고해서 결정

### 이동 수치
- **지상 이동 속도**: 0.15 units/frame
- **비행 이동 속도**: 0.2 units/frame (지상보다 빠름)
- **상승/하강 속도**: 0.1 units/frame
- **최대 고도**: 50 units
- **최소 고도(착지)**: 0 units (y=0에서 자동 착지)
- **카메라 오프셋**: 플레이어 뒤 8, 위 4 → `camera.position = player.position + (0, 4, 8)` (월드 기준이 아닌 플레이어 로컬 기준)

### 방향 전환 메커니즘 (중요)
- **A/D 키**: 플레이어가 좌/우로 회전 (Y축 회전, 각도 변화 ±0.03 rad/frame)
- **W/S 키**: 현재 바라보는 방향으로 전진/후진
- **카메라**: 항상 플레이어 뒤에서 따라옴 (마우스로 카메라 조작 없음)
- 비행 중 상승 시 비행기가 앞으로 약간 기울어지는 연출 (X축 회전 -0.2 rad)
- > 💡 **Claude Code**: PointerLockControls는 사용하지 않음. 수동으로 플레이어 rotation.y 업데이트 후 카메라 위치 계산

---

## 빌딩 정확한 수치

### 빌딩 크기
- 일반 빌딩 (disabled): `BoxGeometry(6, 12, 6)` ~ `BoxGeometry(8, 20, 8)` 랜덤
- 전광판 빌딩 (enabled): `BoxGeometry(8, 15, 8)` 고정 (전광판 면이 앞쪽 Z 방향)
- 전광판 면: 빌딩 앞면 전체에 Canvas 텍스처 적용

### 빌딩 배치 좌표 (타운 로컬 기준, 타운 중심이 x=0)
```
Z: -20  [B1(-15,0,-20)] [B2(0,0,-20)] [B3(15,0,-20)]
        ←——————— 도로 (z=0, 너비 6) ———————→
Z: +20  [B4(-15,0,+20)] [B5(0,0,+20)] [B6(15,0,+20)]
```
- 빌딩 간 X 간격: 15 units
- 빌딩과 도로 Z 간격: 20 units
- 실제 월드 좌표 = 타운 오프셋(x: -90/0/+90) + 로컬 좌표

### Canvas 텍스처 해상도
- 전광판 텍스처: `512 x 512` px
- 타이틀 텍스트: `canvas.font = 'bold 32px Courier New'`
- 배경: 타운 accentColor의 어두운 버전
- 테두리: accentColor

---

## 맵 경계 처리
- 맵 끝에 보이지 않는 벽 없음 (자유롭게 이동 가능)
- 단, 맵 밖으로 너무 나가면 HUD에 경고 없음 (MVP에서는 처리 안 함)
- > 💡 **Claude Code**: MVP에서는 경계 처리 생략. v2에서 맵 끝 안개 강화로 자연스럽게 유도

---

## Three.js CDN importmap 정확한 URL
> 💡 **Claude Code**: 구현 시작 전 아래 URL이 유효한지 확인하고, 최신 stable 버전으로 교체할 것
```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
```
- jsdelivr CDN이 막히면 unpkg 대안: `https://unpkg.com/three@0.160.0/build/three.module.js`
- importmap은 `<script type="module">` 보다 앞에 위치해야 함
- config.js `<script>` 태그는 importmap보다 앞에 위치

---

## 렌더링 루프 구조
```javascript
// 권장 구조
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta(); // THREE.Clock 사용
  
  handleInput(delta);      // WASD, Space 처리
  updatePlayer(delta);     // 플레이어 위치/회전
  updateCamera();          // 카메라 추적
  updateHoverEffect();     // Raycaster hover
  updateHUD();             // 타운명, 비행모드 업데이트
  
  renderer.render(scene, camera);
}
```
- `THREE.Clock`으로 delta time 계산 (프레임레이트 독립적 이동)
- 이동 수치에 delta 곱해서 사용: `speed * delta * 60` (60fps 기준으로 정규화)
