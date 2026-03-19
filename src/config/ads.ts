export interface AdConfig {
  id: string;
  imageUrl: string;
  linkUrl: string;
  ratio: number; // width / height
}

export const ADS: AdConfig[] = [
  {
    id: 'ad1',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'https://example.com/1',
    ratio: 1.5,
  },
  {
    id: 'ad2',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'https://example.com/2',
    ratio: 1.0,
  },
  {
    id: 'ad3',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'https://example.com/3',
    ratio: 1.8,
  },
];

export const getRandomAd = () => {
    return ADS[Math.floor(Math.random() * ADS.length)];
}
