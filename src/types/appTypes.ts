export interface Article {
    id: number;
    title: string;
    subtitle: string;
    content: string;
    image: string;
}

export interface CardElements {
    background: HTMLElement;
    image: HTMLImageElement;
}

export interface Card {
    id: number;
    elements: CardElements;
}

export interface CardPosition {
    card: Card;
    backgroundPosition: DOMRect;
    imagePosition: DOMRect;
    scrollY: number;
}

export interface ModalElements {
    id: number;
    wrapper: HTMLElement;
    background: HTMLElement;
    image: HTMLImageElement;
    content: HTMLElement;
    closeButton: HTMLElement;
    title: HTMLElement;
}
