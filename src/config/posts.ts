export type Town = 'web' | 'ai' | 'htj';

export interface PostConfig {
  id: string;
  town: Town;
  title: string;
  linkUrl: string;
  imageUrl?: string;
}

export const POSTS: PostConfig[] = [
  // WEB TOWN
  {
    id: 'web1',
    town: 'web',
    title: '백엔드 이미지 업로드 방법',
    linkUrl: 'https://velog.io/@htjworld/백엔드-이미지-업로드-방법',
    imageUrl: '/htj_logo_black.png',
  },
  {
    id: 'web2',
    town: 'web',
    title: 'Spring Boot 비밀번호 재설정 구현',
    linkUrl: 'https://velog.io/@htjworld/Spring-Boot에서-비밀번호-재설정-기능-구현하기',
  },
  {
    id: 'web3',
    town: 'web',
    title: 'RESTful API 설계 원칙',
    linkUrl: 'https://velog.io/@htjworld',
  },

  // AI TOWN
  {
    id: 'ai1',
    town: 'ai',
    title: '카톡 심리 AI Agent 분석',
    linkUrl: 'https://velog.io/@htjworld/카톡-상대방의-심리를-AI-Agent로-분석하기',
    imageUrl: '/htj_logo.png',
  },
  {
    id: 'ai2',
    town: 'ai',
    title: 'LLM 프롬프트 엔지니어링',
    linkUrl: 'https://velog.io/@htjworld',
  },

  // HTJ TOWN
  {
    id: 'htj1',
    town: 'htj',
    title: 'htjworld',
    linkUrl: 'https://github.com/htjworld',
    imageUrl: '/ad_photo.jpeg',
  },
  {
    id: 'htj2',
    town: 'htj',
    title: 'GitHub',
    linkUrl: 'https://github.com/htjworld',
  },
];

export function getPostsByTown(town: Town): PostConfig[] {
  return POSTS.filter((p) => p.town === town);
}
