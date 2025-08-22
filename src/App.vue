<template>
    <div class="app-container">
        <main>
            <Grid v-show="cardsVisible" />
            <Modal
                :article="selectedArticle || null"
                :is-visible="modalVisible"
            />
        </main>
    </div>
</template>

<script setup lang="ts">
import Grid from "./components/Grid.vue";
import Modal from "./components/Modal.vue";

import { onMounted } from "vue";
import { getAppStateManager } from "./composables/useAppState";

const { fetchArticles, cardsVisible, selectedArticle, modalVisible } =
    getAppStateManager();

// fetch artcles from json file (emulates API call).
onMounted(async () => {
    await fetchArticles();
});
</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100vh;
    width: 100vw;
    padding: 5rem;
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
