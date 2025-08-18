<template>
    <div class="app-container">
        <main>
<<<<<<< HEAD
            <Grid />
            <Article
                :article="articleStore.selectedArticle || null"
                :is-visible="!!articleStore.selectedArticle"
=======
            <Grid v-show="cardsVisible" />
            <Modal
                :article="selectedArticle || null"
                :is-visible="modalVisible"
>>>>>>> different_approach
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import Grid from "./components/Grid.vue";
import Modal from "./components/Modal.vue";

<<<<<<< HEAD
import { onMounted, onUnmounted } from "vue";
import { useArticleStore } from "./composables/useArticles";
import { getAnimationManager } from "./composables/useAnimations";

// load composable
const articleStore = useArticleStore();
const animationManager = getAnimationManager();
=======
import { onMounted } from "vue";
import { getAppStateManager } from "./composables/useAppState";

const { fetchArticles, cardsVisible, selectedArticle, modalVisible } =
    getAppStateManager();
>>>>>>> different_approach

// fetch artcles from json file (emulates API call).
onMounted(async () => {
    await fetchArticles();
});
// Cleanup on unmount
onUnmounted(() => {
    animationManager.cleanup();
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
