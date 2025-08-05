<template>
    <div class="app-container">
        <!-- <header>
            <h1>Owain's Blog</h1>
        </header> -->

        <main>
            <ArticleGrid v-if="!articleStore.selectedArticleId" />
            <ArticleView
                v-else
                :article="articleStore.selectedArticle || null"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import ArticleGrid from "./components/ArticleGrid.vue";
import ArticleView from "./components/ArticleView.vue";
import { onMounted } from "vue";
import { useArticleStore } from "./composables/useArticles";

// articles composable
const articleStore = useArticleStore();

// fetch artcles from json file
onMounted(async () => {
    await articleStore.fetchArticles();
});
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100vh;
    width: 100vw;
}

header {
    background-color: #333;
    color: #fff;
    padding: 16px;
}

main {
    width: 100%;
}
</style>
