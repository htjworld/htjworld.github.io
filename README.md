# htjworld

비행기로 날아다니며 블로그 글을 탐험하는 3D 포트폴리오 사이트.

## 기술 스택

- React + TypeScript + Vite
- @react-three/fiber + @react-three/drei
- Three.js

## 조작법

| 키 | 동작 |
|---|---|
| W / ↑ | 앞으로 |
| S / ↓ | 뒤로 |
| A / ← | 왼쪽 |
| D / → | 오른쪽 |
| Space | 상승 |
| Ctrl / C | 하강 |
| Shift | 부스트 |

## 개발 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 + `gh-pages` 브랜치에 배포.
