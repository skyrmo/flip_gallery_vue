<template>
    <div class="article-grid">
        <Card
            v-for="article in articleStore.articles"
            :key="article.id"
            :article="article"
            @click="handleArticleClick"
        />
    </div>
</template>

<script setup lang="ts">
import Card from "./Card.vue";
import { useArticleStore } from "../composables/useArticles";
import { useCardStore } from "../composables/useCards";
import type { Article } from "../types/article";

const articleStore = useArticleStore();
const cardStore = useCardStore();

// // Handle click on article card
function handleArticleClick(article: Article, event: MouseEvent) {}
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
