<template>
    <div class="article__wrapper" ref="articleWrapperRef">
        <div class="background" ref="articleBackgroundRef"></div>
        <div class="content__wrapper">
            <button
                class="button__close"
                ref="closeButtonRef"
                @click="closeArticle"
            >
                <span>&times;</span>
            </button>

            <div class="hero-section">
                <div class="image__wrapper">
                    <img
                        :src="article?.image"
                        alt="Article Image"
                        ref="articleImageRef"
                        class="image"
                    />
                </div>
                <div class="title__wrapper">
                    <h1 class="title" ref="titleRef">
                        {{ article?.title }}
                    </h1>
                </div>
            </div>

            <div class="content" ref="contentRef">
                <div class="body">
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
const titleRef = ref<HTMLElement>();
const closeButtonRef = ref<HTMLElement>();
const articleImageRef = ref<HTMLImageElement>();
const articleBackgroundRef = ref<HTMLDivElement>();
const articleViewWrapperRef = ref<HTMLElement>();

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

    const articleImage = articleImageRef.value;
    const articleBackground = articleBackgroundRef.value;
    const articleContent = contentRef.value;
    const articleCloseButton = closeButtonRef.value;
    const articleTitle = titleRef.value;

    const cardImagePos = article.cardImagePosition;
    const cardBGPos = article.cardBackgroundPosition;

    if (!articleImage || !articleBackground || !cardImagePos || !cardBGPos) {
        return;
    }

    const articleViewWrapper = articleViewWrapperRef.value;

    const currentScrollY = window.scrollY;

    // Position article container at current scroll level
    gsap.set(articleViewWrapper!, {
        y: currentScrollY,
        position: "relative",
        zIndex: 1000,
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

    // Create GSAP timeline
    currentTimeline = gsap.timeline({
        onComplete: () => {
            gsap.set(articleViewWrapper!, {
                y: 0,
            });
            window.scrollTo(0, 0);
        },
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
}

// Close article and animate back
function closeArticle() {
    if (
        !props.article?.cardImagePosition ||
        !props.article?.cardBackgroundPosition
    ) {
        articleStore.closeArticle();
        articleStore.setAnimating(false);
        return;
    }

    const articleImage = articleImageRef.value;
    const articleBackground = articleBackgroundRef.value;
    const articleContent = contentRef.value;
    const articleCloseButton = closeButtonRef.value;
    const articleTitle = titleRef.value;

    const cardImagePos = props.article.cardImagePosition;
    const cardBGPos = props.article.cardBackgroundPosition;
    const originalScrollY = props.article.scrollPositionAtClick || 0;

    if (!articleImage || !articleBackground || !cardImagePos || !cardBGPos) {
        articleStore.closeArticle();
        articleStore.setAnimating(false);
        return;
    }

    // Kill any existing timeline
    if (currentTimeline) {
        currentTimeline.kill();
    }

    // Restore original scroll position before starting reverse animation
    const articleViewWrapper = document.querySelector(".article__wrapper");
    if (articleViewWrapper) {
        gsap.set(articleViewWrapper, {
            y: originalScrollY,
        });
        window.scrollTo(0, originalScrollY);
    }

    // Get current positions for reverse animation
    const articleBackgroundRect = articleBackground.getBoundingClientRect();
    const articleImageRect = articleImage.getBoundingClientRect();

    // Calculate scale factors for reverse animation (back to card size)
    const scaleX = cardImagePos.width / articleImageRect.width;
    const scaleY = cardImagePos.imageHeight / articleImageRect.height;
    const translateX = cardImagePos.left - articleImageRect.left;
    const translateY = cardImagePos.top - articleImageRect.top;

    // Calculate scale factors for background reverse animation
    const bgScaleX = cardBGPos.width / articleBackgroundRect.width;
    const bgScaleY = cardBGPos.backgroundHeight / articleBackgroundRect.height;
    const bgTranslateX = cardBGPos.left - articleBackgroundRect.left;
    const bgTranslateY = cardBGPos.top - articleBackgroundRect.top;

    // Create reverse animation timeline
    const reverseTimeline = gsap.timeline({
        onComplete: () => {
            // Call store close article after animation completes
            articleStore.closeArticle();

            // Re-enable scrolling
            articleStore.setAnimating(false);
        },
    });

    // First fade out content elements
    reverseTimeline
        .to([articleContent, articleCloseButton, articleTitle], {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
        })
        // Then animate image and background back to card position
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
            "-=0.1",
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
}
</script>

<style scoped>
.article__wrapper {
    position: relative;
    width: 100%;
    min-height: 100vh;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
    will-change: transform, width, height, top, left;
}

.content__wrapper {
    position: relative;
    z-index: 20;
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.hero-section {
    display: grid;
    /*border: 2px solid yellow;*/
}

.image__wrapper {
    grid-area: 1 / 1;
    max-height: 75vh; /* sets the height of the image  in the hero section */
    display: flex;
    justify-content: center;
    /*border: 2px solid red;*/
}

.image {
    height: 100%;
}

.title__wrapper {
    grid-area: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.title {
    color: var(--color-text);
    font-size: min(6rem, 7vw);
    z-index: 100;
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 30px;
    border-radius: 8px;
    margin-top: 20px;
}

.body {
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 93ch;
    color: var(--color-text);
    column-width: 45ch;
    column-gap: 1.6rem;
    column-count: 2;
}

.article-paragraph {
    margin-bottom: 1.5rem;
    text-align: justify;
    break-inside: avoid;
    page-break-inside: avoid;
}

.article-paragraph:last-child {
    margin-bottom: 0;
}

.button__close {
    align-self: center;
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

.button__close:hover {
    background: rgba(0, 0, 0, 0.7);
}
</style>
