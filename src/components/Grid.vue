<template>
    <div class="article-grid">
        <Card
            v-for="[key, article] in articles"
            :key="key"
            :article="article"
            @card-click="handleCardClick"
        />
    </div>
</template>

<script setup lang="ts">
import Card from "./Card.vue";
import { nextTick } from "vue";
import { getAppStateManager } from "../composables/useAppState";

let { articles, selectedArticleId } = getAppStateManager();

async function handleCardClick(clickedCardId: number) {
    await nextTick();

    selectedArticleId.value = clickedCardId;
}
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
