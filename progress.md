# htjworld — Progress

## 현재 상태
🟡 구현 완료 (배포 대기)

## 다음 시작 항목
github pages push 후 배포 확인

---

## MVP 체크리스트

- [x] Three.js 씬 기본 구성 (renderer, camera, lighting)
- [x] 3개 타운 평면 + 색상 구분
- [x] 빌딩 6슬롯 × 3타운 = 18개 빌딩
- [x] config.js 기반 enabled/disabled 빌딩 시스템
- [x] Canvas 텍스처로 전광판 자동 생성
- [x] WASD 지상 이동
- [x] Space 더블탭 비행 전환
- [x] 비행 중 Space(상승) / Shift+Space(하강)
- [x] 3인칭 카메라 (플레이어 추적)
- [x] Raycaster Hover 효과 (빌딩 올라오기 + 툴팁)
- [x] Raycaster 클릭 → 링크 이동
- [x] HUD (타운명 + 비행/지상 모드)
- [x] 온보딩 팝업
- [x] Stars + Fog 분위기
- [ ] github.io 배포 확인

---

## 메모

### 구현 결정사항 (2026-03-19)

- Three.js r160 CDN (jsdelivr importmap) 사용
- 비행기: BoxGeometry 조합 (fuselage + wings + tail + engines)
- 빌딩 signboard face: z<0 슬롯은 +Z face(idx 4), z>0 슬롯은 -Z face(idx 5)로 항상 도로를 향함
- 카메라 오프셋: (0,4,8) × Y rotation만 적용 (뱅킹은 카메라에 전달 안 함)
- 비행 자동착지: y <= GY + 0.05 이하로 내려가면 GROUND 상태 전환
- Space 더블탭: 300ms 이내 두 번 keydown 감지 (repeat 제외)
- config.js CONFIG 전역 변수로 접근 (ES module 아님)
- 로컬 테스트: `npx serve .` 또는 VS Code Live Server 필수 (file:// 불가)
