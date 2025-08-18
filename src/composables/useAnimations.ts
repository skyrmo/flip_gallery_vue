import { ref, computed } from "vue";
import { gsap } from "gsap";
import type { CardPosition } from "../types/appTypes";
import { ANIMATION_CONFIG } from "../config/animations";
import { getAppStateManager } from "./useAppState";

let appState = getAppStateManager();

const useAnimationManager = () => {
    const cardPositions = ref<Map<number, CardPosition>>(new Map());
    const activeTimelines = ref<Set<gsap.core.Timeline>>(new Set());

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

    // Main animation setup and coordination
    function createTimeline(modalElements: any) {
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
                calculateAnimationDelay(card.elements.background),
            );
        });
    }

    // Calculate FLIP transform values
    function calculateFlipTransforms(
        clickedCardPos: CardPosition,
        modalElements: any,
    ) {
        const cardBGPos = clickedCardPos.backgroundPosition;
        const cardImagePos = clickedCardPos.imagePosition;

        const articleBackgroundRect =
            modalElements.background.getBoundingClientRect();
        const articleImageRect = modalElements.image.getBoundingClientRect();

        // Image transforms
        const imageTransforms = {
            scaleX: cardImagePos.width / articleImageRect.width,
            scaleY: cardImagePos.height / articleImageRect.height,
            translateX: cardImagePos.left - articleImageRect.left,
            translateY: cardImagePos.top - articleImageRect.top,
        };

        // Background transforms
        const backgroundTransforms = {
            scaleX: cardBGPos.width / articleBackgroundRect.width,
            scaleY: cardBGPos.height / articleBackgroundRect.height,
            translateX: cardBGPos.left - articleBackgroundRect.left,
            translateY: cardBGPos.top - articleBackgroundRect.top,
        };

        return { imageTransforms, backgroundTransforms };
    }

    function setInitialFlipPositions(modalElements, transforms) {
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

    function animateModalToFinalPosition(timeline, modalElements) {
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
        return new Promise<void>(async (resolve) => {
            // update the positions for the cards
            await updateCardsPositionState();

            // store the elements that make up the modal
            const modalElements = appState.modalElements.value;
            const articleId = appState.selectedArticleId.value;

            // if (!modalElements || !articleId) {
            //     throw new Error(
            //         "Tried to animate out, but the model elements or article id were not availaible.",
            //     );
            //     return;
            // }

            // Get clicked card element info (via computed)
            const clickedCard = appState.clickedCard;

            // if (!clickedCard) {
            //     throw new Error(`Clicked card ${articleId} not found`);
            //     return;
            // }

            const timeline = createTimeline(modalElements);

            animateCardsOut(timeline);

            const transforms = calculateFlipTransforms(
                clickedCardPosition.value!,
                modalElements,
            );

            setInitialFlipPositions(modalElements, transforms);

            appState.modalVisible.value = true;

            animateModalToFinalPosition(timeline, modalElements);
        });
    }

    async function animateClose(articleElements: ArticleElements) {
        if (!articleElements || !appState.clickedCard) return;

        return new Promise<void>(async (resolve) => {
            const {
                wrapper: articleViewWrapper,
                background: articleBackground,
                image: articleImage,
                content: articleContent,
                closeButton: articleCloseButton,
                title: articleTitle,
            } = articleElements;

            gsap.set(articleViewWrapper, {
                y: clickedCardInfo.value?.scrollY || 0,
            });

            window.scrollTo(0, clickedCardInfo.value?.scrollY || 0);

            // articleVisible.value = false;
            cardsVisible.value = true;

            const clickedCardId = articleElements.id;

            // Get clicked card info
            const clickedCard = cards.value.get(clickedCardId);
            if (!clickedCard) {
                throw new Error(`Card ${clickedCardId} not found`);
            }

            // Step 1: Collect all cards except the clicked one
            const cardsToAnimate = Array.from(cards.value.entries())
                .filter(([id]) => id !== clickedCardId)
                .map(([id, registration]) => ({ id, ...registration }));

            const articleCloseTimeline = gsap.timeline({
                onComplete: () => {
                    articleVisible.value = false;

                    // Clear all transforms
                    gsap.set(
                        [articleBackground, articleImage, articleViewWrapper],
                        {
                            clearProps: "all",
                        },
                    );

                    activeTimelines.value.delete(articleCloseTimeline);
                    resolve();
                },
            });

            activeTimelines.value.add(articleCloseTimeline);

            gsap.set(articleViewWrapper, {
                y: clickedCardInfo.value.scrollY,
            });

            const cardImagePos = clickedCardInfo.value.imagePosition;
            const cardBGPos = clickedCardInfo.value.cardPosition;

            const articleBackgroundRect =
                articleBackground.getBoundingClientRect();
            const articleImageRect = articleImage.getBoundingClientRect();

            // Calculate scale factors (INVERT phase)
            const scaleX = cardImagePos.width / articleImageRect.width;
            const scaleY = cardImagePos.height / articleImageRect.height;
            const translateX = cardImagePos.left - articleImageRect.left;
            const translateY = cardImagePos.top - articleImageRect.top;

            // Calculate background scale factors (INVERT phase)
            const bgScaleX = cardBGPos.width / articleBackgroundRect.width;
            const bgScaleY = cardBGPos.height / articleBackgroundRect.height;
            const bgTranslateX = cardBGPos.left - articleBackgroundRect.left;
            const bgTranslateY = cardBGPos.top - articleBackgroundRect.top;

            // Animate back to card position
            articleCloseTimeline
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

            const cardsInTimeline = gsap.timeline({
                onComplete: () => {
                    activeTimelines.value.delete(cardsInTimeline);
                    resolve();
                },
            });

            activeTimelines.value.add(cardsInTimeline);

            // Add each card to the timeline with its calculated delay
            // cardsToAnimateIn.forEach((card) => {
            //     // Reset initial state
            //     gsap.set(card.element, {
            //         opacity: 0,
            //         scale: 0.98,
            //     });

            //     cardsInTimeline.to(
            //         card.element,
            //         {
            //             opacity: 1,
            //             scale: 1,
            //             duration: 0.8,
            //             ease: "power2.out",
            //         },
            //         calculateAnimationDelay(card.element, true),
            //     );
            // });
        });
    }

    function calculateAnimationDelay(
        card: HTMLElement,
        reverse: boolean = false,
    ): number {
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

            if (reverse) {
                delay = maxDelay - delay;
            }
        }
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
