export interface Article {
    id: number;
    title: string;
    subtitle: string;
    content: string;
    image: string;
}

export type Position = {
    top: number;
    left: number;
    width: number;
    height: number;
    yScroll: number;
} | null;
