export interface Article {
    id: number;
    title: string;
    content: string;
    image: string;
    initialPosition: {
        top: number;
        left: number;
        width: number;
        height: number;
        imageHeight: number;
    } | null;
}
