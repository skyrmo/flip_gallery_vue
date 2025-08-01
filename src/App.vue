<template>
    <div class="app-container">
        <header>
            <h1>Article Explorer</h1>
        </header>

        <main>
            <ArticleGrid v-if="!articleStore.selectedArticleId" />
            <ArticleView v-else :article="articleStore.selectedArticle" />
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ArticleGrid from "./components/ArticleGrid.vue";
import ArticleView from "./components/ArticleView.vue";
import { useArticleStore } from "./composables/useArticles";

// articles composable
const articleStore = useArticleStore();

// fetch artcles from json file
onMounted(async () => {
    await articleStore.fetchArticles();
});
</script>

<style scoped></style>
