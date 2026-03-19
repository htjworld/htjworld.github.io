# htjworld — airplane-blog-plan2.md
> Claude Code 구현 스펙 | 이 파일 하나로 처음부터 완전 구현 가능

---

## 프로젝트 개요

- **이름**: htjworld (hello world → han taejin's world)
- **목적**: 비행기로 날아다니며 탐험하는 3D 포트폴리오 블로그
- **배포**: `htjworld.github.io` (정적 파일, 서버 없음)
- **기술**: Three.js r160 CDN, Vanilla JS, 단일 index.html + config.js
- **로컬 테스트**: `npx serve .` 필수 (file:// 프로토콜은 CORS 에러)

---

## 설계 원칙

### 1. 블로그가 목적이다
htjworld는 게임이 아니라 **블로그**다. 방문자가 처음 들어와서 "와, 신기하다" 하고 글을 클릭하는 게 목표.
- 성능이 최우선. 진입 시 버벅이면 방문자 바로 이탈
- 비행기 하나로 날아다니는 것 자체가 정체성
- 탱크, 걷기, 적, 전투 등 게임 요소는 MVP에 없음 → v2 이스터에그로만

### 2. 재사용성 + 확장성
- `config.js`만 수정해서 글 추가/삭제 가능
- 새 타운 추가 = config.js에 key 하나 추가만으로 동작
- 타운 빌딩 생성은 `buildTown(key)` 하나의 함수로 처리 (중복 코드 금지)

### 3. 시점 방식 (레퍼런스 PlayerController 방식 그대로)
- **PointerLockControls 기본** — 클릭 시 마우스 캡처 → 마우스로 시점 회전
- WASD = 카메라 바라보는 방향 기준 이동 (레퍼런스와 동일)
- Space = 상승 / Shift+Space = 하강
- Shift+W = 부스트 (레퍼런스 BOOST_MULTIPLIER 3.0)
- ESC = 마우스 해제

---

## 비주얼 핵심 (레퍼런스 분석 결과)

레퍼런스가 멋있었던 이유 3가지. **이 3가지가 전부다.**

### 1. Sky 셰이더 (가장 큰 차이)
`drei`의 `<Sky sunPosition={[100,20,100]} />`가 Three.js `Sky` 애드온을 쓰는 것.
대기 산란(Rayleigh scattering)으로 하늘을 파랗게, 지평선을 희뿌옇게 만드는 셰이더.
이것 하나로 "그냥 검은 배경" vs "하늘을 나는 느낌" 차이가 생긴다.

→ **`three/addons/objects/Sky.js` 반드시 추가**

### 2. Stars = 눈 내리는 효과
`drei`의 `<Stars />`는 구체 반경 안에 5000개 흰 파티클을 랜덤 배치.
**비행 속도(레퍼런스 SPEED=40)로 날면 파티클이 사방에서 스쳐지나가며 눈 내리는 것처럼 보임.**
이게 바로 "눈 내리는 효과"의 정체 — 따로 눈 내리는 로직이 아니라 파티클 속을 빠르게 지나가는 것.

→ **파티클 8000개, 넓은 구형 분포, sizeAttenuation: true**

### 3. 배경 도시 밀도
레퍼런스 City는 -10~+10 그리드 × 30 spacing = 600×600 유닛 도시, 최대 441개 건물.
htjworld의 3개 타운(18개 빌딩)만으로는 "도시 속을 나는 느낌" 안 남.
배경에 InstancedMesh로 수백 개 건물을 깔아야 스케일이 생긴다.

→ **배경 도시 InstancedMesh 추가 (타운 주변 채우기)**

---

## 파일 구조

```
htjworld.github.io/
├── index.html     ← 전체 로직 (Three.js importmap 포함)
├── config.js      ← 블로그 글 설정 (이 파일만 수정)
├── img/           ← 광고판 이미지 (없어도 됨 - Canvas 폴백)
│   └── .gitkeep
├── CLAUDE.md
└── progress.md
```

---

## config.js 전체 코드

```javascript
// config.js — 이 파일만 수정해서 글 추가/삭제
const CONFIG = {
  ai: {
    label: 'AI TOWN',
    floorColor: 0x1a0a2e,
    accentColor: 0x7b2fff,
    shuffle: false,
    posts: [
      {
        id: 'ai1',
        title: "MCP 공연 추천 개발기",
        linkUrl: "https://velog.io/@htjworld",
        imageUrl: null,   // "img/ai1.jpg" 또는 외부URL 또는 null(Canvas 폴백)
        ratio: 1.5,       // width / height
        enabled: true
      },
      {
        id: 'ai2',
        title: "AI Agent 의도 추론",
        linkUrl: "https://velog.io/@htjworld",
        imageUrl: null,
        ratio: 1.0,
        enabled: true
      },
      { enabled: false },
      { enabled: false },
      { enabled: false },
      { enabled: false },
    ]
  },
  web: {
    label: 'WEB TOWN',
    floorColor: 0x0d1117,
    accentColor: 0x00ff88,
    shuffle: false,
    posts: [
      { id: 'web1', title: "htjworld 개발기", linkUrl: "https://velog.io/@htjworld", imageUrl: null, ratio: 1.5, enabled: true },
      { id: 'web2', title: "Three.js로 3D 블로그", linkUrl: "https://velog.io/@htjworld", imageUrl: null, ratio: 1.5, enabled: true },
      { id: 'web3', title: "SSAFY 프로젝트 회고", linkUrl: "https://velog.io/@htjworld", imageUrl: null, ratio: 1.5, enabled: true },
      { enabled: false },
      { enabled: false },
      { enabled: false },
    ]
  },
  htj: {
    label: 'HTJ TOWN',
    floorColor: 0x0f0a00,
    accentColor: 0xffaa00,
    shuffle: false,
    posts: [
      { id: 'htj1', title: "ArtBridge — MCP Top3", linkUrl: "https://github.com/htjworld/art-bridge", imageUrl: null, ratio: 1.5, enabled: true },
      { id: 'htj2', title: "Aevis — AI 면접 앱", linkUrl: "https://github.com/htjworld/aevis", imageUrl: null, ratio: 1.5, enabled: true },
      { enabled: false },
      { enabled: false },
      { enabled: false },
      { enabled: false },
    ]
  }
};
```

---

## index.html 뼈대

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>htjworld</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #000; }
    canvas { display: block; }
    #hud {
      position: fixed; top: 20px; left: 20px;
      color: #00ff88; font: 14px/2 'Courier New', monospace;
      pointer-events: none; text-shadow: 0 0 8px currentColor; z-index: 10;
    }
    #controls-hint {
      position: fixed; bottom: 20px; right: 20px;
      color: #444; font: 12px/2 'Courier New', monospace;
      pointer-events: none; text-align: right; z-index: 10;
    }
    #crosshair {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      pointer-events: none; width: 10px; height: 10px;
      background: white; border-radius: 50%;
      mix-blend-mode: difference; z-index: 10;
    }
    #tooltip {
      position: fixed; display: none;
      background: rgba(0,0,0,0.85); color: #fff;
      padding: 6px 14px; border-radius: 4px;
      font: 13px 'Courier New', monospace; pointer-events: none;
      border: 1px solid rgba(255,255,255,0.15); z-index: 10;
    }
    #onboarding {
      position: fixed; inset: 0; background: rgba(0,0,0,0.93);
      display: flex; align-items: center; justify-content: center;
      z-index: 100; cursor: pointer;
    }
    .ob { text-align: center; font-family: 'Courier New', monospace; max-width: 500px; padding: 40px; color: #fff; }
    .ob h1 { font-size: 52px; letter-spacing: 6px; color: #00ff88; text-shadow: 0 0 30px #00ff88; margin-bottom: 20px; }
    .ob hr  { border: none; border-top: 1px solid #222; margin: 20px 0; }
    .ob p   { color: #888; font-size: 14px; line-height: 2.2; margin-bottom: 10px; }
    .ob a   { color: #00ff88; }
    .ob .start { margin-top: 28px; color: #444; font-size: 12px; animation: blink 1.5s ease-in-out infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
  </style>
</head>
<body>

<div id="onboarding">
  <div class="ob">
    <h1>htjworld</h1>
    <hr>
    <p>hello, world. — han taejin's world</p>
    <p>
      클릭해서 마우스 캡처 → 마우스로 시점 조작<br>
      WASD 이동 &nbsp;|&nbsp; Space 상승 &nbsp;|&nbsp; Shift+Space 하강<br>
      Shift+W 부스트 &nbsp;|&nbsp; ESC 마우스 해제<br>
      클릭 → 블로그 이동
    </p>
    <p>📝 <a id="velog-link" href="https://velog.io/@htjworld" target="_blank">리스트로 보려면 velog →</a></p>
    <p class="start">— 클릭해서 탐험 시작 —</p>
  </div>
</div>

<div id="hud">
  <div id="hud-town">TOWN: WEB TOWN</div>
  <div id="hud-mode">✈ FLYING</div>
</div>

<div id="controls-hint">
  WASD — 이동<br>
  SPACE — 상승 &nbsp; SHIFT+SPACE — 하강<br>
  SHIFT+W — 부스트<br>
  ESC — 마우스 해제
</div>

<div id="crosshair"></div>
<div id="tooltip"></div>

<!-- config.js 반드시 importmap보다 먼저 -->
<script src="config.js"></script>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>

<script type="module">
  /* Block 1~13 순서대로 조립 */
</script>
</body>
</html>
```

---

## JavaScript 구현 코드 (Block 1~13)

### Block 1 — Import + Renderer + Scene

```javascript
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

const scene = new THREE.Scene();
// 배경색은 Sky 셰이더가 덮어쓰므로 fallback용
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0xc9e8ff, 0.008);  // Sky와 어울리는 옅은 안개

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;  // 영화같은 톤매핑 (레퍼런스 효과)
renderer.toneMappingExposure = 1.0;  // 0.5는 너무 어두움. Sky 셰이더에는 0.8~1.0 적합
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 20, 50);  // 레퍼런스와 동일한 시작 위치

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### Block 2 — Sky 셰이더 + 조명 (레퍼런스 핵심 비주얼)

```javascript
// ── Sky 셰이더 (레퍼런스 <Sky sunPosition={[100,20,100]} /> 이식) ──
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 10;        // 대기 탁도
skyUniforms['rayleigh'].value = 2;          // 레일리 산란 (하늘 파란 정도)
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

// 태양 위치 (레퍼런스 sunPosition=[100,20,100] 대응)
const sunVec = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(85);  // 고도각 (낮은 태양 = 더 드라마틱)
const theta = THREE.MathUtils.degToRad(180);
sunVec.setFromSphericalCoords(1, phi, theta);
skyUniforms['sunPosition'].value.copy(sunVec);

// ── 조명 (Sky 태양 방향에 맞춤) ──
scene.add(new THREE.AmbientLight(0xffffff, 0.5));  // 레퍼런스 intensity 0.5

const sunLight = new THREE.DirectionalLight(0xffd580, 1.0);  // 따뜻한 태양광
sunLight.position.copy(sunVec).multiplyScalar(100);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.left = -150; sunLight.shadow.camera.right = 150;
sunLight.shadow.camera.top  =  150; sunLight.shadow.camera.bottom = -150;
sunLight.shadow.camera.far  = 500;
scene.add(sunLight);

const pointLight = new THREE.PointLight(0xffffff, 1);  // 레퍼런스 pointLight
pointLight.position.set(10, 10, 10);
scene.add(pointLight);
```

### Block 3 — Stars/Snow 파티클 + 메인 바닥

```javascript
// ── Stars = 눈 내리는 효과 ──
// 레퍼런스 <Stars />: 구체 반경 내 파티클이 카메라를 따라다님
// SPEED=40으로 날면 파티클이 사방에서 스쳐지나가며 눈처럼 보임
// ⚠️ 반드시 starsPoints 변수로 저장 → tick에서 camera 위치 동기화 필수
const starsPoints = (() => {
  const pos = [];
  for (let i = 0; i < 8000; i++) {
    // 구형 분포 (레퍼런스 Stars와 동일)
    const r = 150 + Math.random() * 350;  // 반경 150~500 (카메라 기준 상대 좌표)
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos.push(
      r * Math.sin(p) * Math.cos(t),
      r * Math.cos(p),           // 음수 y도 허용 (발 아래도 별)
      r * Math.sin(p) * Math.sin(t)
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  }));
  scene.add(points);
  return points;
})();

// ── 메인 바닥 ──
const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshLambertMaterial({ color: 0x1a1a1a })  // 레퍼런스 #222 대응
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -0.5;
groundMesh.receiveShadow = true;
scene.add(groundMesh);
```

### Block 4 — 배경 도시 (레퍼런스 City 스케일 재현)

```javascript
// 레퍼런스 City: -10~+10 그리드 × 30 spacing = 600×600 유닛에 최대 441개 건물
// htjworld: 3개 타운 주변을 배경 건물로 채워서 "진짜 도시 속을 나는 느낌" 생성
// InstancedMesh 사용 → draw call 1개로 수백 개 처리

function buildBackgroundCity() {
  const gridSize = 14;
  const spacing = 28;
  const townCenters = [-90, 0, 90];

  const bldgList = [];
  for (let gx = -gridSize; gx <= gridSize; gx++) {
    for (let gz = -gridSize; gz <= gridSize; gz++) {
      const wx = gx * spacing;
      const wz = gz * spacing;

      // 타운 구역 제외 (타운 반경 55 유닛 내)
      const nearTown = townCenters.some(tx => Math.abs(wx - tx) < 55 && Math.abs(wz) < 55);
      if (nearTown) continue;
      if (Math.random() > 0.65) continue;  // 레퍼런스 Math.random() > 0.7 대응 (약간 더 촘촘)

      bldgList.push({
        wx, wz,
        w: 8 + Math.random() * 10,   // 레퍼런스: 10 + random * 10
        h: 8 + Math.random() * 40,   // 레퍼런스: 10 + random * 40
        d: 8 + Math.random() * 10,
        dark: Math.random() > 0.5    // 레퍼런스: #444 vs #666 두 가지 색
      });
    }
  }

  // 색상 두 가지 → 두 개 InstancedMesh
  const darkList = bldgList.filter(b => b.dark);
  const lightList = bldgList.filter(b => !b.dark);

  [[darkList, 0x2a2a33], [lightList, 0x3a3a44]].forEach(([list, color]) => {
    if (!list.length) return;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    mesh.castShadow = false;  // 배경 건물은 그림자 끔 (성능)
    mesh.receiveShadow = false;

    const dummy = new THREE.Object3D();
    list.forEach((b, i) => {
      dummy.position.set(b.wx, b.h / 2, b.wz);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
  });
}

buildBackgroundCity();
```

### Block 5 — Canvas 텍스처 유틸 + 캐시

```javascript
const textureCache = {};

function toRgb(hex) {
  return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
}

function makeSignTex(title, accentHex) {
  const key = title + '_' + accentHex;
  if (textureCache[key]) return textureCache[key];

  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 512;
  const ctx = cv.getContext('2d');
  const { r, g, b } = toRgb(accentHex);
  const rc = n => Math.round(n * 255);

  ctx.fillStyle = `rgb(${rc(r*0.07)},${rc(g*0.07)},${rc(b*0.07)})`;
  ctx.fillRect(0, 0, 512, 512);
  const cs = `rgb(${rc(r)},${rc(g)},${rc(b)})`;
  ctx.strokeStyle = cs; ctx.lineWidth = 8; ctx.strokeRect(8, 8, 496, 496);
  ctx.lineWidth = 2;    ctx.strokeRect(20, 20, 472, 472);

  ctx.fillStyle = cs;
  ctx.font = 'bold 32px Courier New';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = title.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > 430 && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  const lh = 50;
  lines.forEach((l, i) => ctx.fillText(l, 256, 256 - (lines.length - 1) * lh / 2 + i * lh));
  ctx.font = '16px Courier New';
  ctx.fillStyle = `rgba(${rc(r*0.7)},${rc(g*0.7)},${rc(b*0.7)},0.55)`;
  ctx.fillText('[ CLICK TO READ ]', 256, 468);

  const tex = new THREE.CanvasTexture(cv);
  textureCache[key] = tex;
  return tex;
}
```

### Block 6 — AdBoard 함수 (레퍼런스 AdBoard.tsx 이식)

```javascript
// 레퍼런스 AdBoard:
// - Frame: BoxGeometry + MeshStandardMaterial color="#333"
// - Surface: PlaneGeometry + MeshBasicMaterial (조명 계산 없음 → 빠름)
// - imageUrl → TextureLoader / null → Canvas 폴백

function makeAdBoard(post, accentHex) {
  const group = new THREE.Group();
  const boardW = 6.5;
  const boardH = post.ratio ? boardW / post.ratio : boardW;

  // Frame (레퍼런스 #333)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(boardW + 0.5, boardH + 0.5, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  frame.position.z = -0.05;
  group.add(frame);

  // Surface (MeshBasicMaterial — 레퍼런스 동일)
  const surfaceGeo = new THREE.PlaneGeometry(boardW, boardH);
  const fallbackMat = () => new THREE.MeshBasicMaterial({ map: makeSignTex(post.title, accentHex) });

  let mat;
  if (post.imageUrl) {
    const tex = new THREE.TextureLoader().load(
      post.imageUrl, undefined, undefined,
      () => { surface.material = fallbackMat(); }
    );
    mat = new THREE.MeshBasicMaterial({ map: tex });
  } else {
    mat = fallbackMat();
  }

  const surface = new THREE.Mesh(surfaceGeo, mat);
  surface.position.z = 0.1;
  group.add(surface);

  // Hover 색상 변경 (레퍼런스 hovered ? '#ddd' : 'white' 대응)
  group.userData = { isAdBoard: true, post, surface };

  return { group, surface, post };
}
```

### Block 7 — disabled 빌딩 InstancedMesh

```javascript
function buildDisabledInstances(disabledList) {
  if (!disabledList.length) return;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: 0x2a2a33 });
  const mesh = new THREE.InstancedMesh(geo, mat, disabledList.length);
  mesh.castShadow = true;

  const dummy = new THREE.Object3D();
  disabledList.forEach((b, i) => {
    dummy.position.set(b.wx, b.h / 2, b.wz);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
}
```

### Block 8 — 도로 + 타운 표지판

```javascript
function buildRoads(ox) {
  const rm = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const r1 = new THREE.Mesh(new THREE.PlaneGeometry(6, 80), rm);
  r1.rotation.x = -Math.PI / 2; r1.position.set(ox, 0.005, 0); scene.add(r1);
  const r2 = new THREE.Mesh(new THREE.PlaneGeometry(80, 6), rm);
  r2.rotation.x = -Math.PI / 2; r2.position.set(ox, 0.005, 0); scene.add(r2);
  const dm = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  for (let z = -35; z <= 35; z += 8) {
    if (Math.abs(z) < 4) continue;
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 3), dm);
    d.rotation.x = -Math.PI / 2; d.position.set(ox, 0.01, z); scene.add(d);
  }
}

function buildTownSign(label, accentHex, ox) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext('2d');
  const { r, g, b } = toRgb(accentHex);
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = `rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},0.95)`;
  ctx.font = 'bold 54px Courier New';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 64);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, side: THREE.DoubleSide, depthWrite: false })
  );
  mesh.position.set(ox, 14, -42);
  scene.add(mesh);
}
```

### Block 9 — 타운 빌딩 배치

```javascript
const SLOTS = [
  { x: -15, z: -20 }, { x: 0, z: -20 }, { x: 15, z: -20 },
  { x: -15, z:  20 }, { x: 0, z:  20 }, { x: 15, z:  20 },
];
const TOWN_OFFSETS = { ai: -90, web: 0, htj: 90 };
const enabledBoards = [];

function buildTown(key) {
  const cfg = CONFIG[key];
  const ox = TOWN_OFFSETS[key];

  // 타운 바닥
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshLambertMaterial({ color: cfg.floorColor })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(ox, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  buildRoads(ox);
  buildTownSign(cfg.label, cfg.accentColor, ox);

  // 타운 포인트 라이트 (네온 분위기)
  const pl = new THREE.PointLight(cfg.accentColor, 3, 100);
  pl.position.set(ox, 10, 0);
  scene.add(pl);

  let posts = [...cfg.posts];
  while (posts.length < 6) posts.push({ enabled: false });
  posts = posts.slice(0, 6);

  if (cfg.shuffle) {
    const en = posts.filter(p => p.enabled);
    const dis = posts.filter(p => !p.enabled);
    for (let i = en.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [en[i], en[j]] = [en[j], en[i]];
    }
    posts = [...en, ...dis];
  }

  const disabledList = [];
  const BW = 8, BH = 15, BD = 8;

  SLOTS.forEach((sl, i) => {
    const post = posts[i];
    const wx = ox + sl.x;
    const wz = sl.z;

    if (post && post.enabled) {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(BW, BH, BD),
        new THREE.MeshLambertMaterial({ color: 0x1a1a2a })
      );
      body.position.set(wx, BH / 2, wz);
      body.castShadow = true;
      scene.add(body);

      // 네온 엣지
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(BW, BH, BD)),
        new THREE.LineBasicMaterial({ color: cfg.accentColor, transparent: true, opacity: 0.6 })
      );
      edges.position.set(wx, BH / 2, wz);
      scene.add(edges);

      // AdBoard 부착 (레퍼런스: position={[0, 0, b.size[2] / 2 + 0.1]})
      const board = makeAdBoard(post, cfg.accentColor);
      if (wz < 0) {
        board.group.position.set(wx, BH * 0.6, wz + BD / 2 + 0.15);
      } else {
        board.group.position.set(wx, BH * 0.6, wz - BD / 2 - 0.15);
        board.group.rotation.y = Math.PI;
      }
      scene.add(board.group);
      enabledBoards.push(board);
    } else {
      const w = 6 + Math.random() * 2;
      const h = 10 + Math.random() * 10;
      const d = 6 + Math.random() * 2;
      disabledList.push({ wx, wz, w, h, d });
    }
  });

  buildDisabledInstances(disabledList);
}

['ai', 'web', 'htj'].forEach(buildTown);

// enabledBoards 채워진 후 surfaces 배열 생성
const surfaces = enabledBoards.map(b => b.surface);
```

### Block 10 — 플레이어 포지션 추적용 더미 객체

```javascript
// PointerLock 1인칭이므로 비행기 메시는 화면에 안 보임
// 위치 추적만 하는 더미 Object3D (v2 이스터에그 시 활용)
const player = new THREE.Object3D();
player.position.set(0, 20, 50);
scene.add(player);
```

### Block 11 — PointerLockControls + 입력 (레퍼런스 PlayerController 방식)

```javascript
// 레퍼런스 PlayerController.tsx 그대로:
// - PointerLockControls로 마우스 시점 제어
// - WASD + Space/Shift+Space 이동
// - velocity.applyEuler(camera.rotation) → 카메라 바라보는 방향 기준 이동

const controls = new PointerLockControls(camera, renderer.domElement);
// ⚠️ scene.add(controls.object) 하지 말 것 — camera를 scene에 add하면 frustum culling 오작동

const keys = {};
let started = false;

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// 온보딩 클릭 → PointerLock 진입
const obEl = document.getElementById('onboarding');
document.getElementById('velog-link').addEventListener('click', e => e.stopPropagation());
obEl.addEventListener('click', () => {
  controls.lock();
});

controls.addEventListener('lock', () => {
  obEl.style.display = 'none';
  started = true;
});

controls.addEventListener('unlock', () => {
  // ESC로 해제되면 온보딩은 다시 안 보여줌 (재클릭으로 다시 잠금)
  document.body.style.cursor = 'pointer';
  document.body.onclick = () => { controls.lock(); document.body.onclick = null; };
});
```

### Block 12 — Raycaster + HUD DOM

```javascript
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');
let hovered = null;

// PointerLock 중에는 화면 중앙 크로스헤어 기준으로 Raycaster
// → mouse는 항상 (0, 0) 중앙 고정

renderer.domElement.addEventListener('click', () => {
  if (started && hovered && controls.isLocked) {
    window.open(hovered.post.linkUrl, '_blank');
  }
});

const hudTown = document.getElementById('hud-town');
const hudMode = document.getElementById('hud-mode');

function townAt(x) {
  if (x < -45) return { name: 'AI TOWN',  color: '#7b2fff' };
  if (x >  45) return { name: 'HTJ TOWN', color: '#ffaa00' };
  return { name: 'WEB TOWN', color: '#00ff88' };
}
```

### Block 13 — 메인 게임 루프 (레퍼런스 PlayerController.useFrame 이식)

```javascript
const clock = new THREE.Clock();
const velocity = new THREE.Vector3();

// 레퍼런스 수치 그대로
const SPEED = 40.0;
const BOOST_MULTIPLIER = 3.0;
const GROUND_Y = 2;

function tick() {
  requestAnimationFrame(tick);
  const delta = clock.getDelta();

  if (started && controls.isLocked) {
    // ── 레퍼런스 PlayerController.useFrame 로직 ──
    const sh = keys['ShiftLeft'] || keys['ShiftRight'];
    const actualSpeed = (sh && keys['KeyW']) ? SPEED * BOOST_MULTIPLIER : SPEED;

    velocity.set(0, 0, 0);
    if (keys['KeyW']) velocity.z -= 1;
    if (keys['KeyS']) velocity.z += 1;
    if (keys['KeyA']) velocity.x -= 1;
    if (keys['KeyD']) velocity.x += 1;
    if (keys['Space'] && !sh) velocity.y += 1;        // 상승
    if (keys['Space'] && sh) velocity.y -= 1;         // Shift+Space 하강

    velocity.normalize().multiplyScalar(actualSpeed * delta);
    velocity.applyEuler(camera.rotation);  // 카메라 방향 기준 이동 (레퍼런스 동일)

    camera.position.add(velocity);

    // 최저 고도 제한
    if (camera.position.y < GROUND_Y) camera.position.y = GROUND_Y;

    // player 메시 위치 동기화
    player.position.copy(camera.position);

    // HUD 업데이트
    const t = townAt(camera.position.x);
    hudTown.textContent = 'TOWN: ' + t.name;
    hudTown.style.color = t.color;
    hudMode.textContent = '✈ FLYING';
    hudMode.style.color = '#88ccff';
  }

  // ── Stars가 카메라를 따라다니도록 (버그 수정: 고정 좌표면 별 구체 밖으로 나가버림) ──
  starsPoints.position.copy(camera.position);

  // ── Raycaster (크로스헤어 중앙 = 0,0 고정) ──
  if (started) {
    ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = ray.intersectObjects(surfaces);
    if (hits.length && hits[0].distance < 30) {
      const hitSurface = hits[0].object;
      hovered = enabledBoards.find(b => b.surface === hitSurface) || null;
      if (hovered) {
        tooltip.textContent = hovered.post.title;
        tooltip.style.display = 'block';
        tooltip.style.left = '50%';
        tooltip.style.top = 'calc(50% + 20px)';
        tooltip.style.transform = 'translateX(-50%)';
        // Hover 시 AdBoard 살짝 밝게 (레퍼런스 hovered ? '#ddd' 대응)
        hovered.surface.material.color.set(0xdddddd);
      }
    } else {
      if (hovered) hovered.surface.material.color.set(0xffffff);
      hovered = null;
      tooltip.style.display = 'none';
    }

    // Hover 빌딩 올라오기 애니메이션
    enabledBoards.forEach(b => {
      const target = b === hovered ? 0.8 : 0;
      b.group.position.y += (target - b.group.position.y) * 0.12;
    });
  }

  renderer.render(scene, camera);
}

tick();
```

---

## 조립 순서

`<script type="module">` 안에 Block 1~13 순서대로:

```
1  → import + Renderer + Scene
2  → Sky 셰이더 + 조명
3  → Stars/Snow 파티클 + 메인 바닥
4  → 배경 도시 (buildBackgroundCity)
5  → Canvas 텍스처 유틸 + 캐시
6  → makeAdBoard()
7  → buildDisabledInstances()
8  → buildRoads() + buildTownSign()
9  → buildTown() × 3타운 + surfaces 배열
10 → player 더미 Object3D
11 → PointerLockControls + 입력
12 → Raycaster + HUD DOM
13 → tick() + 호출
```

---

## 맵 레이아웃

```
배경 도시 (InstancedMesh ~400개)
┌─────────────────────────────────┐
│  [AI TOWN]  [WEB TOWN] [HTJ TOWN]  ← 타운 3개 (각 80유닛)
│    x:-90      x:0       x:+90       ← 배경 도시 제외 구역
│  (빌딩18)  (빌딩18)  (빌딩18)
└─────────────────────────────────┘
카메라 시작: (0, 20, 50) → Web Town 앞에서 시작

타운 경계: x < -45 → AI | -45~45 → WEB | x > 45 → HTJ
```

---

## 조작법

| 키 | 동작 |
|---|---|
| 화면 클릭 | 마우스 캡처 (PointerLock 진입) |
| 마우스 | 시점 회전 |
| W / S | 전진 / 후진 |
| A / D | 좌 / 우 이동 |
| Space | 상승 |
| Shift + Space | 하강 |
| Shift + W | 부스트 (3×, 레퍼런스 동일) |
| ESC | 마우스 해제 |
| 크로스헤어로 빌딩 가리키고 클릭 | 링크 이동 |

---

## 주의사항 + Claude Code 검색 지시

- `config.js`는 importmap보다 반드시 먼저 `<script src>` 로드
- `PointerLockControls`는 HTTPS에서만 동작 (github.io ✅, localhost ✅)
- `Sky` addon은 `renderer.toneMapping` 설정이 있어야 제대로 보임 → Block 1에 포함
- `InstancedMesh` 사용 후 `instanceMatrix.needsUpdate = true` 필수
- 배경 도시는 그림자 끔 (`castShadow = false`) → 성능 유지
- > 💡 **Claude Code**: Three.js r160 Sky CDN URL 확인.
  > `https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/objects/Sky.js` 유효한지 확인.
  > 안 되면 최신 stable 버전으로 웹 검색
- > 💡 **Claude Code**: `enabledBoards` 배열은 `buildTown()` 완료 후에 채워짐.
  > `surfaces` 배열은 반드시 모든 `buildTown()` 호출 이후에 생성할 것
- > 💡 **Claude Code**: Sky 셰이더가 배경을 덮으므로 `scene.background` 설정은 fallback용.
  > Sky 적용 후 `renderer.toneMapping`과 `renderer.toneMappingExposure` 값 조정해서 너무 밝거나 어둡지 않게 최적화

---

## v2 로드맵

### Phase A — 콘텐츠
- [ ] 실제 velog 글 URL + 썸네일 imageUrl config.js 반영
- [ ] HTJ Town 포트폴리오 전용 건물

### Phase B — 비주얼
- [ ] 타운 주민 캐릭터 (AI타운: 로봇, Web타운: 개발자, HTJ타운: htj)
- [ ] 야간/주간 토글 (N키) — Sky turbidity + toneMappingExposure 전환
- [ ] 모바일 터치 조작

### Phase C — 이스터에그
- [ ] 총 이스터에그 (맵에 총 오브젝트 → 클릭 장착 → 발사)
- [ ] 폭탄 이스터에그
- [ ] HTJ Town 빅 이스터에그 (거대 htj 등장 or 노래 재생)

---

## 확장 가이드

```javascript
// 새 타운 추가: config.js에 key 추가
const CONFIG = {
  new_town: { label: 'NEW TOWN', floorColor: 0x001122, accentColor: 0x00ccff, posts: [...] }
};

// index.html: TOWN_OFFSETS + forEach에 추가
const TOWN_OFFSETS = { ai: -90, web: 0, htj: 90, new_town: 180 };
['ai', 'web', 'htj', 'new_town'].forEach(buildTown);

// 글 추가: posts 배열에 추가 (슬롯 6개 초과 시 자동으로 앞 6개만 사용)
```
