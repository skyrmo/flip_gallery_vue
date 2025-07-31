<template>
    <div class="app-container">
        <header>
            <h1>Article Explorer</h1>
        </header>

        <main>
            <ArticleGrid />
            <!-- <ArticleView /> -->
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ArticleGrid from "./components/ArticleGrid.vue";
// import ArticleView from "./components/ArticleView.vue";
import { useArticleStore } from "./composables/useArticles";

const articleStore = useArticleStore();

onMounted(() => {
    articleStore.fetchArticles();
});
</script>

<style scoped></style>
