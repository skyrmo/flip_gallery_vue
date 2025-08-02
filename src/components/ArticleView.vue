<template>
    <div class="article-view" ref="articleViewRef">
        <button class="close-button" ref="closeButtonRef" @click="closeArticle">
            <span>&times;</span>
        </button>
        <div class="article-image-container" ref="imageContainerRef">
            <img
                :src="article.image"
                alt="Article Image"
                ref="articleImageRef"
                class="article-image"
            />
        </div>

        <div class="article-content" ref="contentRef">
            <h1 class="article-title">{{ article.title }}</h1>
            <div class="article-body">
                <template v-if="Array.isArray(article?.content)">
                    <p
                        v-for="(paragraph, index) in article.content"
                        :key="index"
                        class="article-paragraph"
                    >
                        {{ paragraph }}
                    </p>
                </template>
                <template v-else>
                    <p class="article-paragraph">{{ article?.content }}</p>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useArticleStore } from "../composables/useArticles";
import type { Article } from "../types/article";
import { gsap } from "gsap";

const props = defineProps<{
    article: Article | null;
}>();

const articleStore = useArticleStore();

// Refs for DOM elements
const imageContainerRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const closeButtonRef = ref<HTMLElement>();
const articleImageRef = ref<HTMLImageElement>();
let articleImage;

// Watch for article changes and trigger FLIP animation
watch(
    () => props.article,
    (newArticle) => {
        // console.log("Article changed");
        if (!newArticle?.initialPosition) return;

        // Start animation when article becomes available
        startAnimation(newArticle);
    },
    { immediate: true },
);

// Animation state
const isAnimating = ref(false);
let currentTimeline: gsap.core.Timeline | null = null;

async function startAnimation(article: Article) {
    await nextTick();

    articleImage = articleImageRef.value;

    const initialPosition = article.initialPosition;
    // const imageContainer = imageContainerRef.value;
    const content = contentRef.value;
    const closeButton = closeButtonRef.value;
    const imageContainer = imageContainerRef.value;

    // Function to perform FLIP animation
    const performFLIPAnimation = (image: HTMLImageElement) => {
        const finalImageRect = image.getBoundingClientRect();

        // Calculate scale factors (INVERT phase)
        const scaleX = initialPosition.width / finalImageRect.width;
        const scaleY = initialPosition.imageHeight / finalImageRect.height;
        const translateX = initialPosition.left - finalImageRect.left;
        const translateY = initialPosition.top - finalImageRect.top;

        // Create GSAP timeline
        currentTimeline = gsap.timeline({
            onComplete: () => {
                isAnimating.value = false;
                currentTimeline = null;
            },
        });

        // Set initial state
        gsap.set([content, closeButton], { opacity: 0 });
        gsap.set(image, {
            transformOrigin: "top left",
            x: translateX,
            y: translateY,
            scaleX: scaleX,
            scaleY: scaleY,
        });

        // Animate image to final position
        currentTimeline
            .to(
                image,
                {
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 0.9,
                    ease: "power3.out",
                },
                0.2,
            )
            .to(
                [content, closeButton],
                {
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out",
                },
                0.9,
            );
    };

    // Wait for image to load if needed
    if (articleImage && articleImage.complete) {
        performFLIPAnimation(articleImage);
    } else {
        if (!articleImage) return;
        articleImage.onload = () => performFLIPAnimation(articleImage);
    }
}

// // Clean up
// onBeforeUnmount(() => {
//     // Reset animation states
//     isAnimating.value = false;
// });

// Close article and animate back
function closeArticle() {
    if (isAnimating.value || !props.article?.initialPosition) {
        // If no initial position or already animating, close immediately
        articleStore.closeArticle();
        return;
    }

    isAnimating.value = true;

    const articleImage = articleImageRef.value;
    const initialPosition = props.article.initialPosition;
    const content = contentRef.value;
    const closeButton = closeButtonRef.value;

    if (!articleImage || !content || !closeButton) {
        articleStore.closeArticle();
        return;
    }

    const currentImageRect = articleImage.getBoundingClientRect();

    // Calculate reverse animation values
    const scaleX = initialPosition.width / currentImageRect.width;
    const scaleY = initialPosition.imageHeight / currentImageRect.height;
    const translateX = initialPosition.left - currentImageRect.left;
    const translateY = initialPosition.top - currentImageRect.top;

    // Create reverse animation timeline
    currentTimeline = gsap.timeline({
        onComplete: async () => {
            isAnimating.value = false;
            currentTimeline = null;
            // Close the article after animation completes
            // await nextTick();
            gsap.delayedCall(0.2, () => {
                articleStore.closeArticle();
            });
        },
    });

    // Fade out content and close button first
    currentTimeline.to([content, closeButton], {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
    });

    // Animate image back to initial position
    currentTimeline.to(
        articleImage,
        {
            x: translateX,
            y: translateY,
            scaleX: scaleX,
            scaleY: scaleY,
            duration: 0.7,
            ease: "power3.in",
        },
        0.2,
    ); // Start slightly after content fade out
}
</script>

<style scoped>
.article-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
}

.article-image-container {
    display: grid;
    justify-content: center;
}

.article-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.article-image {
    will-change: scale, translate;
}

.article-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
}

.article-body {
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 65ch;
}

.article-body {
    font-size: 1.1rem;
    line-height: 1.6;
}

.article-paragraph {
    margin-bottom: 1.5rem;
    text-align: justify;
}

.article-paragraph:last-child {
    margin-bottom: 0;
}

.article-title {
    font-size: 2.5rem;
    margin-bottom: 30px;
    color: var(--secondary-color);
}

.close-button {
    align-self: end;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    /*transition: background 0.3s ease;*/
}

.close-button:hover {
    background: rgba(0, 0, 0, 0.7);
}

/* Ensure no scroll on body when article is open */
.is-animating {
    overflow: hidden;
}
</style>
