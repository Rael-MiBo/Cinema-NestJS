import type { SeatSelection } from '../types';
type Props = {
    mapa: number[][];
    ocupados: {
        fila: number;
        assento: number;
    }[];
    selected: SeatSelection[];
    onToggle: (seat: SeatSelection) => void;
};
export declare function SeatMap({ mapa, ocupados, selected, onToggle }: Props): import("react").JSX.Element;
export {};
