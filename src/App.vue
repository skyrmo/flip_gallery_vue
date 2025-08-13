<template>
    <div class="app-container">
        <main>
            <Grid v-show="!cardStore.clickedCardId" />
            <Article
                v-show="articleStore.selectedArticleId"
                :article="articleStore.selectedArticle || null"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import Grid from "./components/Grid.vue";
import Article from "./components/Article.vue";

import { onMounted } from "vue";
import { useArticleStore } from "./composables/useArticles";
import { useCardStore } from "./composables/useCards";

// load composable
const articleStore = useArticleStore();
const cardStore = useCardStore();

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
