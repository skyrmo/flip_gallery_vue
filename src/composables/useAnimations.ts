<<<<<<< HEAD
import { ref, computed, readonly, watch, nextTick } from "vue";
=======
import { ref, computed } from "vue";
>>>>>>> different_approach
import { gsap } from "gsap";
import type {
    CardPosition,
    FlipTransforms,
    ModalElements,
} from "../types/appTypes";
import { ANIMATION_CONFIG } from "../config/animations";
import { getAppStateManager } from "./useAppState";

<<<<<<< HEAD
type AnimationState =
    | "idle"
    | "card-selected" // New state for when card is clicked but grid still visible
    | "animating-out"
    | "cards-animated-out" // New state for when cards are done animating out
    | "showing-article"
    | "flip-animating-in"
    | "flip-animating-out"
    | "animating-in";

interface CardRegistration {
    element: HTMLElement;
    image: HTMLImageElement;
}

interface ClickedCardInfo {
    id: number;
    cardPosition: DOMRect;
    imagePosition: DOMRect;
    scrollY: number;
}

interface ArticleElements {
    wrapper: HTMLElement;
    background: HTMLElement;
    image: HTMLImageElement;
    content: HTMLElement;
    closeButton: HTMLElement;
    title: HTMLElement;
}
=======
let appState = getAppStateManager();
>>>>>>> different_approach

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

<<<<<<< HEAD
        // First state: card selected, grid still visible
        currentState.value = "card-selected";

        await nextTick();

        currentState.value = "animating-out";

        // Step 1: Collect all cards except the clicked one
        const cardsToAnimate = Array.from(registeredCards.value.entries())
            .filter(([id]) => id !== clickedCardId)
            .map(([id, registration]) => ({ id, ...registration }));

        // Step 2: Animate all cards out
        await animateCardsOut(cardsToAnimate);

        // Step 3: Cards are animated out, ready for article
        currentState.value = "cards-animated-out";

        return clickedCardInfo.value;
=======
        // Background transforms
        const backgroundTransforms = {
            scaleX: cardBGPos.width / modalBGPos.width,
            scaleY: cardBGPos.height / modalBGPos.height,
            translateX: cardBGPos.left - modalBGPos.left,
            translateY: cardBGPos.top - modalBGPos.top,
        };

        return { imageTransforms, backgroundTransforms };
>>>>>>> different_approach
    }

    function setInitialFlipPositions(
        modalElements: ModalElements,
        transforms: FlipTransforms,
    ) {
<<<<<<< HEAD
        return new Promise<void>((resolve, reject) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    activeTimelines.value.delete(timeline);
                    resolve();
                },
                onInterrupt: () => {
                    activeTimelines.value.delete(timeline);
                    reject(new Error("Animation interrupted"));
                },
            });
=======
        const { imageTransforms, backgroundTransforms } = transforms;
>>>>>>> different_approach

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

<<<<<<< HEAD
                timeline.to(
                    card.element,
                    {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.8,
                        ease: "power2.out",
                    },
                    delay * 0.2,
                );
            });

            // If no cards to animate, resolve immediately
            if (cards.length === 0) {
                resolve();
            }
        });
    }

    async function startFlipAnimationIn(
        articleElements: ArticleElements,
    ): Promise<void> {
        // Allow starting from both states
        if (
            currentState.value !== "cards-animated-out" &&
            currentState.value !== "showing-article"
        ) {
            console.warn(
                `Cannot start FLIP animation from state: ${currentState.value}`,
            );
            return;
        }
=======
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
>>>>>>> different_approach

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

<<<<<<< HEAD
        currentState.value = "flip-animating-in";

        await performFlipAnimationIn(articleElements, clickedCardInfo.value);

        // Animation complete - article is now fully visible
        currentState.value = "showing-article";
    }

    async function performFlipAnimationIn(
        articleElements: ArticleElements,
        clickedInfo: ClickedCardInfo,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const {
                wrapper: articleViewWrapper,
                background: articleBackground,
                image: articleImage,
                content: articleContent,
                closeButton: articleCloseButton,
                title: articleTitle,
            } = articleElements;
=======
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
>>>>>>> different_approach

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

<<<<<<< HEAD
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Clean up wrapper positioning but preserve other transforms until cleanup
                    gsap.set(articleViewWrapper, {
                        clearProps: "y,position,zIndex",
                    });
                    window.scrollTo(0, 0);
                    activeTimelines.value.delete(timeline);
                    resolve();
                },
                onInterrupt: () => {
                    activeTimelines.value.delete(timeline);
                    reject(new Error("FLIP animation interrupted"));
                },
            });

            activeTimelines.value.add(timeline);

            // Animate to final positions (PLAY phase)
            timeline
                .to(articleBackground, {
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 1.2,
                    ease: "expo.inOut",
                })
                .to(
                    articleImage,
                    {
                        x: 0,
                        y: 0,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 1.2,
                        ease: "expo.inOut",
                    },
                    "-=0.9",
                )
                .to(
                    [articleContent, articleCloseButton, articleTitle],
                    {
                        opacity: 1,
                        duration: 0.4,
                        ease: "power2.out",
                    },
                    "-=0.3",
                );
=======
    async function animateClose() {
        // store the elements that make up the modal
        const modalElements = appState.modalElements.value;

        const clickedCardPos = clickedCardPosition.value;

        if (!modalElements || !clickedCardPos) return;

        gsap.set(modalElements?.wrapper, {
            y: clickedCardPos.scrollY || 0,
>>>>>>> different_approach
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

<<<<<<< HEAD
    async function performFlipAnimationOut(
        articleElements: ArticleElements,
        clickedInfo: ClickedCardInfo,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const {
                wrapper: articleViewWrapper,
                background: articleBackground,
                image: articleImage,
                content: articleContent,
                closeButton: articleCloseButton,
                title: articleTitle,
            } = articleElements;
=======
                // activeTimelines.value.delete(timeline);
            },
        });
>>>>>>> different_approach

        activeTimelines.value.add(timeline);

        gsap.set(modalElements.wrapper, {
            y: clickedCardPos.scrollY,
        });

<<<<<<< HEAD
            gsap.set(articleViewWrapper, {
                y: scrollY,
                position: "relative",
                zIndex: 1000,
            });
            window.scrollTo(0, scrollY);
=======
        const cardImagePos = clickedCardPos.imagePosition;
        const cardBGPos = clickedCardPos.backgroundPosition;
>>>>>>> different_approach

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

<<<<<<< HEAD
            // Create reverse animation timeline
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Clear ALL transforms from article elements
                    gsap.set(
                        [
                            articleBackground,
                            articleImage,
                            articleViewWrapper,
                            articleContent,
                            articleCloseButton,
                            articleTitle,
                        ],
                        {
                            clearProps: "all",
                        },
                    );
                    activeTimelines.value.delete(timeline);
                    resolve();
                },
                onInterrupt: () => {
                    activeTimelines.value.delete(timeline);
                    reject(new Error("FLIP animation out interrupted"));
                },
            });

            // Animate back to card position
            timeline
                .to([articleContent, articleCloseButton, articleTitle], {
                    opacity: 0,
                    duration: 0.2,
                    ease: "power2.out",
                })
                .to(
                    articleImage,
                    {
                        x: translateX,
                        y: translateY,
                        scaleX: scaleX,
                        scaleY: scaleY,
                        duration: 0.8,
                        ease: "power3.out",
                    },
                    "-=0.2",
                )
                .to(
                    articleBackground,
                    {
                        x: bgTranslateX,
                        y: bgTranslateY,
                        scaleX: bgScaleX,
                        scaleY: bgScaleY,
                        duration: 0.8,
                        ease: "power3.out",
                    },
                    "<",
                );
        });
    }

    // Add this method to your animation manager
    async function animateCardsIn(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Get all cards except the clicked one
            const cardsToAnimate = Array.from(registeredCards.value.entries())
                .filter(([id]) => id !== clickedCardInfo.value?.id)
                .map(([id, registration]) => ({ id, ...registration }));

            if (cardsToAnimate.length === 0) {
                // Reset state and clear clicked card info
                currentState.value = "idle";
                clickedCardInfo.value = null;
                resolve();
                return;
            }

            const timeline = gsap.timeline({
                onComplete: () => {
                    activeTimelines.value.delete(timeline);
                    // Reset to idle state and clear clicked card info
                    currentState.value = "idle";
                    clickedCardInfo.value = null;
                    resolve();
                },
                onInterrupt: () => {
                    activeTimelines.value.delete(timeline);
                    reject(new Error("Cards in animation interrupted"));
                },
            });
=======
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
>>>>>>> different_approach

        appState.cardsVisible.value = true;

<<<<<<< HEAD
            // Animate cards back in with stagger
            cardsToAnimate.forEach((card, index) => {
                // Reset initial state - clear any previous transforms first
                gsap.set(card.element, {
                    clearProps: "all",
                });

                // Reset initial state
                gsap.set(card.element, {
                    opacity: 0,
                    scale: 0.98,
                });
=======
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
>>>>>>> different_approach

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

<<<<<<< HEAD
    // Enhanced cleanup function
    function cleanup() {
        // Kill all active timelines
        activeTimelines.value.forEach((timeline) => {
            timeline.kill();
        });
        activeTimelines.value.clear();

        // Clear all GSAP properties from registered cards
        registeredCards.value.forEach(({ element }) => {
            gsap.set(element, { clearProps: "all" });
        });

        // Reset state
        currentState.value = "idle";
        clickedCardInfo.value = null;

        // Restore body overflow
        document.body.style.overflow = "";
    }

    // Watch state changes and control scrolling
    watch(currentState, (newState, oldState) => {
        console.log(`Animation state: ${oldState} -> ${newState}`);

        const isAnimating =
            newState === "animating-out" ||
            newState === "animating-in" ||
            newState === "flip-animating-in" ||
            newState === "flip-animating-out";
=======
    function calculateAnimationInDelay(cardId: number): number {
        let delay = 0;
>>>>>>> different_approach

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

    // Computed properties with error handling and debugging
    const isAnimating = computed(() => {
        try {
            const state = currentState.value;
            const result =
                state === "animating-out" ||
                state === "animating-in" ||
                state === "flip-animating-in" ||
                state === "flip-animating-out";
            return result;
        } catch (error) {
            console.error("Error in isAnimating computed:", error);
            return false;
        }
    });

<<<<<<< HEAD
    const canClickCards = computed(() => {
        try {
            const result = currentState.value === "idle";
            return result;
        } catch (error) {
            console.error("Error in canClickCards computed:", error);
            return false;
        }
    });

    const isShowingArticle = computed(() => {
        try {
            const result = currentState.value === "showing-article";
            return result;
        } catch (error) {
            console.error("Error in isShowingArticle computed:", error);
            return false;
        }
    });
=======
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
>>>>>>> different_approach

    return {
        // // State (readonly)
        // clickedCardInfo: readonly(clickedCardInfo),

<<<<<<< HEAD
        // Computed state helpers
        isAnimating,
        canClickCards,
        isShowingArticle,

        // Core functions
        registerCard,
        unregisterCard,
        animateToArticle,
        startFlipAnimationIn,
        startFlipAnimationOut,
        animateCardsIn,
        cleanup,
=======
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
>>>>>>> different_approach
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
