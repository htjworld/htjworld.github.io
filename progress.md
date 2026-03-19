# htjworld — progress.md

## 현재 상태
🔴 미시작

## 다음 시작
airplane-blog-plan2.md Block 1부터 순서대로

---

## 체크리스트

### Phase 1 — 씬 기본
- [ ] Block 1: Import + Renderer + Scene
- [ ] Block 2: Sky 셰이더 + 조명
- [ ] Block 3: Stars/Snow 파티클 + 메인 바닥

### Phase 2 — 도시 + 빌딩 시스템
- [ ] Block 4: 배경 도시 (buildBackgroundCity)
- [ ] Block 5: Canvas 텍스처 유틸 + 캐시 (makeSignTex)
- [ ] Block 6: AdBoard 함수 (makeAdBoard)
- [ ] Block 7: disabled 빌딩 InstancedMesh (buildDisabledInstances)
- [ ] Block 8: 도로 + 타운 표지판 (buildRoads, buildTownSign)
- [ ] Block 9: 타운 빌딩 배치 (buildTown × 3 + surfaces 배열)

### Phase 3 — 플레이어 + 조작
- [ ] Block 10: player 더미 Object3D
- [ ] Block 11: PointerLockControls + 입력
- [ ] Block 12: Raycaster + HUD DOM

### Phase 4 — 게임 루프 + 배포
- [ ] Block 13: tick() (이동, starsPoints 추적, Raycaster hover, HUD)
- [ ] npx serve . 로컬 테스트
- [ ] git push 배포

---

## 메모
(구현 중 결정사항, 특이사항 여기에 기록)
