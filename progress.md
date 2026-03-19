# htjworld — progress.md (cleanup)

## 현재 상태
🟢 완료 (2차 수정 포함)

---

## 체크리스트

### Phase 0 — 코드 파악
- [x] 전체 코드 구조 깊게 읽기
- [x] 섹션 7 판단 항목 확인 후 필요하면 사용자에게 질문

### Phase 1 — 파일 정리
- [x] public/ 폴더 구조 확인 + 불필요 에셋 삭제 (vite.svg, src/assets/react.svg, src/assets/)
- [x] README.md 교체 (htjworld 소개)
- [x] .gitignore 생성/업데이트 (*.tsbuildinfo, cleanup-plan.md 추가)
- [x] index.html 타이틀/파비콘 교체 (3d_game → htjworld)
- [x] src/components/City.tsx 삭제 (미사용)

### Phase 2 — 기능 제거
- [x] 적(Enemy/Monsters) 시스템 제거 (Monsters.tsx 삭제)
- [x] 총쏘기 시스템 제거 (Weapons.tsx 삭제)
- [x] 탱크 모드 제거 (Vehicles.tsx, Lobby.tsx 삭제)
- [x] 걷기 모드 제거 (PlayerController 재작성)
- [x] 신 모드 제거
- [x] 모드 전환 시스템 전체 제거 (gameStore 단순화)
- [x] Maze.tsx 제거

### Phase 3 — 맵 통일
- [x] 단일 맵(CreativeCity)으로 전환 — Scene에서 직접 렌더
- [x] ThemeManager를 store 의존 제거, prop 기반으로 변경 (재사용 가능)
- [x] IcePrison/MazeRunner/ShiningHallway 파일 유지 (확장용)

### Phase 4 — 배포 설정
- [x] .github/workflows/deploy.yml 생성
- [x] vite.config.ts base 경로 수정 (base: '/')
- [x] 의존성 정리 (uuid 제거)
- [x] npm run build 빌드 테스트 ✅ 성공

### 2차 수정 (버그픽스)
- [x] 사진 깨짐 수정 — AdBoard 프레임 z-fighting 제거 (frame position 조정)
- [x] WASD 방향 수정 — camera.getWorldDirection() 기반 이동 (바라보는 방향 기준)
- [x] 쭉 가는 버그 수정 — pointerlockchange/blur 시 키 상태 리셋
- [x] 물리엔진 제거 — useSphere 제거, 직접 카메라 조작으로 jitter 해결
- [x] .gitignore에 cleanup-plan.md, *.tsbuildinfo 추가

---

## 메모
- **물리엔진(@react-three/cannon)**: PlayerController에서 제거. 패키지는 유지 (IcePrison 등 테마 파일이 useBox 참조).
- **단일맵**: Scene → CreativeCity 직접. ThemeManager는 prop 기반으로 리팩토링해 확장 가능.
- **배포**: base '/' + deploy.yml. git push main 자동 빌드+배포. GitHub Pages → gh-pages 브랜치 설정 필요(1회).
