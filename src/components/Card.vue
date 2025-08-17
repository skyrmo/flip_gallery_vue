<template>
    <div
        class="article-card"
        @click="$emit('cardClick', article.id)"
        ref="cardRef"
    >
        <div class="article-image-container">
            <img
                ref="imageRef"
                :src="article.image"
                :alt="article.title"
                class="article-image"
            />
        </div>
        <div class="article-content">
            <h2 class="article-title">{{ article.title }}</h2>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Article } from "../types/article";
import { defineProps, ref, onMounted, onUnmounted } from "vue";
import { getAnimationManager } from "../composables/useAnimations";

const { article } = defineProps<{
    article: Article;
}>();

const animationManager = getAnimationManager();

const cardRef = ref<HTMLImageElement>();
const imageRef = ref<HTMLImageElement>();

onMounted(() => {
    const card = cardRef.value;
    const image = imageRef.value;
    if (!card || !image) return;
    animationManager.registerCard(article.id, card, image);
});

onUnmounted(() => {
    animationManager.unregisterCard(article.id);
});
</script>

<style scoped>
.article-card {
    /*border-radius: 8px;*/
    cursor: pointer;
    background: #fee;
    padding: 1rem;
    /* GPU optimization hints */
    will-change: transform, opacity;
    backface-visibility: hidden;
    transform: translateZ(0); /* Forces GPU layer */
    transition: transform 0.2s ease; /* Smooth hover states */
}
.article-card:hover {
    transform: translateZ(0) scale(1.02); /* Maintain GPU layer */
}

.article-card.is-selected {
    background-color: blue;
}

.article-card.isnt-selected {
    background-color: red;
}

.article-image-container {
    overflow: hidden;
    aspect-ratio: 2/3;
}

.article-content {
    padding: 15px;
}

.article-title {
    margin-top: 0;
    font-size: 1.2rem;
}
</style>
