export interface AdConfig {
  id: string;
  imageUrl: string;
  linkUrl: string;
  ratio: number;
}

export const ADS: AdConfig[] = [
  {
    id: 'ad1',
    imageUrl: '/htj_logo_black.png',
    linkUrl: 'https://velog.io/@htjworld/백엔드-이미지-업로드-방법',
    ratio: 1.5,
  },
  {
    id: 'ad2',
    imageUrl: '/htj_logo.png',
    linkUrl: 'https://velog.io/@htjworld/카톡-상대방의-심리를-AI-Agent로-분석하기',
    ratio: 1.0,
  },
  {
    id: 'ad3',
    imageUrl: '/ad_photo.jpeg',
    linkUrl: 'https://velog.io/@htjworld/Spring-Boot에서-비밀번호-재설정-기능-구현하기',
    ratio: 1.8,
  },
];

export const getRandomAd = () => {
  return ADS[Math.floor(Math.random() * ADS.length)];
};