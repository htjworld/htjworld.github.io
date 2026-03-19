# htjworld — progress.md (cleanup)

## 현재 상태
🟢 완료

## 다음 시작
없음 — 전체 완료. 남은 작업: GitHub Pages 설정 (Settings → Pages → gh-pages 브랜치 선택)

---

## 체크리스트

### Phase 0 — 코드 파악
- [x] 전체 코드 구조 깊게 읽기
- [x] 섹션 7 판단 항목 확인 후 필요하면 사용자에게 질문

### Phase 1 — 파일 정리
- [x] public/ 폴더 구조 확인 + 불필요 에셋 삭제 (vite.svg, src/assets/react.svg)
- [x] README.md 교체 (htjworld 소개)
- [x] .gitignore 생성/업데이트
- [x] index.html 타이틀/파비콘 교체 (3d_game → htjworld)

### Phase 2 — 기능 제거
- [x] 적(Enemy/Monsters) 시스템 제거 (Monsters.tsx 삭제)
- [x] 총쏘기 시스템 제거 (Weapons.tsx 삭제)
- [x] 탱크 모드 제거 (Vehicles.tsx, Lobby.tsx 삭제)
- [x] 걷기 모드 제거 (PlayerController 재작성, 최저 고도 GROUND_Y=2 유지)
- [x] 신 모드 제거
- [x] 모드 전환 시스템 전체 제거 (gameStore 단순화: started+theme만 유지)
- [x] Maze.tsx 제거 (WinZone → god mode 트리거 포함)

### Phase 3 — 맵 통일
- [x] 크리에이티브/서바이벌 분기 로직 제거
- [x] 전체 맵 날기 모드로 통일 (PlayerController 항상 flying)
- [x] 맵 전환 기능 유지 (ThemeManager + theme 상태 기반)

### Phase 4 — 배포 설정
- [x] .github/workflows/deploy.yml 생성
- [x] vite.config.ts base 경로 수정 (base: '/')
- [x] 의존성 정리 (uuid 제거 — 코드에서 미사용)
- [x] npm run build 빌드 테스트 ✅ 성공
- [ ] 동작 확인 (날기, 맵 전환, 빌딩 클릭) — 브라우저에서 직접 확인 필요

---

## 메모
- **2026-03-19**: 물리엔진(@react-three/cannon) **유지** 결정. 벽 solid 유지를 위해 Physics Provider + IcePrison/MazeRunner/ShiningHallway의 useBox 남김. Weapons/Monsters/걷기 useSphere는 제거.
- **PlayerController 비행 방식**: useSphere 유지 → api.velocity로 이동 → pos로 camera 추종. 벽 충돌 실제 작동.
- **맵 전환**: zustand theme 상태 기반 (state-based). ThemeManager 유지.
- **배포**: base '/' + deploy.yml 생성. git push main 하면 자동 빌드+배포.
- **남은 수동 작업**: GitHub 레포 → Settings → Pages → Source를 gh-pages 브랜치로 변경 (1회만).
