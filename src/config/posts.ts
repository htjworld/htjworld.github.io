export type Town = 'web' | 'ai' | 'htj';

export interface PostConfig {
  id: string;
  town: Town;
  title: string;
  linkUrl: string;
  imageUrl?: string;
}

export const POSTS: PostConfig[] = [
  // AI TOWN
  {
    id: 'ai1',
    town: 'ai',
    title: '카톡 상대방의 심리를\nAI Agent로 분석하기',
    linkUrl: 'https://velog.io/@htjworld/카톡-상대방의-심리를-AI-Agent로-분석하기',
  },

  // WEB TOWN
  {
    id: 'web1',
    town: 'web',
    title: '서버 부하를 0으로 만드는\n유연한 이미지 업로드 설계',
    linkUrl: 'https://velog.io/@htjworld/서버-부하를-0으로-만드는-유연한-이미지-업로드-설계',
  },
  {
    id: 'web2',
    town: 'web',
    title: 'Java 개발자가 코드 품질을\n유지하는 두 가지 원칙',
    linkUrl: 'https://velog.io/@htjworld/JAVA스러운-코드-만들기',
  },
  {
    id: 'web3',
    town: 'web',
    title: 'Spring Boot 비밀번호 재설정 [1/2]',
    linkUrl: 'https://velog.io/@htjworld/Spring-Boot에서-비밀번호-재설정-기능-구현하기',
  },
  {
    id: 'web4',
    town: 'web',
    title: 'Spring Boot 비밀번호 재설정\nRedis 설치 및 설정 [2/2]',
    linkUrl: 'https://velog.io/@htjworld/Spring-Boot-비밀번호-재설정-기능-구현하기-Redis-설치-및-설정-22',
  },
  {
    id: 'web5',
    town: 'web',
    title: '컬렉션 프레임워크 개념 정리',
    linkUrl: 'https://velog.io/@htjworld',
  },
  {
    id: 'web6',
    town: 'web',
    title: '연산자 우선순위',
    linkUrl: 'https://velog.io/@htjworld',
  },
  {
    id: 'web7',
    town: 'web',
    title: '이미지 업로드 아키텍처 비교',
    linkUrl: 'https://velog.io/@htjworld',
  },

  // HTJ TOWN
  {
    id: 'htj1',
    town: 'htj',
    title: 'htjworld GitHub',
    linkUrl: 'https://github.com/htjworld',
    imageUrl: '/ad_photo.jpeg',
  },
];

export function getPostsByTown(town: Town): PostConfig[] {
  return POSTS.filter((p) => p.town === town);
}
