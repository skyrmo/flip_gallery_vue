import { ref, computed, nextTick } from "vue";
import { gsap } from "gsap";
import type {
    CardPosition,
    FlipTransforms,
    ModalElements,
} from "../types/appTypes";
import { ANIMATION_CONFIG } from "../config/animations";
import { getAppStateManager } from "./useAppState";

let appState = getAppStateManager();

const useAnimationManager = () => {
    const cardPositions = ref<Map<number, CardPosition>>(new Map());
    const activeTimelines = ref<Set<gsap.core.Timeline>>(new Set());

    // Computed Properties
    const cardsToAnimate = computed(() => {
        const cardsArray = Array.from(appState.cards.value.values());

        return cardsArray.filter((card) => {
            return card.id !== appState.selectedArticleId.value;
        });
    });

    const clickedCardPosition = computed(() => {
        const id = appState.selectedArticleId.value;

        if (!id) return null;

        return cardPositions.value.get(id);
    });

    // Helper Methods
    async function updateCardsPositionState() {
        const cards = appState.cards.value;

        for (let [key, card] of cards) {
            const cardElements = card.elements;

            if (!card || !card.elements) {
                throw new Error(
                    "Tried to update card positions, but card element doesnt exist.",
                );
            }

            // Store clicked card info for FLIP animation
            const cardRect = cardElements.background.getBoundingClientRect();
            const imageRect = cardElements.image.getBoundingClientRect();

            if (!cardRect || !imageRect) {
                throw new Error(
                    "Tried to update card positions, but bg / img missing.",
                );
            }

            const cardPosition = {
                card,
                backgroundPosition: cardRect,
                imagePosition: imageRect,
                scrollY: window.scrollY,
            };

            cardPositions.value.set(key, cardPosition);
        }
    }

    // Main animation setup and coordination
    function createTimeline(modalElements: ModalElements) {
        // Position modal wrapper to account for scroll
        gsap.set(modalElements.wrapper, {
            y: window.scrollY,
        });

        const timeline = gsap.timeline({
            onComplete: () => {
                // Reset wrapper position and scroll to top
                gsap.set(modalElements.wrapper, { y: 0 });
                window.scrollTo(0, 0);
                appState.cardsVisible.value = false;
            },
        });

        activeTimelines.value.add(timeline);
        return timeline;
    }

    // Create timeline specifically for closing animation
    function createCloseTimeline(modalElements: ModalElements) {
        const timeline = gsap.timeline({
            onComplete: () => {
                appState.modalVisible.value = false;

                // Clear all transforms
                gsap.set(
                    [
                        modalElements.background,
                        modalElements.image,
                        modalElements.wrapper,
                    ],
                    {
                        clearProps: "all",
                    },
                );

                activeTimelines.value.delete(timeline);
            },
        });

        activeTimelines.value.add(timeline);
        return timeline;
    }

    // Calculate FLIP transform values
    function calculateFlipTransforms(
        clickedCardPos: CardPosition,
        modalElements: ModalElements,
    ): FlipTransforms {
        const cardBGPos = clickedCardPos.backgroundPosition;
        const cardImagePos = clickedCardPos.imagePosition;

        const modalBGPos = modalElements.background.getBoundingClientRect();
        const modalImagePos = modalElements.image.getBoundingClientRect();

        // Image transforms
        const imageTransforms = {
            scaleX: cardImagePos.width / modalImagePos.width,
            scaleY: cardImagePos.height / modalImagePos.height,
            translateX: cardImagePos.left - modalImagePos.left,
            translateY: cardImagePos.top - modalImagePos.top,
        };

        // Background transforms
        const backgroundTransforms = {
            scaleX: cardBGPos.width / modalBGPos.width,
            scaleY: cardBGPos.height / modalBGPos.height,
            translateX: cardBGPos.left - modalBGPos.left,
            translateY: cardBGPos.top - modalBGPos.top,
        };

        return { imageTransforms, backgroundTransforms };
    }

    // Calculate transforms for animating from modal back to card
    function calculateReverseFlipTransforms(
        clickedCardPos: CardPosition,
        modalElements: ModalElements,
    ): FlipTransforms {
        const cardBGPos = clickedCardPos.backgroundPosition;
        const cardImagePos = clickedCardPos.imagePosition;

        const modalBGPos = modalElements.background.getBoundingClientRect();
        const modalImagePos = modalElements.image.getBoundingClientRect();

        // Image transforms (modal to card)
        const imageTransforms = {
            scaleX: cardImagePos.width / modalImagePos.width,
            scaleY: cardImagePos.height / modalImagePos.height,
            translateX: cardImagePos.left - modalImagePos.left,
            translateY: cardImagePos.top - modalImagePos.top,
        };

        // Background transforms (modal to card)
        const backgroundTransforms = {
            scaleX: cardBGPos.width / modalBGPos.width,
            scaleY: cardBGPos.height / modalBGPos.height,
            translateX: cardBGPos.left - modalBGPos.left,
            translateY: cardBGPos.top - modalBGPos.top,
        };

        return { imageTransforms, backgroundTransforms };
    }

    function setInitialFlipPositions(
        modalElements: ModalElements,
        transforms: FlipTransforms,
    ) {
        const { imageTransforms, backgroundTransforms } = transforms;

        // Hide content initially
        gsap.set(
            [
                modalElements.content,
                modalElements.closeButton,
                modalElements.title,
            ],
            { opacity: 0 },
        );

        // Set initial background position
        gsap.set(modalElements.background, {
            transformOrigin: "top left",
            x: backgroundTransforms.translateX,
            y: backgroundTransforms.translateY,
            scaleX: backgroundTransforms.scaleX,
            scaleY: backgroundTransforms.scaleY,
        });

        // Set initial image position
        gsap.set(modalElements.image, {
            transformOrigin: "top left",
            x: imageTransforms.translateX,
            y: imageTransforms.translateY,
            scaleX: imageTransforms.scaleX,
            scaleY: imageTransforms.scaleY,
        });
    }

    function animateModalToFinalPosition(
        timeline: gsap.core.Timeline,
        modalElements: ModalElements,
    ) {
        // Animate background to final position
        timeline.to(
            modalElements.background,
            {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                duration: ANIMATION_CONFIG.DURATIONS.modalBackgroundTransition,
                ease: ANIMATION_CONFIG.EASING.modalTransition,
            },
            ANIMATION_CONFIG.DELAYS.cardAnimationStart,
        );

        // Animate image to final position
        timeline.to(
            modalElements.image,
            {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                duration: ANIMATION_CONFIG.DURATIONS.modalImageTransition,
                ease: ANIMATION_CONFIG.EASING.modalTransition,
            },
            ANIMATION_CONFIG.DELAYS.modalImageStart,
        );

        // Fade in content
        timeline.to(
            [
                modalElements.content,
                modalElements.closeButton,
                modalElements.title,
            ],
            {
                opacity: 1,
                duration: ANIMATION_CONFIG.DURATIONS.contentFadeIn,
                ease: ANIMATION_CONFIG.EASING.contentFade,
            },
            ANIMATION_CONFIG.DELAYS.contentFadeStart,
        );
    }

    async function animateOpen() {
        // update the positions for the cards
        await updateCardsPositionState();

        // store the elements that make up the modal
        const modalElements = appState.modalElements.value;

        if (!modalElements || !clickedCardPosition.value) {
            throw new Error("Something went wrong in with ModalElements.");
            return;
        }

        // gsap timeline for all open modal animations.
        const timeline = createTimeline(modalElements);

        //
        animateCardsOut(timeline);

        // calculate the transforms requireed to change the modal elements
        const transforms = calculateFlipTransforms(
            clickedCardPosition.value,
            modalElements,
        );

        // modal elements changed to mirror those of clicked card
        setInitialFlipPositions(modalElements, transforms);

        // modal is now visible
        appState.modalVisible.value = true;

        // modal elements animate to their 'final' position.
        animateModalToFinalPosition(timeline, modalElements);
    }

    async function animateClose() {
        // store the elements that make up the modal
        const modalElements = appState.modalElements.value;
        const clickedCardPos = clickedCardPosition.value;

        if (!modalElements || !clickedCardPos) return;

        // Get clicked card info
        const clickedCard = appState.clickedCard.value;
        if (!clickedCard) {
            throw new Error(`clicked card not found`);
        }

        // Restore scroll position to where user was before opening modal
        restoreScrollPosition(modalElements, clickedCardPos);

        // Create timeline for closing animation
        const timeline = createCloseTimeline(modalElements);

        // Calculate reverse FLIP transforms (modal to card)
        const reverseTransforms = calculateReverseFlipTransforms(
            clickedCardPos,
            modalElements,
        );

        // Animate modal elements back to card position
        animateModalToCardPosition(timeline, modalElements, reverseTransforms);

        const timeline2 = createCloseTimeline(modalElements);

        // Make cards visible again
        appState.cardsVisible.value = true;

        // Wait for Vue to render the cards
        await nextTick();

        // IMPORTANT: Set cards to their "out" state immediately after they become visible
        cardsToAnimate.value.forEach((card) => {
            gsap.set(card.elements.background, {
                opacity: 0,
                scale: ANIMATION_CONFIG.SCALES.cardFadeOut,
                immediateRender: true, // Force immediate render
                overwrite: "auto", // Overwrite any existing tweens
            });
        });

        // Now animate cards back in
        animateCardsIn(timeline2);
    }

    // Helper function to restore scroll position
    function restoreScrollPosition(
        modalElements: ModalElements,
        clickedCardPos: CardPosition,
    ) {
        const scrollY = clickedCardPos.scrollY || 0;

        gsap.set(modalElements.wrapper, {
            y: scrollY,
        });

        window.scrollTo(0, scrollY);
    }

    // Animate cards out (fade and scale)
    function animateCardsOut(timeline: gsap.core.Timeline) {
        cardsToAnimate.value.forEach((card) => {
            timeline.to(
                card.elements.background,
                {
                    opacity: 0,
                    scale: ANIMATION_CONFIG.SCALES.cardFadeOut,
                    duration: ANIMATION_CONFIG.DURATIONS.cardFadeOut,
                    ease: ANIMATION_CONFIG.EASING.cardFadeOut,
                },
                calculateAnimationDelay(card.id),
            );
        });
    }

    // Animate cards back into view
    function animateCardsIn(timeline: gsap.core.Timeline) {
        cardsToAnimate.value.forEach((card) => {
            timeline.to(
                card.elements.background,
                {
                    opacity: 1,
                    scale: 1,
                    duration: ANIMATION_CONFIG.DURATIONS.cardFadeOut, // Reuse same duration
                    ease: ANIMATION_CONFIG.EASING.cardFadeOut,
                },
                calculateAnimationDelay(card.id, true) + 0.7,
            );
        });
    }

    // Animate modal elements back to card position
    function animateModalToCardPosition(
        timeline: gsap.core.Timeline,
        modalElements: ModalElements,
        transforms: FlipTransforms,
    ) {
        const { imageTransforms, backgroundTransforms } = transforms;

        // Fade out content elements
        timeline.to(
            [
                modalElements.content,
                modalElements.closeButton,
                modalElements.title,
            ],
            {
                opacity: 0,
                duration: ANIMATION_CONFIG.DURATIONS.contentFadeOut,
                ease: ANIMATION_CONFIG.EASING.contentFade,
            },
        );

        // Animate image back to card position
        timeline.to(
            modalElements.image,
            {
                x: imageTransforms.translateX,
                y: imageTransforms.translateY,
                scaleX: imageTransforms.scaleX,
                scaleY: imageTransforms.scaleY,
                duration: ANIMATION_CONFIG.DURATIONS.closeAnimation,
                ease: ANIMATION_CONFIG.EASING.closeTransition,
            },
            "-=0.2", // Start slightly before content fade completes
        );

        // Animate background back to card position
        timeline.to(
            modalElements.background,
            {
                x: backgroundTransforms.translateX,
                y: backgroundTransforms.translateY,
                scaleX: backgroundTransforms.scaleX,
                scaleY: backgroundTransforms.scaleY,
                duration: ANIMATION_CONFIG.DURATIONS.closeAnimation,
                ease: ANIMATION_CONFIG.EASING.closeTransition,
            },
            "<", // Start at the same time as image animation
        );
    }

    function calculateAnimationDelay(
        cardId: number,
        reverse: boolean = false,
    ): number {
        let delay = 0;

        const clickedCard = appState.clickedCard;
        if (!clickedCard || !clickedCardPosition.value) {
            return delay;
        }

        // Get card position from stored positions
        const cardRect = cardPositions.value.get(cardId)?.backgroundPosition;
        if (!cardRect) return delay;

        const screenBottom = window.scrollY + window.innerHeight;

        // Card is visible if any part is in viewport
        if (!(cardRect.bottom < 0 || cardRect.top > screenBottom)) {
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;

            const clickedPos = clickedCardPosition.value.backgroundPosition;
            const clickedCardCenterX = clickedPos.left + clickedPos.width / 2;
            const clickedCardCenterY = clickedPos.top + clickedPos.height / 2;

            const distance = Math.sqrt(
                Math.pow(cardCenterX - clickedCardCenterX, 2) +
                    Math.pow(cardCenterY - clickedCardCenterY, 2),
            );

            // Convert distance to delay with responsive calculation
            const baseDistance =
                window.innerWidth < 768
                    ? ANIMATION_CONFIG.DISTANCES.baseDistanceMobile
                    : ANIMATION_CONFIG.DISTANCES.baseDistanceDesktop;
            const maxDelay =
                window.innerWidth < 768
                    ? ANIMATION_CONFIG.DELAYS.maxCardDelayMobile
                    : ANIMATION_CONFIG.DELAYS.maxCardDelay;

            const normalizedDistance = Math.min(distance / baseDistance, 2);
            delay = Math.pow(normalizedDistance, 1.2) * maxDelay;

            // For 'in' animations, invert the delay so closer cards animate later
            if (reverse) {
                delay = maxDelay - delay;
            }
        }

        return delay;
    }

    return {
        // // State (readonly)
        // clickedCardInfo: readonly(clickedCardInfo),

        animateOpen,
        animateClose,
        // isAnimating,
        // canClickCards,
        // isShowingArticle,

        // registerCard,
        // articleVisible,
        // cardsVisible,
        // animateToArticle,
        // startFlipAnimationIn,
        // startFlipAnimationOut,
        // animateCardsIn,

        // cleanup,
        // unregisterCard,
        // animateBackToGrid,
    };
};

let animationManagerInstance: ReturnType<typeof useAnimationManager> | null =
    null;

export function getAnimationManager() {
    if (!animationManagerInstance) {
        animationManagerInstance = useAnimationManager();
    }
    return animationManagerInstance;
}
