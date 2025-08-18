import { ref, computed } from "vue";
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
                calculateAnimationOutDelay(card.elements.background),
            );
        });
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

        gsap.set(modalElements?.wrapper, {
            y: clickedCardPos.scrollY || 0,
        });

        window.scrollTo(0, clickedCardPos.scrollY || 0);

        // Get clicked card info
        const clickedCard = appState.clickedCard.value;
        if (!clickedCard) {
            throw new Error(`clicked card not found`);
        }

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

                // activeTimelines.value.delete(timeline);
            },
        });

        activeTimelines.value.add(timeline);

        gsap.set(modalElements.wrapper, {
            y: clickedCardPos.scrollY,
        });

        const cardImagePos = clickedCardPos.imagePosition;
        const cardBGPos = clickedCardPos.backgroundPosition;

        const modalBGPos = modalElements.background.getBoundingClientRect();
        const modalImagePos = modalElements.image.getBoundingClientRect();

        // Calculate scale factors (INVERT phase)
        const scaleX = cardImagePos.width / modalImagePos.width;
        const scaleY = cardImagePos.height / modalImagePos.height;
        const translateX = cardImagePos.left - modalImagePos.left;
        const translateY = cardImagePos.top - modalImagePos.top;

        // Calculate background scale factors (INVERT phase)
        const bgScaleX = cardBGPos.width / modalBGPos.width;
        const bgScaleY = cardBGPos.height / modalBGPos.height;
        const bgTranslateX = cardBGPos.left - modalBGPos.left;
        const bgTranslateY = cardBGPos.top - modalBGPos.top;

        // Animate back to card position
        timeline
            .to(
                [
                    modalElements.content,
                    modalElements.closeButton,
                    modalElements.title,
                ],
                {
                    opacity: 0,
                    duration: 0.4,
                    ease: "sine.out",
                },
            )
            .to(
                modalElements.image,
                {
                    x: translateX,
                    y: translateY,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    duration: 0.8,
                    ease: "expo.inOut",
                },
                "-=0.2",
            )
            .to(
                modalElements.background,
                {
                    x: bgTranslateX,
                    y: bgTranslateY,
                    scaleX: bgScaleX,
                    scaleY: bgScaleY,
                    duration: 0.8,
                    ease: "expo.inOut",
                },
                "<",
            );

        appState.cardsVisible.value = true;

        // Add each card to the timeline with its calculated delay
        cardsToAnimate.value.forEach((card) => {
            timeline.to(
                card.elements.background,
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "sine.out",
                },

                calculateAnimationInDelay(card.id) + 0.7,
            );
        });
    }

    function calculateAnimationOutDelay(card: HTMLElement): number {
        let delay = 0;

        const clickedCard = appState.clickedCard;

        if (!clickedCard || !clickedCardPosition.value) {
            return delay;
        }

        const cardRect = card.getBoundingClientRect();

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
        }
        // console.log(card, delay);
        return delay;
    }

    function calculateAnimationInDelay(cardId: number): number {
        let delay = 0;

        const clickedCard = appState.clickedCard;

        if (!clickedCard || !clickedCardPosition.value) {
            return delay;
        }

        const cardPos = cardPositions.value.get(cardId)?.backgroundPosition;
        if (!cardPos) return delay;

        const screenBottom = window.scrollY + window.innerHeight;

        // Card is visible if any part is in viewport
        if (!(cardPos.bottom < 0 || cardPos.top > screenBottom)) {
            const cardCenterX = cardPos.left + cardPos.width / 2;
            const cardCenterY = cardPos.top + cardPos.height / 2;

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

            delay = maxDelay - delay;
        }
        // console.log(card, delay);
        return delay;
    }

    // // Watch state changes and control scrolling
    // watch(currentState, (newState) => {
    //     const isAnimating =
    //         newState === "animating-out" || newState === "animating-in";

    //     if (isAnimating) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "";
    //     }
    // });

    // // Cleanup function
    // function cleanup() {
    //     if (currentTimeline.value) {
    //         currentTimeline.value.kill();
    //         currentTimeline.value = null;
    //     }
    //     currentState.value = "idle";
    //     clickedCardInfo.value = null;
    // }

    // // Getters
    // const isAnimating = computed(
    //     () =>
    //         currentState.value === "animating-out" ||
    //         currentState.value === "animating-in",
    // );

    // const canClickCards = computed(() => currentState.value === "idle");

    // const isShowingArticle = computed(
    //     () => currentState.value === "showing-article",
    // );

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
