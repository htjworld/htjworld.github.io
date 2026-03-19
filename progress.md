# htjworld — progress.md (cleanup)

## 현재 상태
🟢 완료

---

## 체크리스트

### Phase 0 — 코드 파악
- [x] 전체 코드 구조 깊게 읽기
- [x] 섹션 7 판단 항목 확인 후 사용자에게 질문 및 확인

### Phase 1 — 파일 정리
- [x] public/vite.svg 삭제 + index.html favicon 참조 제거
- [x] src/assets/ 빈 디렉토리 삭제
- [x] index.html title → htjworld
- [x] README.md → htjworld 소개로 교체
- [x] .gitignore 업데이트 (.claude/ 포함)
- [x] cleanup-plan.md 삭제 (정리 완료)

### Phase 2 — 기능 제거
- [x] 적(Enemy) 시스템 제거 — 이미 없음
- [x] 총쏘기 시스템 제거 — 이미 없음
- [x] 탱크 모드 제거 — 이미 없음
- [x] 걷기 모드 제거 — 이미 없음
- [x] 신 모드 제거 — 이미 없음
- [x] 모드 전환 시스템 전체 제거 — 이미 없음

### Phase 3 — 맵 통일
- [x] 크리에이티브/서바이벌 분기 로직 제거 — 이미 없음
- [x] 전체 맵 날기 모드로 통일 — PlayerController 날기 전용
- [x] 맵 전환 기능 — 현재 1개 맵 유지 (4개 맵은 추후 추가 예정)

### Phase 4 — 배포 설정
- [x] .github/workflows/deploy.yml 생성
- [x] vite.config.ts base: '/' 설정
- [x] uuid 패키지 제거 (미사용 확인)
- [x] npm run build 빌드 테스트 — 성공 ✅

---

## 메모
- Phase 2/3 작업 대부분은 airplane-blog-ver2 커밋에서 이미 처리됨
- 섹션 7.1: 물리 엔진 없음, 날기는 순수 camera 조작
- 섹션 7.2: 상태 관리 없음 (zustand/context 미사용), 모두 local refs
- 섹션 7.3: 맵 1개 유지로 결정. 4개 맵은 나중에 추가 예정
- 섹션 7.4: base '/' + GitHub Actions gh-pages 방식으로 확정
- 빌드 경고: JS 번들 1MB (Three.js 특성상 정상, 빌드 실패 아님)
- 배포 후 GitHub 설정 필요: Settings → Pages → Source를 gh-pages 브랜치로 변경
