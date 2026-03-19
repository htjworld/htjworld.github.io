import { CreativeCity } from './CreativeCity';
import { IcePrison } from './IcePrison';
import { MazeRunner } from './MazeRunner';
import { ShiningHallway } from './ShiningHallway';

export type Theme = 'creative' | 'ice' | 'maze' | 'hallway';

interface ThemeManagerProps {
  theme: Theme;
}

export const ThemeManager = ({ theme }: ThemeManagerProps) => {
  switch (theme) {
    case 'creative': return <CreativeCity />;
    case 'ice': return <IcePrison />;
    case 'maze': return <MazeRunner />;
    case 'hallway': return <ShiningHallway />;
    default: return <CreativeCity />;
  }
};
