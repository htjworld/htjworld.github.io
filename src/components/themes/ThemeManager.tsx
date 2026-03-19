import { useGameStore } from '../../store/gameStore';
import { CreativeCity } from './CreativeCity';
import { IcePrison } from './IcePrison';
import { MazeRunner } from './MazeRunner';
import { ShiningHallway } from './ShiningHallway';

export const ThemeManager = () => {
    const theme = useGameStore((state) => state.theme);

    switch (theme) {
        case 'creative':
            return <CreativeCity />;
        case 'ice':
             return <IcePrison />;
        case 'maze':
             return <MazeRunner />;
        case 'hallway':
             return <ShiningHallway />;
        default:
             return <CreativeCity />;
    }
};
