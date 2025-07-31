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

<script setup>
import { onMounted, onUnmounted } from "vue";
import ArticleCard from "./ArticleCard.vue";
import { useArticleStore } from "../composables/useArticles";

const articleStore = useArticleStore();

// // Handle click on article card
// function handleArticleClick(article, event) {
//     // Get the bounding rectangle of the clicked element for FLIP animation
//     const cardElement = event.currentTarget;
//     const rect = cardElement.getBoundingClientRect();

//     // Store initial position for animation
//     const initialPosition = {
//         top: rect.top,
//         left: rect.left,
//         width: rect.width,
//         height: rect.height,
//         imageHeight: cardElement.querySelector(".article-image").offsetHeight,
//     };

//     // Select the article in the store, passing the initial position
//     articleStore.selectArticle(article.id, initialPosition);
// }
</script>

<style scoped>
.article-grid {
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
