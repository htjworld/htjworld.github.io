# htjworld — cleanup-plan.md
> 레퍼런스 코드(react-three-fiber 3D 게임) → htjworld 블로그로 전환하기 위한 제거 작업 계획
> Claude Code용 | 전체 레퍼런스 코드를 먼저 깊게 읽고 이 문서 기반으로 작업

---

## 작업 목적

레퍼런스 프로젝트는 총쏘기, 적, 탱크, 걷기/날기/신 모드 전환, 크리에이티브/서바이벌 맵 구분이 있는 3D 게임.
htjworld는 이 중에서 **날기 기능과 도시 비주얼만 남기고 전부 제거**하는 것이 목표.
결과물은 비행기로 날아다니며 블로그 글을 탐험하는 3D 포트폴리오 사이트.

---

## 1. 파일 복사 방식

기존 프로젝트의 git 히스토리는 무시해도 됨.
핵심 파일만 복사해서 htjworld 레포에 붙여넣는 방식으로 진행.
복사 후 이 문서 기반으로 불필요한 요소 제거.

---

## 2. 즉시 삭제할 파일/폴더

### public/ 내 불필요한 에셋
- `public/vite.svg` 또는 유사한 기본 SVG 파일 전부 삭제
- `public/` 내 게임 관련 에셋 (총, 탱크, 적 캐릭터 이미지/모델) 전부 삭제
- favicon 관련 파일 중 htjworld와 무관한 것 삭제
- > 💡 **Claude Code**: public/ 폴더 전체 구조 먼저 확인하고 삭제 전 목록 출력할 것

### 설정/빌드 파일
- `vite.config.ts` 또는 빌드 관련 설정 — github.io 정적 배포 방식으로 교체 필요
- > 💡 **Claude Code**: github.io는 정적 파일 배포. Vite 빌드 결과물을 dist/ → 루트로 옮기거나, vite.config의 base 경로를 htjworld.github.io에 맞게 수정할 것. 방법이 불확실하면 나에게 물어볼 것

### 기타
- `README.md` — 기존 게임 설명 내용 전부 삭제, htjworld 소개로 교체

---

## 3. 제거할 기능 컴포넌트

### 3-1. 총쏘기 시스템 (Shooting)
**제거 이유**: 작동 불안정, 블로그 목적에 불필요

제거 대상:
- 총알(Bullet) 관련 컴포넌트, 상태, 로직 전부
- 발사(shoot/fire) 이벤트 핸들러
- 총기 오브젝트 메시 및 관련 geometry
- 총알 충돌 감지(collision detection) 로직
- 총알 파티클/이펙트

**주의**: 총쏘기 제거 시 PlayerController나 Input 시스템이 총과 연결되어 있을 수 있음. 연결 끊을 때 다른 입력(WASD, Space)이 깨지지 않도록 주의.
> 💡 **Claude Code**: 총쏘기 관련 코드가 PlayerController와 강하게 결합되어 있으면, 제거 방식을 나에게 먼저 설명하고 확인받을 것

---

### 3-2. 적(Enemy) 시스템
**제거 이유**: 블로그에 적 캐릭터 불필요

제거 대상:
- Enemy 컴포넌트 및 관련 파일 전부
- 적 AI/이동 로직
- 적 스폰(spawn) 시스템
- 적과의 충돌 감지
- 적 체력/피격 이펙트
- 적 관련 상태 관리 (zustand, context 등)

---

### 3-3. 탱크 모드 (Tank Mode)
**제거 이유**: 날기 모드만 유지

제거 대상:
- Tank 컴포넌트 및 관련 메시
- 탱크 조작 로직 (포탑 회전, 탱크 이동 방식)
- 탱크 전환 UI/버튼
- 탱크 물리 시뮬레이션

---

### 3-4. 걷기 모드 (Walk Mode)
**제거 이유**: 날기 모드만 유지

제거 대상:
- 걷기 상태 및 전환 로직
- 중력/점프 물리 시스템 (날기에는 불필요)
- 지면 충돌 감지 (바닥 아래로 안 내려가게만 최소 유지)

**주의**: 지면 충돌 감지는 완전 제거 말고, 최저 고도 제한(GROUND_Y = 2)만 남길 것. 바닥 아래로 카메라가 뚫리면 안 됨.

---

### 3-5. 신 모드 (God Mode / Creative Mode)
**제거 이유**: 모드 구분 자체를 없애고 전체를 날기 모드로 통일

제거 대상:
- 신 모드 관련 상태(isGodMode, isCreative 등)
- 신 모드 전환 키 바인딩
- 신 모드 전용 능력(무적, 무한 총알 등)
- 모드 전환 UI 요소

---

### 3-6. 모드 전환 시스템 전체
**제거 이유**: 날기 모드 하나만 있으면 전환 시스템 자체가 불필요

제거 대상:
- 모드 상태 관리 (currentMode, setMode 등)
- 모드 전환 UI 패널/버튼
- 모드별 분기 처리 로직

**결과**: 항상 날기 모드. PointerLockControls + WASD + Space(상승) + Shift+Space(하강) 만 남음.

---

## 4. 맵 관련 처리

### 현재 상태
- 맵 4개 존재
- 크리에이티브 맵(첫 번째)은 날기 모드 고정
- 나머지 3개는 서바이벌 모드

### 변경 목표
- 맵 4개 **그대로 유지** (맵 구조, 도시 레이아웃은 건드리지 않음)
- 모든 맵에서 **항상 날기 모드** (서바이벌/크리에이티브 구분 제거)
- 맵 전환 기능 자체는 유지 (4개 맵 탐험 가능)

### 제거 대상
- 크리에이티브/서바이벌 맵 분기 로직
- 서바이벌 모드 전용 요소 (체력, 데미지, 리스폰 등)
- 맵별 모드 설정 코드

> 💡 **Claude Code**: 맵 구조(도시, 건물, 지형)는 절대 건드리지 말 것. 맵 전환 UI가 있다면 유지. 모드 분기 로직만 제거하고 전부 날기 모드로 통일.

---

## 5. .gitignore 정리

아래 내용으로 .gitignore 생성/업데이트:

```
# 의존성
node_modules/

# 빌드 결과물
dist/
build/
.vite/

# 환경변수
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# 에디터
.vscode/
.idea/
*.swp
*.swo

# 로그
*.log
npm-debug.log*

# 테스트
coverage/
```

---

## 6. package.json / 의존성 정리

레퍼런스 프로젝트에 게임 전용 라이브러리가 있을 수 있음.

확인 후 제거 검토:
- 총쏘기/물리엔진 전용 패키지 (rapier, cannon-es 등)
- 적 AI 관련 패키지
- 사용하지 않는 drei 컴포넌트 (단, drei 자체는 유지)

> 💡 **Claude Code**: package.json 의존성 중 제거 여부가 불확실한 것은 목록으로 정리해서 나에게 물어볼 것. 섣불리 제거하면 빌드 깨질 수 있음.

---

## 7. 제거 고려사항 (나에게 물어볼 것들)

아래 항목은 코드를 읽은 후 판단이 필요함. **제거 전 반드시 나에게 확인**:

1. **물리 엔진 사용 여부**: rapier나 cannon 같은 물리엔진이 날기 이동에도 쓰이는지, 아니면 총쏘기/충돌에만 쓰이는지 확인 필요. 날기에도 쓰인다면 유지.
   - ✅ **결정 (2026-03-19)**: `@react-three/cannon` **유지**. 날기는 camera 직접 조작이라 cannon 불필요하지만, IcePrison/MazeRunner/ShiningHallway 벽을 **solid(충돌 가능)** 로 유지하기 위해 Physics Provider와 useBox를 남김. Weapons/Monsters/걷기 물리(useSphere)는 제거.

2. **상태 관리 구조**: zustand나 context로 모드/무기/적 상태를 같이 관리하는 경우, 무기/적 상태만 분리해서 제거하는 방법 확인 필요.

3. **맵 전환 방식**: 맵 전환이 라우팅 기반인지, 상태 기반인지 확인 필요. 방식에 따라 제거 방법이 달라짐.

4. **Vite 배포 방식**: github.io에 Vite 빌드 결과물 올리는 방법 (base 경로 설정, gh-pages 브랜치 등) 확인 필요. 불확실하면 나에게 물어볼 것.

---

## 9. GitHub Actions 자동 배포 설정

레퍼런스 코드는 React + Vite라 빌드가 필요함.
`git push` 하면 GitHub Actions가 자동으로 빌드 + 배포.
별도 서버 없이 GitHub 안에서 전부 해결.

### 생성할 파일: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### vite.config.ts 수정

```typescript
export default defineConfig({
  base: '/',  // htjworld.github.io 루트 레포는 base '/' 로 설정
  // ... 나머지 설정
})
```

### GitHub 설정 (1회만)

레포 → Settings → Pages → Source를 `gh-pages` 브랜치로 변경.
이후 `git push main` 하면 자동 배포.

> 💡 **Claude Code**: `.github/workflows/deploy.yml` 파일 생성 후
> vite.config.ts의 base 경로 확인해서 htjworld.github.io에 맞게 수정할 것

1. 전체 레퍼런스 코드 깊게 읽기
2. 불필요 파일 목록 확인 후 삭제
3. 적 시스템 제거 (다른 시스템과 독립적이라 먼저 제거 안전)
4. 총쏘기 시스템 제거
5. 탱크/걷기/신 모드 제거 → 날기 모드만 남기기
6. 맵 모드 분기 제거 (전체 날기 모드 통일)
7. .gitignore 정리
8. 의존성 정리 (불확실한 것은 나에게 확인)
9. 빌드 테스트 (`npm run build` 또는 `npm run dev`)
10. 동작 확인: 날기, 맵 4개 전환, 빌딩 클릭 링크 이동

---

## 최종 목표 상태

```
✅ 남기는 것
- 맵 4개 (도시 구조 그대로)
- 맵 전환 기능
- PointerLockControls 날기 이동 (WASD + Space/Shift+Space)
- Shift+W 부스트
- 도시 비주얼 (빌딩, 도로, Sky, Stars)
- AdBoard / 빌딩 클릭 → 링크 이동

❌ 제거하는 것
- 총쏘기 / 총알 / 발사 이펙트
- 적 캐릭터 / 적 AI
- 탱크 모드
- 걷기 모드
- 신 모드 (God Mode)
- 모드 전환 UI
- 크리에이티브/서바이벌 구분
- public/ 불필요 SVG/에셋
- 사용 안 하는 의존성
```
