<template>
    <div class="article-view" ref="articleViewRef">
        <div class="article-image-container" ref="imageContainerRef">
            <img :src="article.image" alt="Article Image" />
        </div>

        <div class="article-content" ref="contentRef">
            <button class="close-button" @click="closeArticle">
                <span>&times;</span>
            </button>
            <h1 class="article-title">{{ article.title }}</h1>
            <div class="article-body">
                {{ article.content }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useArticleStore } from "../composables/useArticles";

const articleStore = useArticleStore();
const article = computed(() => articleStore.selectedArticle);

// console.log(article.value);
// const isAnimating = ref(true);

// Refs for DOM elements
// const articleViewRef = ref(null);
// const imageContainerRef = ref(null);
// const contentRef = ref(null);

// FLIP Animation implementation
onMounted(() => {
    if (!articleStore.initialPosition) return;

    // const initialPos = articleStore.initialPosition;
    // const imageContainer = imageContainerRef.value;
    // const content = contentRef.value;

    // // Set initial transform for the image container (FIRST)
    // const viewportHeight = window.innerHeight;
    // const viewportWidth = window.innerWidth;

    // // Calculate scale factors
    // const scaleX = initialPos.width / viewportWidth;
    // const scaleY = initialPos.imageHeight / viewportHeight;

    // // Calculate position differences
    // const translateX = initialPos.left;
    // const translateY = initialPos.top;

    // // Apply the initial transform (INVERT)
    // imageContainer.style.transform = `
    // translate(${translateX}px, ${translateY}px)
    // scale(${scaleX}, ${scaleY})
    // `;

    // // Hide content initially
    // content.style.opacity = "0";

    // // Force reflow
    // imageContainer.offsetHeight;

    // // Play the animation (PLAY)
    // imageContainer.style.transition =
    //     "transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)";
    // imageContainer.style.transform = "translate(0, 0) scale(1, 1)";

    // // Fade in content
    // setTimeout(() => {
    //     content.style.transition = "opacity 0.3s ease";
    //     content.style.opacity = "1";
    //     isAnimating.value = false;
    // }, 300);
});

// // Clean up
// onBeforeUnmount(() => {
//     // Reset animation states
//     // isAnimating.value = false;
// });

// Close article and animate back
function closeArticle() {
    console.log("Close me!");
    articleStore.closeArticle();
}
</script>

<style scoped>
.article-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    overflow-y: auto;
    background: white;
}

.article-image-container {
    position: relative;
    width: 100%;
    height: 50vh;
    background-size: cover;
    background-position: center;
    transform-origin: top left;
    will-change: transform;
}

.article-content {
    position: relative;
    padding: 30px;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 15px 15px 0 0;
    margin-top: -20px;
    will-change: opacity;
}

.article-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
}

.article-body {
    font-size: 1.1rem;
    line-height: 1.6;
}

.close-button {
    position: absolute;
    top: 20px;
    right: 20px;
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
    transition: background 0.3s ease;
}

.close-button:hover {
    background: rgba(0, 0, 0, 0.7);
}

/* Ensure no scroll on body when article is open */
.is-animating {
    overflow: hidden;
}
</style>
