export interface Article {
    id: number;
    title: string;
    subtitle: string;
    content: string;
    image: string;

    cardImagePosition: {
        top: number;
        left: number;
        width: number;
        height: number;
        imageHeight: number;
    } | null;

    cardBackgroundPosition: {
        top: number;
        left: number;
        width: number;
        height: number;
        backgroundHeight: number;
    } | null;
}
