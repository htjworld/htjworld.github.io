# htjworld — airplane-blog-plan2.md
> Claude Code 구현 스펙 | 이 파일 하나로 처음부터 완전 구현 가능 (plan1 참조 없음)

---

## 프로젝트 개요

- **이름**: htjworld (hello world → han taejin's world)
- **목적**: 비행기로 날아다니며 탐험하는 3D 포트폴리오 블로그
- **배포**: `htjworld.github.io` (정적 파일, 서버 없음)
- **기술**: Three.js r160 CDN, Vanilla JS, 단일 index.html + config.js
- **로컬 테스트**: `npx serve .` 필수 (file:// 프로토콜은 CORS 에러)

---

## 설계 원칙 (반드시 지킬 것)

### 1. 블로그가 목적이다
htjworld는 게임이 아니라 **블로그**다. 방문자가 처음 들어와서 "와, 신기하다" 하고 글을 클릭하는 게 목표.
- 성능이 최우선. 진입 시 버벅이면 방문자 바로 이탈
- 기능 추가보다 **가볍게 유지하는 것**이 더 중요
- 탱크, 걷기, 적, 전투 등 게임 요소는 MVP에 절대 없음 → v2 이스터에그로만
- **비행기 하나로 날아다니는 것** 자체가 이 앱의 정체성

### 2. 재사용성 + 확장성 원칙
- `config.js`만 수정해서 글 추가/삭제 가능
- 새 타운 추가 시 config.js에 새 key 추가만으로 동작해야 함
- 타운 빌딩 생성은 `buildTown(key)` 하나의 함수가 전부 처리 (중복 코드 금지)
- 빌딩 슬롯 수, 이미지/텍스트 전환 모두 config.js에서 제어

### 3. 기존 레퍼런스와의 차이
레퍼런스(react-three-fiber 앱)는 FPS 슈팅, 탱크, 다중 모드 게임이었음.
**htjworld는 그 방향이 아님.** 비행기 단일 캐릭터, 3인칭(기본)/1인칭(E토글) 두 시점만.
모드 전환 시스템, 무기 장착, 적 AI는 MVP에 포함하지 않음.

---

## 파일 구조

```
htjworld.github.io/
├── index.html     ← 전체 게임 로직 (Three.js importmap 포함)
├── config.js      ← 블로그 글 설정 (이 파일만 수정해서 글 추가/삭제)
├── img/           ← 광고판 이미지 (없어도 됨 - Canvas 폴백 있음)
│   └── .gitkeep
├── CLAUDE.md
└── progress.md
```

---

## config.js 전체 코드

```javascript
// config.js — 이 파일만 수정해서 글 추가/삭제
// index.html에서 <script src="config.js"> 로 먼저 로드 (window 전역 변수)

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
        imageUrl: null,   // 로컬: "img/ai1.jpg" | 외부URL 가능 | null이면 Canvas 텍스트 전광판
        ratio: 1.5,       // imageUrl 있을 때 width/height 비율
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
      {
        id: 'web1',
        title: "htjworld 개발기",
        linkUrl: "https://velog.io/@htjworld",
        imageUrl: null,
        ratio: 1.5,
        enabled: true
      },
      {
        id: 'web2',
        title: "Three.js로 3D 블로그",
        linkUrl: "https://velog.io/@htjworld",
        imageUrl: null,
        ratio: 1.5,
        enabled: true
      },
      {
        id: 'web3',
        title: "SSAFY 프로젝트 회고",
        linkUrl: "https://velog.io/@htjworld",
        imageUrl: null,
        ratio: 1.5,
        enabled: true
      },
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
      {
        id: 'htj1',
        title: "ArtBridge — MCP Top3",
        linkUrl: "https://github.com/htjworld/art-bridge",
        imageUrl: null,
        ratio: 1.5,
        enabled: true
      },
      {
        id: 'htj2',
        title: "Aevis — AI 면접 앱",
        linkUrl: "https://github.com/htjworld/aevis",
        imageUrl: null,
        ratio: 1.5,
        enabled: true
      },
      { enabled: false },
      { enabled: false },
      { enabled: false },
      { enabled: false },
    ]
  }
};
```

---

## index.html 전체 구조

### HTML + CSS 뼈대

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
      pointer-events: none; width: 20px; height: 20px; z-index: 10;
    }
    #crosshair::before, #crosshair::after {
      content: ''; position: absolute; background: rgba(255,255,255,0.35);
    }
    #crosshair::before { width: 1px; height: 100%; left: 50%; }
    #crosshair::after  { height: 1px; width: 100%; top: 50%; }
    #tooltip {
      position: fixed; display: none;
      background: rgba(0,0,0,0.85); color: #fff;
      padding: 6px 14px; border-radius: 4px;
      font: 13px 'Courier New', monospace; pointer-events: none;
      border: 1px solid rgba(255,255,255,0.15); z-index: 10;
      white-space: nowrap;
    }
    #onboarding {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.93);
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
      WASD 이동 &nbsp;|&nbsp; Space×2 비행<br>
      Space 상승 &nbsp;|&nbsp; Shift+Space 하강<br>
      Shift+W 부스트 &nbsp;|&nbsp; E 시점 전환<br>
      클릭 → 블로그 이동
    </p>
    <p>📝 <a id="velog-link" href="https://velog.io/@htjworld" target="_blank">리스트로 보려면 velog →</a></p>
    <p class="start">— 클릭해서 탐험 시작 —</p>
  </div>
</div>

<div id="hud">
  <div id="hud-town">TOWN: WEB TOWN</div>
  <div id="hud-mode">MODE: 🚶 GROUND</div>
  <div id="hud-view">VIEW: 👁 3RD</div>
</div>

<div id="controls-hint">
  WASD — 이동<br>
  SPACE×2 — 비행<br>
  SPACE — 상승 &nbsp; SHIFT+SPACE — 하강<br>
  SHIFT+W — 부스트<br>
  E — 시점 전환
</div>

<div id="crosshair"></div>
<div id="tooltip"></div>

<!-- config.js 반드시 importmap보다 먼저 로드 -->
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
  /* 모든 Three.js 로직 여기에 (아래 코드 블록 순서대로 조립) */
</script>

</body>
</html>
```

---

## JavaScript 전체 구현 코드

`<script type="module">` 안에 아래 블록들을 순서대로 조립

### Block 1 — Import + Renderer + Scene

```javascript
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.015);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### Block 2 — 조명

```javascript
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 0.7);
sun.position.set(50, 80, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);  // 성능: 2048 대신 1024
sun.shadow.camera.left = -120; sun.shadow.camera.right = 120;
sun.shadow.camera.top  =  120; sun.shadow.camera.bottom = -120;
sun.shadow.camera.far  = 400;
scene.add(sun);
```

### Block 3 — Stars + 메인 바닥

```javascript
{
  const pos = [];
  for (let i = 0; i < 3000; i++) {
    pos.push(
      (Math.random() - 0.5) * 700,
      10 + Math.random() * 200,
      (Math.random() - 0.5) * 700
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })));
}

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(800, 800),
  new THREE.MeshLambertMaterial({ color: 0x080810 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -0.02;
groundMesh.receiveShadow = true;
scene.add(groundMesh);
```

### Block 4 — Canvas 텍스처 유틸 + 캐시

```javascript
const textureCache = {};

function toRgb(hex) {
  return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
}

// Canvas로 텍스트 전광판 자동 생성 (imageUrl 없을 때 폴백)
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

### Block 5 — AdBoard 함수 (레퍼런스 이식)

```javascript
// 레퍼런스 AdBoard 패턴 (바닐라 JS 이식):
// Frame (BoxGeometry, MeshStandardMaterial) 뒤
// Surface (PlaneGeometry, MeshBasicMaterial) 앞 ← 조명 계산 없어서 빠름
// imageUrl 있으면 TextureLoader, 없거나 실패하면 Canvas 폴백

function makeAdBoard(post, accentHex) {
  const group = new THREE.Group();
  const boardW = 6.5;
  const boardH = post.ratio ? boardW / post.ratio : boardW;

  // Frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(boardW + 0.5, boardH + 0.5, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2a })
  );
  frame.position.z = -0.05;
  group.add(frame);

  // Surface (MeshBasicMaterial — 핵심 성능 최적화)
  const surfaceGeo = new THREE.PlaneGeometry(boardW, boardH);
  const fallbackMat = () => new THREE.MeshBasicMaterial({ map: makeSignTex(post.title, accentHex) });

  let mat;
  if (post.imageUrl) {
    const tex = new THREE.TextureLoader().load(
      post.imageUrl,
      undefined, undefined,
      () => { surface.material = fallbackMat(); }  // 로드 실패 → Canvas 폴백
    );
    mat = new THREE.MeshBasicMaterial({ map: tex });
  } else {
    mat = fallbackMat();
  }

  const surface = new THREE.Mesh(surfaceGeo, mat);
  surface.position.z = 0.1;
  group.add(surface);

  return { group, surface, post };
}
```

### Block 6 — disabled 빌딩 InstancedMesh

```javascript
// disabled 빌딩 전체를 InstancedMesh 하나로 처리 → draw call 절감
function buildDisabledInstances(disabledList) {
  if (!disabledList.length) return;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: 0x141420 });
  const mesh = new THREE.InstancedMesh(geo, mat, disabledList.length);
  mesh.castShadow = true;

  const dummy = new THREE.Object3D();
  disabledList.forEach((b, i) => {
    dummy.position.set(b.wx, b.h / 2, b.wz);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;  // 필수!
  scene.add(mesh);
}
```

### Block 7 — 도로 + 타운 표지판

```javascript
function buildRoads(ox) {
  const rm = new THREE.MeshLambertMaterial({ color: 0x181820 });
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

### Block 8 — 타운 빌딩 배치 (전체 루프)

```javascript
const SLOTS = [
  { x: -15, z: -20 }, { x: 0, z: -20 }, { x: 15, z: -20 },
  { x: -15, z:  20 }, { x: 0, z:  20 }, { x: 15, z:  20 },
];
const TOWN_OFFSETS = { ai: -90, web: 0, htj: 90 };
const enabledBoards = [];  // Raycaster 대상

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

  const pl = new THREE.PointLight(cfg.accentColor, 2.5, 90);
  pl.position.set(ox, 8, 0);
  scene.add(pl);

  buildTownSign(cfg.label, cfg.accentColor, ox);

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
      // 빌딩 본체
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
        new THREE.LineBasicMaterial({ color: cfg.accentColor, transparent: true, opacity: 0.5 })
      );
      edges.position.set(wx, BH / 2, wz);
      scene.add(edges);

      // AdBoard: 슬롯 z<0이면 +Z면(도로 방향), z>0이면 -Z면(도로 방향)
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
      const h = 12 + Math.random() * 8;
      const d = 6 + Math.random() * 2;
      disabledList.push({ wx, wz, w, h, d });
    }
  });

  buildDisabledInstances(disabledList);
}

['ai', 'web', 'htj'].forEach(buildTown);
```

### Block 9 — 플레이어 (비행기)

```javascript
function buildPlane() {
  const g = new THREE.Group();
  const wm = new THREE.MeshLambertMaterial({ color: 0xdde0ee });
  const dm = new THREE.MeshLambertMaterial({ color: 0x7788aa });

  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 3), wm));
  const wing = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 1), wm);
  wing.position.set(0, 0, 0.2); g.add(wing);
  const tw = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 0.5), dm);
  tw.position.set(0, 0.1, -1.2); g.add(tw);
  const tf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.7), dm);
  tf.position.set(0, 0.5, -1.2); g.add(tf);
  [-1.2, 1.2].forEach(ex => {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8), dm);
    e.rotation.z = Math.PI / 2;
    e.position.set(ex, -0.15, 0.3);
    g.add(e);
  });
  g.traverse(c => { if (c.isMesh) c.castShadow = true; });
  return g;
}

const player = buildPlane();
player.position.set(0, 1, 0);
scene.add(player);
```

### Block 10 — PointerLockControls + 입력

```javascript
const pointerLock = new PointerLockControls(camera, renderer.domElement);
pointerLock.addEventListener('unlock', () => { viewMode = 'THIRD'; });

const keys = {};
let flying = false, lastSpc = 0, started = false;
let viewMode = 'THIRD';  // 'THIRD' | 'FIRST'

document.addEventListener('keydown', e => {
  if (!started) return;
  if (keys[e.code]) return;
  keys[e.code] = true;

  if (e.code === 'Space') {
    e.preventDefault();
    if (viewMode === 'THIRD') {  // 3인칭에서만 더블탭 비행 전환
      const now = performance.now();
      if (!flying && now - lastSpc < 300) flying = true;
      lastSpc = now;
    }
  }

  if (e.code === 'KeyE') {
    if (viewMode === 'THIRD') { pointerLock.lock(); viewMode = 'FIRST'; }
    else { pointerLock.unlock(); viewMode = 'THIRD'; }
  }
});
document.addEventListener('keyup', e => { keys[e.code] = false; });
```

### Block 11 — 온보딩 + Raycaster + HUD DOM

```javascript
const obEl = document.getElementById('onboarding');
document.getElementById('velog-link').addEventListener('click', e => e.stopPropagation());
obEl.addEventListener('click', () => { obEl.style.display = 'none'; started = true; });

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');
const surfaces = enabledBoards.map(b => b.surface);
let hovered = null;

document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  tooltip.style.left = e.clientX + 16 + 'px';
  tooltip.style.top  = e.clientY - 8 + 'px';
});
renderer.domElement.addEventListener('click', () => {
  if (started && hovered) window.open(hovered.post.linkUrl, '_blank');
});

const hudTown = document.getElementById('hud-town');
const hudMode = document.getElementById('hud-mode');
const hudView = document.getElementById('hud-view');

function townAt(x) {
  if (x < -45) return { name: 'AI TOWN',  color: '#7b2fff' };
  if (x >  45) return { name: 'HTJ TOWN', color: '#ffaa00' };
  return { name: 'WEB TOWN', color: '#00ff88' };
}
```

### Block 12 — 메인 게임 루프 (tick)

```javascript
const clock = new THREE.Clock();
const FWD = new THREE.Vector3();
const CAM_OFF = new THREE.Vector3();
const _euler = new THREE.Euler();

const GSPD = 0.15, FSPD = 0.2, VSPD = 0.1, ROT = 0.03;
const BOOST = 3.0;  // 레퍼런스 BOOST_MULTIPLIER
const GY = 1, MAXALT = 50;

function tick() {
  requestAnimationFrame(tick);
  const dt = clock.getDelta();
  const n = dt * 60;  // 60fps 정규화

  if (started) {
    const sh = keys['ShiftLeft'] || keys['ShiftRight'];
    const boosting = sh && keys['KeyW'];

    if (viewMode === 'THIRD') {
      if (keys['KeyA']) player.rotation.y += ROT * n;
      if (keys['KeyD']) player.rotation.y -= ROT * n;

      player.getWorldDirection(FWD);
      if (!flying) { FWD.y = 0; FWD.normalize(); }
      const spd = (flying ? FSPD : GSPD) * (boosting ? BOOST : 1) * n;
      if (keys['KeyW']) player.position.addScaledVector(FWD,  spd);
      if (keys['KeyS']) player.position.addScaledVector(FWD, -spd * 0.5);

      const bank = keys['KeyA'] ? -0.22 : keys['KeyD'] ? 0.22 : 0;
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, bank, 0.1);
    }

    if (viewMode === 'FIRST') {
      const spd = (flying ? FSPD : GSPD) * (sh ? BOOST : 1) * n;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      if (!flying) { dir.y = 0; dir.normalize(); }
      if (keys['KeyW']) player.position.addScaledVector(dir,  spd);
      if (keys['KeyS']) player.position.addScaledVector(dir, -spd * 0.5);
      const right = new THREE.Vector3();
      right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
      if (keys['KeyA']) player.position.addScaledVector(right, -spd);
      if (keys['KeyD']) player.position.addScaledVector(right,  spd);
      player.rotation.y = camera.rotation.y;
    }

    if (flying) {
      if (keys['Space'] && !sh) {
        player.position.y += VSPD * n;
        player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, -0.2, 0.1);
      } else if (keys['Space'] && sh) {
        player.position.y -= VSPD * n;
        player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, 0.15, 0.1);
      } else {
        player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, 0, 0.1);
      }
      player.position.y = Math.min(MAXALT, Math.max(GY, player.position.y));
      if (player.position.y <= GY + 0.05) { flying = false; player.position.y = GY; }
    } else {
      player.position.y = GY;
      player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, 0, 0.15);
    }
  }

  // 3인칭 카메라 (플레이어 뒤 추적)
  if (viewMode === 'THIRD') {
    CAM_OFF.set(0, 4, 8).applyEuler(_euler.set(0, player.rotation.y, 0));
    camera.position.copy(player.position).add(CAM_OFF);
    camera.lookAt(player.position.x, player.position.y + 0.5, player.position.z);
  }
  // 1인칭: PointerLockControls가 카메라 자동 처리
  // 단, 카메라 위치는 플레이어 위치로 동기화
  if (viewMode === 'FIRST') {
    camera.position.copy(player.position).add(new THREE.Vector3(0, 1.5, 0));
  }

  // Raycaster hover (3인칭에서만)
  if (started && viewMode === 'THIRD') {
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(surfaces);
    if (hits.length) {
      hovered = enabledBoards.find(b => b.surface === hits[0].object) || null;
      document.body.style.cursor = 'pointer';
      if (hovered) { tooltip.textContent = hovered.post.title; tooltip.style.display = 'block'; }
    } else {
      hovered = null;
      document.body.style.cursor = 'default';
      tooltip.style.display = 'none';
    }
    enabledBoards.forEach(b => {
      const target = b === hovered ? 0.6 : 0;
      b.group.position.y += (target - b.group.position.y) * 0.12;
    });
  }

  // HUD
  const t = townAt(player.position.x);
  hudTown.textContent = 'TOWN: ' + t.name;
  hudTown.style.color = t.color;
  hudMode.textContent = flying ? 'MODE: ✈ FLYING' : 'MODE: 🚶 GROUND';
  hudMode.style.color = flying ? '#44aaff' : t.color;
  hudView.textContent = viewMode === 'FIRST' ? 'VIEW: 🎯 1ST' : 'VIEW: 👁 3RD';

  renderer.render(scene, camera);
}

tick();
```

---

## 조립 순서 체크리스트

Claude Code는 Block 1~12를 아래 순서로 `<script type="module">` 안에 조립:

1. Block 1 — Import + Renderer + Scene
2. Block 2 — 조명
3. Block 3 — Stars + 메인 바닥
4. Block 4 — Canvas 텍스처 유틸 + 캐시
5. Block 5 — makeAdBoard()
6. Block 6 — buildDisabledInstances()
7. Block 7 — buildRoads() + buildTownSign()
8. Block 8 — buildTown() + ['ai','web','htj'].forEach(buildTown)
9. Block 9 — buildPlane() + player 생성
10. Block 10 — PointerLockControls + 입력
11. Block 11 — 온보딩 + Raycaster + HUD DOM
12. Block 12 — tick() + 호출

---

## 맵 레이아웃

```
[  AI TOWN  ]   [  WEB TOWN  ]   [  HTJ TOWN  ]
  x: -90          x: 0 (시작)      x: +90
  너비: 80         너비: 80          너비: 80

플레이어 시작: (0, 1, 0)
타운 경계: x < -45 → AI | -45~45 → WEB | x > 45 → HTJ

빌딩 슬롯 (타운 로컬 좌표):
  z=-20: [x=-15] [x=0] [x=15]  ← 도로 북쪽
  z=+20: [x=-15] [x=0] [x=15]  ← 도로 남쪽
```

---

## 조작법

| 키 | 동작 |
|---|---|
| W / S | 전진 / 후진 |
| A / D | 좌우 회전 (3인칭) / 좌우 이동 (1인칭) |
| Space × 2 (300ms 이내) | 비행 모드 ON |
| Space (비행 중) | 상승 |
| Shift + Space (비행 중) | 하강 |
| Shift + W | 부스트 (3×) |
| E | 3인칭 ↔ 1인칭 시점 토글 |
| ESC (1인칭 중) | 1인칭 해제 → 3인칭 복귀 |
| 클릭 (3인칭) | hover된 빌딩 링크 이동 |

---

## 주의사항 + Claude Code 검색 지시

- `config.js`는 `<script src="config.js">` 로 importmap보다 **반드시 먼저** 로드
- `PointerLockControls`는 HTTPS에서만 동작 (github.io ✅, localhost ✅)
- `InstancedMesh` 사용 후 `instanceMatrix.needsUpdate = true` 필수
- 1인칭 중 Space 더블탭 비행 전환 오작동 방지: `viewMode === 'THIRD'` 조건 체크
- 맵 경계 처리 MVP에서는 생략. 안개(FogExp2)가 자연스럽게 경계 역할
- > 💡 **Claude Code**: 구현 시작 전 Three.js r160 CDN URL 유효한지 확인.
  > 응답 없으면 `three.js latest CDN jsdelivr` 웹 검색으로 최신 stable URL 사용
- > 💡 **Claude Code**: PointerLockControls CDN 경로 문제 시
  > `three r160 PointerLockControls CDN URL` 웹 검색으로 올바른 경로 확인
- > 💡 **Claude Code**: 외부 imageUrl CORS 실패 시 TextureLoader error 콜백에서 Canvas 폴백 처리 확인
- > 💡 **Claude Code**: `enabledBoards` 배열은 `buildTown()` 실행 후에 채워지므로
  > `surfaces = enabledBoards.map(b => b.surface)` 는 반드시 모든 타운 빌드 완료 후 실행

---

## v2 로드맵 (MVP 이후 구현 목록)

MVP 배포 후 아래 순서로 추가. **블로그 목적 유지 필수** — 재미 요소는 이스터에그 형태로.

### Phase A — 콘텐츠 강화
- [ ] 실제 velog 글 URL + 썸네일 이미지 config.js에 반영
- [ ] HTJ Town 내 자소서/포트폴리오 전용 건물 (클릭 시 PDF or 페이지 이동)
- [ ] 타운 입구에 도착 시 타운별 BGM 재생 (저작권 없는 ambient music)
- [ ] 모바일 터치 조작 (가상 조이스틱)

### Phase B — 비주얼 강화
- [ ] 각 타운 주민 캐릭터 (AI타운: 로봇, Web타운: 개발자 실루엣, HTJ타운: htj 캐릭터)
  - Three.js 기본 geometry 조합 or GLB 모델 로드
  - 주민들 랜덤 보행 (NavMesh 없이 단순 랜덤워크)
- [ ] 비행기 엔진 파티클 이펙트 (THREE.Points)
- [ ] 야간/주간 토글 (N키) — AmbientLight intensity 전환

### Phase C — 이스터에그 (블로그 목적 해치지 않는 선에서)
- [ ] **총 이스터에그**: 맵 특정 위치에 총 오브젝트 → 클릭 시 장착
  - 장착 후 클릭마다 발사 (Raycaster로 주민/빌딩 충돌 감지)
  - 주민 맞으면 도망가는 이펙트
- [ ] **폭탄 이스터에그**: 폭탄 오브젝트 클릭 시 장착 → 클릭마다 투하
  - 폭탄 반경 내 주민 쓰러지는 이펙트
- [ ] **HTJ Town 빅 이스터에그**: 특정 건물 클릭 시 거대 htj 캐릭터 등장 또는 노래 재생

### Phase D — 시스템
- [ ] 로딩 화면 (Three.js LoadingManager 활용)
- [ ] github.io 커스텀 도메인 연결 (선택)

---

## 확장 시 config.js 수정 가이드

### 새 타운 추가

```javascript
// config.js에 새 key 추가만 하면 됨
const CONFIG = {
  ai: { ... },
  web: { ... },
  htj: { ... },
  new_town: {           // ← 이것만 추가
    label: 'NEW TOWN',
    floorColor: 0x001122,
    accentColor: 0x00ccff,
    shuffle: false,
    posts: [ ... ]
  }
};
```

```javascript
// index.html — TOWN_OFFSETS에 추가 + forEach에 key 추가
const TOWN_OFFSETS = { ai: -90, web: 0, htj: 90, new_town: 180 };
['ai', 'web', 'htj', 'new_town'].forEach(buildTown);
```

### 글 추가

```javascript
// config.js posts 배열에 추가만 하면 됨
{
  id: 'ai3',
  title: "새 글 제목",
  linkUrl: "https://velog.io/@htjworld/...",
  imageUrl: null,         // or "img/ai3.jpg"
  ratio: 1.5,
  enabled: true
}
// 슬롯 6개 초과 시 자동으로 처음 6개만 사용됨
```
