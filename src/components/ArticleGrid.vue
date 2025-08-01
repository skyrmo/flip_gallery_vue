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
function handleArticleClick(article: Article) {
    articleStore.selectArticle(article.id);
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

/* Responsive adjustments */
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
