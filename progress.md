# htjworld — Progress

## 현재 상태
🔴 미시작 (plan2 기준 새로 구현)

## 참고 문서
- airplane-blog-plan2.md — 전체 스펙 + 실제 구현 코드
- CLAUDE.md — 규칙

## 다음 시작
airplane-blog-plan2.md의 Block 1부터 순서대로

---

## 구현 체크리스트

### Phase 1 — 씬 기본
- [ ] Block 1: Import + Renderer + Scene
- [ ] Block 2: 조명
- [ ] Block 3: Stars + 메인 바닥

### Phase 2 — 빌딩 시스템
- [ ] Block 4: Canvas 텍스처 유틸 + 캐시
- [ ] Block 5: makeAdBoard() (Frame + Surface, MeshBasicMaterial)
- [ ] Block 6: buildDisabledInstances() (InstancedMesh)
- [ ] Block 7: buildRoads() + buildTownSign()
- [ ] Block 8: buildTown() × 3타운

### Phase 3 — 플레이어 + 조작
- [ ] Block 9: buildPlane() + player 생성
- [ ] Block 10: PointerLockControls + 입력 (WASD, Space 더블탭, E 토글)
- [ ] Block 11: 온보딩 + Raycaster + HUD DOM

### Phase 4 — 게임 루프 + 배포
- [ ] Block 12: tick() (3인칭/1인칭 이동, 카메라, Raycaster hover, HUD)
- [ ] npx serve . 로컬 테스트
- [ ] git push 배포

---

## 메모
(구현 중 특이사항 여기에 기록)
