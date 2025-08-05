<template>
    <div class="article-grid">
        <ArticleCard
            v-for="article in articleStore.articles"
            :key="article.id"
            :article="article"
            @click="handleArticleClick"
        />
    </div>
</template>

<script setup lang="ts">
import ArticleCard from "./ArticleCard.vue";
import { useArticleStore } from "../composables/useArticles";
import type { Article } from "../types/article";

const articleStore = useArticleStore();

// Handle click on article card
function handleArticleClick(article: Article, event: MouseEvent) {
    articleStore.setAnimating(true);
    // Get the clicked card's center position
    const target = event.currentTarget as HTMLElement;

    const cardElement = target as HTMLDivElement;

    const imageElement = cardElement.querySelector(
        ".article-image",
    ) as HTMLImageElement;

    if (imageElement && cardElement) {
        // Capture image position at click time
        const imageRect = imageElement.getBoundingClientRect();
        article.cardImagePosition = {
            top: imageRect.top,
            left: imageRect.left,
            width: imageRect.width,
            height: imageRect.height,
            imageHeight: imageElement.offsetHeight,
        };

        // Capture card background position at click time
        const cardRect = cardElement.getBoundingClientRect();
        article.cardBackgroundPosition = {
            top: cardRect.top,
            left: cardRect.left,
            width: cardRect.width,
            height: cardRect.height,
            backgroundHeight: cardElement.offsetHeight,
        };
    }

    // Get the clicked card's center position
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Store the clicked card position
    articleStore.clickedCardPosition = { x: centerX, y: centerY };
    articleStore.clickedArticleId = article.id;
}
</script>

<style scoped>
.article-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

@media (max-width: 768px) {
    .article-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
}

@media (max-width: 480px) {
    .article-grid {
        grid-template-columns: 1fr;
    }
}
</style>
