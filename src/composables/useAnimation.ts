import { ref } from "vue";

// composables/useArticleAnimation.ts
export function useArticleAnimation() {
    const timeline = ref<gsap.core.Timeline | null>(null);

    function animateOpen(fromElement: HTMLElement, toElement: HTMLElement) {
        // Centralized FLIP animation logic
    }

    function animateClose(fromElement: HTMLElement, toElement: HTMLElement) {
        // Reverse animation logic
    }

    function calculateDelay(
        element: HTMLElement,
        clickPoint: { x: number; y: number },
    ) {
        // Reusable delay calculation
    }

    return { animateOpen, animateClose, timeline };
}
