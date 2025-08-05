<template>
    <div class="article-view-wrapper">
        <!-- This is the background element that will be animated -->
        <div class="article-background" ref="articleBackgroundRef"></div>

        <!-- This is the content container that remains unaffected by the scaling -->
        <div class="article-content-container">
            <button
                class="close-button"
                ref="closeButtonRef"
                @click="closeArticle"
            >
                <span>&times;</span>
            </button>

            <div class="article-image-container" ref="imageContainerRef">
                <h1 class="article-title" ref="titleRef">
                    {{ article?.title }}
                </h1>
                <img
                    :src="article?.image"
                    alt="Article Image"
                    ref="articleImageRef"
                    class="article-image"
                />
            </div>

            <div class="article-content" ref="contentRef">
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
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import type { Article } from "../types/article";
import { useArticleStore } from "../composables/useArticles";
import { gsap } from "gsap";

const props = defineProps<{
    article: Article | null;
}>();

// Refs for DOM elements
const contentRef = ref<HTMLElement>();
const titleRef = ref();
const closeButtonRef = ref<HTMLElement>();
const articleImageRef = ref<HTMLImageElement>();
const articleBackgroundRef = ref<HTMLDivElement>();

let currentTimeline: gsap.core.Timeline | null = null;

const articleStore = useArticleStore();

// Watch for article changes and trigger FLIP animation
watch(
    () => props.article,
    (newArticle) => {
        // console.log("Article changed");
        if (
            !newArticle?.cardImagePosition ||
            !newArticle?.cardBackgroundPosition
        )
            return;

        // Start animation when article becomes available
        startAnimation(newArticle);
    },
    { immediate: true },
);

async function startAnimation(article: Article) {
    await nextTick(); // important! do not remove.

    let articleImage = articleImageRef.value;
    let articleBackground = articleBackgroundRef.value;

    const articleContent = contentRef.value;
    const articleCloseButton = closeButtonRef.value;
    const articleTitle = titleRef.value;

    const cardImagePos = article.cardImagePosition;
    const cardBGPos = article.cardBackgroundPosition;

    if (!articleImage || !articleBackground || !cardImagePos || !cardBGPos) {
        return;
    }

    const articleViewWrapper = document.querySelector(".article-view-wrapper");

    const currentScrollY = window.scrollY;

    console.log(currentScrollY);

    // Position article container at current scroll level
    gsap.set(articleViewWrapper, {
        y: currentScrollY,
        position: "relative",
        zIndex: 1000,
    });

    // Create GSAP timeline
    currentTimeline = gsap.timeline({
        onComplete: () => {},
    });

    const articleBackgroundRect = articleBackground.getBoundingClientRect();
    const articleImageRect = articleImage.getBoundingClientRect();

    // Calculate scale factors (INVERT phase)
    const scaleX = cardImagePos.width / articleImageRect.width;
    const scaleY = cardImagePos.imageHeight / articleImageRect.height;
    const translateX = cardImagePos.left - articleImageRect.left;
    const translateY = cardImagePos.top - articleImageRect.top;

    // Calculate scale factors (INVERT phase)
    const bgScaleX = cardBGPos.width / articleBackgroundRect.width;
    const bgScaleY = cardBGPos.backgroundHeight / articleBackgroundRect.height;
    const bgTranslateX = cardBGPos.left - articleBackgroundRect.left;
    const bgTranslateY = cardBGPos.top - articleBackgroundRect.top;

    if (articleContent && articleCloseButton && articleTitle) {
        gsap.set([articleContent, articleCloseButton, articleTitle], {
            opacity: 0,
        });
    }

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

    // Animate image to final position
    currentTimeline
        .to(articleBackground, {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.6,
        })
        .to(articleImage, {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0,
        })
        .to(
            articleViewWrapper,
            {
                y: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onUpdate: () => {
                    const progress = currentTimeline.progress();
                    window.scrollTo(0, currentScrollY * (1 - progress));
                },
            },
            "-=0.3",
        );

    if (articleContent && articleCloseButton && articleTitle) {
        currentTimeline.to([articleContent, articleCloseButton, articleTitle], {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            delay: 0,
        });
    }
}

// // Clean up
// onBeforeUnmount(() => {
//     // Reset animation states
//     isAnimating.value = false;
// });

// Close article and animate back
function closeArticle() {
    articleStore.closeArticle();
}
</script>

<style scoped>
.article-view-wrapper {
    position: relative;
    width: 100%;
    min-height: 100vh;
}

.article-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
    will-change: transform, width, height, top, left;
}

.article-content-container {
    position: relative;
    z-index: 20;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.article-image-container {
    display: grid;
    grid-template-areas: "article-header";
}

.article-image {
    grid-area: article-header;
    /*max-width: 800px;*/
    justify-self: center;
    will-change: transform, width, height, top, left;
}

.article-title {
    grid-area: article-header;
    font-size: 3.2rem;
    display: block;
    color: var(--color-text);
    justify-self: center;
    align-self: center;
    z-index: 100;
}

.article-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 30px;
    border-radius: 8px;
    margin-top: 20px;
}

.article-body {
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 93ch;
    /*color: #242424;*/
    color: var(--color-text);
    column-width: 45ch;
    column-gap: 1.6rem;
    column-count: 2;
}

.article-paragraph {
    margin-bottom: 1.5rem;
    text-align: justify;
    /*columns: 2;*/
    break-inside: avoid;
    page-break-inside: avoid; /* For older browsers */
}

.article-paragraph:last-child {
    margin-bottom: 0;
}

.close-button {
    align-self: flex-end;
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
    margin-bottom: 20px;
    z-index: 30;
}

.close-button:hover {
    background: rgba(0, 0, 0, 0.7);
}
</style>
