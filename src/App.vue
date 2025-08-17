<template>
    <div class="app-container">
        <main>
            <Grid v-show="cardsVisible" />
            <Article
                :article="articleStore.selectedArticle || null"
                :is-visible="articleVisible"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import Grid from "./components/Grid.vue";
import Article from "./components/Article.vue";

import { onMounted } from "vue";
import { useArticleStore } from "./composables/useArticles";
import { getAnimationManager } from "./composables/useAnimations";

// load composable
const articleStore = useArticleStore();
const { articleVisible, cardsVisible } = getAnimationManager();

// fetch artcles from json file (emulates API call).
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
