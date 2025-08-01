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

        // Calculate position differences
        const translateX = initialPosition.left - finalImageRect.left;
        const translateY = initialPosition.top - finalImageRect.top;

        // Hide content initially
        content.style.opacity = "0";
        closeButton.style.opacity = "0";

        // Apply initial transform to appear at the starting position (INVERT)
        image.style.transformOrigin = "top left";
        image.style.transform = `
            translate(${translateX}px, ${translateY}px)
            scale(${scaleX}, ${scaleY})
        `;

        // Force reflow to ensure the transform is applied
        imageContainer.offsetHeight;

        // PLAY: Animate to final position
        image.style.transition =
            "transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)";
        image.style.transform = "translate(0, 0) scale(1, 1)";

        // Fade in content after image animation starts
        setTimeout(() => {
            content.style.transition = "opacity 0.4s ease";
            content.style.opacity = "1";

            closeButton.style.transition = "opacity 0.4s ease";
            closeButton.style.opacity = "1";
        }, 1000);

        // Animation complete
        setTimeout(() => {
            // Clean up transform styles after animation
            imageContainer.style.transition = "";
            imageContainer.style.transform = "";
        }, 1001);
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
    articleStore.closeArticle();
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
