<template>
    <div class="article-grid">
        <Card
            v-for="article in articleStore.articles"
            :key="article.id"
            :article="article"
            @card-click="handleCardClick"
        />
    </div>
</template>

<script setup lang="ts">
import Card from "./Card.vue";
import { nextTick } from "vue";
import { useArticleStore } from "../composables/useArticles";
import { getAnimationManager } from "../composables/useAnimations";

const articleStore = useArticleStore();
const animationManager = getAnimationManager();

async function handleCardClick(clickedCardId: number) {
    await nextTick();

    await animationManager.animateToArticle(clickedCardId);

    // // Animation complete - show article
    // articleStore.selectedArticleId = clickedCardId;
}
</script>

<style scoped>
.article-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

@media (max-width: 1200px) {
    .article-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .article-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .article-grid {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
