# htjworld — progress.md

## 현재 상태
🟢 Block 1~13 전체 구현 완료

## 다음 시작
npx serve . 로컬 테스트 후 git push 배포

---

## 체크리스트

### Phase 1 — 씬 기본
- [x] Block 1: Import + Renderer + Scene
- [x] Block 2: Sky 셰이더 + 조명
- [x] Block 3: Stars/Snow 파티클 + 메인 바닥

### Phase 2 — 도시 + 빌딩 시스템
- [x] Block 4: 배경 도시 (buildBackgroundCity)
- [x] Block 5: Canvas 텍스처 유틸 + 캐시 (makeSignTex)
- [x] Block 6: AdBoard 함수 (makeAdBoard)
- [x] Block 7: disabled 빌딩 InstancedMesh (buildDisabledInstances)
- [x] Block 8: 도로 + 타운 표지판 (buildRoads, buildTownSign)
- [x] Block 9: 타운 빌딩 배치 (buildTown × 3 + surfaces 배열)

### Phase 3 — 플레이어 + 조작
- [x] Block 10: player 더미 Object3D
- [x] Block 11: PointerLockControls + 입력
- [x] Block 12: Raycaster + HUD DOM

### Phase 4 — 게임 루프 + 배포
- [x] Block 13: tick() (이동, starsPoints 추적, Raycaster hover, HUD)
- [ ] npx serve . 로컬 테스트
- [ ] git push 배포

---

## 메모
- 2026-03-19: Block 1~13 전체를 index.html 단일 파일에 조립 완료
- config.js 신규 생성 (plan2.md 스펙 그대로)
- img/.gitkeep 없어도 동작 (imageUrl: null → Canvas 폴백)
