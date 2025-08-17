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
import { getAnimationManager } from "../composables/useAnimations";
import { useArticleStore } from "../composables/useArticles";

const { article } = defineProps<{
    article: Article | null;
}>();

// Refs for DOM elements
const contentRef = ref<HTMLElement>();
const titleRef = ref<HTMLElement>();
const closeButtonRef = ref<HTMLElement>();
const articleImageRef = ref<HTMLImageElement>();
const articleBackgroundRef = ref<HTMLDivElement>();
const articleWrapperRef = ref<HTMLElement>();

const animationManager = getAnimationManager();
const articleStore = useArticleStore();

// Watch for article changes and trigger FLIP animation
watch(
    () => article,
    async () => {
        if (article && animationManager.clickedCardInfo) {
            await nextTick();

            // Gather all DOM elements
            const articleElements = {
                wrapper: articleWrapperRef.value!,
                background: articleBackgroundRef.value!,
                image: articleImageRef.value!,
                content: contentRef.value!,
                closeButton: closeButtonRef.value!,
                title: titleRef.value!,
            };

            await animationManager.startFlipAnimationIn(articleElements);
        }
    },
    { immediate: true },
);

// Close article and animate back
async function closeArticle() {
    // Gather all DOM elements
    const articleElements = {
        wrapper: articleWrapperRef.value!,
        background: articleBackgroundRef.value!,
        image: articleImageRef.value!,
        content: contentRef.value!,
        closeButton: closeButtonRef.value!,
        title: titleRef.value!,
    };

    // Animation manager handles reverse FLIP + cards back
    await animationManager.startFlipAnimationOut(articleElements);

    // Clear article after animations complete
    articleStore.selectedArticleId = null;

    // Second: Animate other cards back in
    await animationManager.animateCardsIn();
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
    will-change: transform, width, height, top, left;
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
