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
        imageUrl: null,
        ratio: 1.5,
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
      { id: 'web1', title: "htjworld 개발기", linkUrl: "https://velog.io/@htjworld", imageUrl: null, ratio: 1.5, enabled: true },
      { id: 'web2', title: "Three.js로 3D 블로그", linkUrl: "https://velog.io/@htjworld", imageUrl: null, ratio: 1.5, enabled: true },
      { id: 'web3', title: "SSAFY 프로젝트 회고", linkUrl: "https://velog.io/@htjworld", imageUrl: null, ratio: 1.5, enabled: true },
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
      { id: 'htj1', title: "ArtBridge — MCP Top3", linkUrl: "https://github.com/htjworld/art-bridge", imageUrl: null, ratio: 1.5, enabled: true },
      { id: 'htj2', title: "Aevis — AI 면접 앱", linkUrl: "https://github.com/htjworld/aevis", imageUrl: null, ratio: 1.5, enabled: true },
      { enabled: false },
      { enabled: false },
      { enabled: false },
      { enabled: false },
    ]
  }
};
