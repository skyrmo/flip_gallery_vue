import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Position } from "../types/article";

export const useCardStore = defineStore("card", () => {
    // State
    const cards = ref<Record<number, HTMLElement>>({});
    const images = ref<Record<number, HTMLImageElement>>({});

    const clickedCardId = ref<number | null>(null);
    const cardClickYScroll = ref<number | null>(null);
    // const clickedCardPosition = ref<{ x: number; y: number } | null>(null);
    // const clickedCardPosition = ref<Position | null>();
    // const clickedCardImagePosition = ref<Position | null>();

    function addCard(id: number, card: HTMLElement) {
        cards.value[id] = card;
    }

    function addImage(id: number, image: HTMLImageElement) {
        cards.value[id] = image;
    }

    const clickedCard = computed(() => {
        if (clickedCardId.value === null) return null;
        return cards.value[clickedCardId.value];
    });

    const clickedCardPosition = computed(() => {
        if (clickedCardId.value === null || !clickedCard.value) return null;

        const cardRect = clickedCard.value.getBoundingClientRect();
        return {
            top: cardRect.top,
            left: cardRect.left,
            width: cardRect.width,
            height: cardRect.height,
            yScroll: cardClickYScroll.value,
        } as Position;
    });

    const clickedImage = computed(() => {
        if (clickedCardId.value === null) return null;
        return images.value[clickedCardId.value];
    });

    const clickedImagePosition = computed(() => {
        if (clickedCardId.value === null || !clickedImage.value) return null;

        const imageRect = clickedImage.value.getBoundingClientRect();
        return {
            top: imageRect.top,
            left: imageRect.left,
            width: imageRect.width,
            height: imageRect.height,
            yScroll: cardClickYScroll.value,
        } as Position;
    });

    return {
        cards,
        clickedCardId,
        cardClickYScroll,
        addCard,
        addImage,
        clickedCard,
        clickedImage,
        clickedImagePosition,
        clickedCardPosition,
    };
});
