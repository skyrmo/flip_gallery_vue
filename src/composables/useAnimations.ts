import { ref, computed, readonly, watch } from "vue";
import { gsap } from "gsap";

type AnimationState =
    | "idle"
    | "animating-out"
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

const useAnimationManager = () => {
    //state
    const currentState = ref<AnimationState>("idle");
    const registeredCards = ref<Map<number, CardRegistration>>(new Map());
    const clickedCardInfo = ref<ClickedCardInfo | null>(null);
    const activeTimelines = ref<Set<gsap.core.Timeline>>(new Set());

    function registerCard(
        id: number,
        element: HTMLElement,
        image: HTMLImageElement,
    ) {
        registeredCards.value.set(id, { element, image });
    }

    function unregisterCard(id: number) {
        registeredCards.value.delete(id);
    }

    async function animateToArticle(clickedCardId: number) {
        if (currentState.value !== "idle") return;

        // Get clicked card info
        const clickedCard = registeredCards.value.get(clickedCardId);
        if (!clickedCard) {
            throw new Error(`Card ${clickedCardId} not found`);
        }
        // Store clicked card info for FLIP animation
        const cardRect = clickedCard.element.getBoundingClientRect();
        const imageRect = clickedCard.image.getBoundingClientRect();

        clickedCardInfo.value = {
            id: clickedCardId,
            cardPosition: cardRect,
            imagePosition: imageRect,
            scrollY: window.scrollY,
        };

        currentState.value = "animating-out";

        // Step 1: Collect all cards except the clicked one
        const cardsToAnimate = Array.from(registeredCards.value.entries())
            .filter(([id]) => id !== clickedCardId)
            .map(([id, registration]) => ({ id, ...registration }));

        // Step 2: Animate all cards out
        await animateCardsOut(cardsToAnimate);

        // Step 3: State is now ready for article
        currentState.value = "showing-article";

        return clickedCardInfo.value;
    }

    async function animateCardsOut(
        cards: Array<{
            id: number;
            element: HTMLElement;
            image: HTMLImageElement;
        }>,
    ) {
        return new Promise((resolve, reject) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    activeTimelines.value.delete(timeline);
                    resolve();
                },
                onStart: () => {
                    console.log("🚀 Timeline started!");
                },
            });

            // Track this timeline for cleanup
            activeTimelines.value.add(timeline);

            // Add each card to the timeline with its calculated delay
            cards.forEach((card) => {
                const delay = calculateAnimationDelay(card.element);

                // console.log(card.id, delay * 4);

                timeline.to(
                    card.element,
                    {
                        opacity: 0,
                        scale: 0.98,
                        duration: 0.4,
                        ease: "power2.out",
                    },
                    delay * 0.8,
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
        if (currentState.value !== "showing-article") {
            console.warn("Not in showing article state");
            return;
        }

        if (!clickedCardInfo.value) {
            console.warn("No clicked card info available");
            return;
        }

        currentState.value = "flip-animating-in";

        await performFlipAnimationIn(articleElements, clickedCardInfo.value);
        // Animation complete - article is now fully visible
        currentState.value = "showing-article";
    }

    async function performFlipAnimationIn(
        articleElements: ArticleElements,
        clickedInfo: ClickedCardInfo,
    ): Promise<void> {
        return new Promise((resolve) => {
            const {
                wrapper: articleViewWrapper,
                background: articleBackground,
                image: articleImage,
                content: articleContent,
                closeButton: articleCloseButton,
                title: articleTitle,
            } = articleElements;

            const cardImagePos = clickedInfo.imagePosition;
            const cardBGPos = clickedInfo.cardPosition;

            // Position article container at current scroll level
            gsap.set(articleViewWrapper, {
                y: clickedInfo.scrollY || 0,
                position: "relative",
                zIndex: 1000,
            });

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

            // Hide content initially
            gsap.set([articleContent, articleCloseButton, articleTitle], {
                opacity: 0,
            });

            // Set initial FLIP positions
            gsap.set(articleBackground, {
                transformOrigin: "top left",
                x: bgTranslateX,
                y: bgTranslateY,
                scaleX: bgScaleX,
                scaleY: bgScaleY,
            });

            gsap.set(articleImage, {
                transformOrigin: "top left",
                x: translateX,
                y: translateY,
                scaleX: scaleX,
                scaleY: scaleY,
            });

            const timeline = gsap.timeline({
                onComplete: () => {
                    gsap.set(articleViewWrapper, { y: 0 });
                    window.scrollTo(0, 0);
                    resolve();
                },
            });

            // Animate to final positions (PLAY phase)
            timeline
                .to(articleBackground, {
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 1,
                    ease: "power3.out",
                    delay: 0.0,
                })
                .to(
                    articleImage,
                    {
                        x: 0,
                        y: 0,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 1,
                        ease: "power3.out",
                    },
                    "<",
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
        });
    }

    async function startFlipAnimationOut(
        articleElements: ArticleElements,
    ): Promise<void> {
        // if (currentState.value !== "showing-article") {
        //     console.warn("Not in showing article state");
        //     return;
        // }

        if (!clickedCardInfo.value) {
            console.warn("No clicked card info available in FLIP-out");
            return;
        }

        currentState.value = "flip-animating-out";

        await performFlipAnimationOut(articleElements, clickedCardInfo.value);
        // Animation complete - article is now fully visible
        currentState.value = "showing-article";
    }

    async function performFlipAnimationOut(
        articleElements: ArticleElements,
        clickedInfo: ClickedCardInfo,
    ): Promise<void> {
        return new Promise((resolve) => {
            const {
                wrapper: articleViewWrapper,
                background: articleBackground,
                image: articleImage,
                content: articleContent,
                closeButton: articleCloseButton,
                title: articleTitle,
            } = articleElements;

            const cardImagePos = clickedInfo.imagePosition;
            const cardBGPos = clickedInfo.cardPosition;

            // Restore original scroll position before starting reverse animation
            const scrollY = clickedInfo.scrollY || 0;

            gsap.set(articleViewWrapper, {
                y: scrollY,
            });
            window.scrollTo(0, scrollY);

            // Get current positions for reverse animation
            const articleBackgroundRect =
                articleBackground.getBoundingClientRect();
            const articleImageRect = articleImage.getBoundingClientRect();

            // Calculate scale factors for reverse animation (back to card size)
            const scaleX = cardImagePos.width / articleImageRect.width;
            const scaleY = cardImagePos.height / articleImageRect.height;
            const translateX = cardImagePos.left - articleImageRect.left;
            const translateY = cardImagePos.top - articleImageRect.top;

            // Calculate scale factors for background reverse animation
            const bgScaleX = cardBGPos.width / articleBackgroundRect.width;
            const bgScaleY = cardBGPos.height / articleBackgroundRect.height;
            const bgTranslateX = cardBGPos.left - articleBackgroundRect.left;
            const bgTranslateY = cardBGPos.top - articleBackgroundRect.top;

            // Create reverse animation timeline
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Clear all transforms
                    gsap.set(
                        [articleBackground, articleImage, articleViewWrapper],
                        {
                            clearProps: "all",
                        },
                    );
                    resolve();
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
        return new Promise((resolve) => {
            // Get all cards except the clicked one
            const cardsToAnimate = Array.from(registeredCards.value.entries())
                .filter(([id]) => id !== clickedCardInfo.value?.id)
                .map(([id, registration]) => ({ id, ...registration }));

            if (cardsToAnimate.length === 0) {
                resolve();
                return;
            }

            const timeline = gsap.timeline({
                onComplete: () => {
                    activeTimelines.value.delete(timeline);
                    currentState.value = "idle";
                    resolve();
                },
            });

            activeTimelines.value.add(timeline);

            // Animate cards back in with stagger
            cardsToAnimate.forEach((card, index) => {
                // Reset initial state
                gsap.set(card.element, {
                    opacity: 0,
                    scale: 0.98,
                });

                timeline.to(
                    card.element,
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        ease: "power2.out",
                    },
                    index * 0.05, // Stagger effect
                );
            });
        });
    }

    function calculateAnimationDelay(card: HTMLElement): number {
        let delay = 0;
        const cardRect = card.getBoundingClientRect();
        const screenBottom = window.scrollY + window.innerHeight;

        // // Card is visible if any part is in viewport
        if (!(cardRect.bottom < 0 || cardRect.top > screenBottom)) {
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;

            const clickedPos = clickedCardInfo.value?.cardPosition!;
            const clickedCardCenterX = clickedPos.left + clickedPos.width / 2;
            const clickedCardCenterY = clickedPos.top + clickedPos.height / 2;

            const distance = Math.sqrt(
                Math.pow(cardCenterX - clickedCardCenterX, 2) +
                    Math.pow(cardCenterY - clickedCardCenterY, 2),
            );

            // Convert distance to delay with responsive calculation
            const viewportWidth = window.innerWidth;
            const baseDistance = viewportWidth < 768 ? 400 : 800;
            const maxDelay = viewportWidth < 768 ? 0.3 : 0.5;
            const normalizedDistance = Math.min(distance / baseDistance, 2);
            delay = Math.pow(normalizedDistance, 1.2) * maxDelay;
        }
        return delay;
    }

    // Watch state changes and control scrolling
    watch(currentState, (newState) => {
        const isAnimating =
            newState === "animating-out" || newState === "animating-in";

        if (isAnimating) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });

    // // Cleanup function
    // function cleanup() {
    //     if (currentTimeline.value) {
    //         currentTimeline.value.kill();
    //         currentTimeline.value = null;
    //     }
    //     currentState.value = "idle";
    //     clickedCardInfo.value = null;
    // }

    // Getters
    const isAnimating = computed(
        () =>
            currentState.value === "animating-out" ||
            currentState.value === "animating-in",
    );

    const canClickCards = computed(() => currentState.value === "idle");

    const isShowingArticle = computed(
        () => currentState.value === "showing-article",
    );

    return {
        // State (readonly)
        currentState: readonly(currentState),
        clickedCardInfo: readonly(clickedCardInfo),

        isAnimating,
        canClickCards,
        isShowingArticle,

        registerCard,
        animateToArticle,
        startFlipAnimationIn,
        startFlipAnimationOut,
        animateCardsIn,

        // cleanup,
        unregisterCard,
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
