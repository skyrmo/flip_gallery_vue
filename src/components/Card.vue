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
import type { Article } from "../types/appTypes";
import { defineProps, ref, onMounted, onUnmounted } from "vue";
import { getAppStateManager } from "../composables/useAppState";

const { article } = defineProps<{
    article: Article;
}>();

const { registerCard } = getAppStateManager();

const cardRef = ref<HTMLImageElement>();
const imageRef = ref<HTMLImageElement>();

onMounted(() => {
    const cardEl = cardRef.value;
    const imageEl = imageRef.value;

    if (!cardEl || !imageEl || !article.id) return;

    const card = {
        id: article.id,
        elements: {
            background: cardEl,
            image: imageEl,
        },
    };

    registerCard(article.id, card);
});

onUnmounted(() => {
    // animationManager.unregisterCard(article.id);
});
</script>

<style scoped>
.article-card {
    cursor: pointer;
    background: #fee;
    padding: 2.5rem;

    will-change: transform, opacity;
    backface-visibility: hidden;
}
/*.article-card:hover {
}*/

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
