<template>
    <div class="article-card" @click="$emit('click', article, $event)">
        <div class="article-image-container">
            <img
                :src="article.image"
                :alt="article.title"
                class="article-image"
            />
        </div>
        <div class="article-content">
            <h2 class="article-title">{{ article.title }}</h2>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
    article: {
        type: Object,
        required: true,
    },
});

defineEmits(["click"]);
</script>

<style scoped>
.article-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
    cursor: pointer;
    background: white;
}

.article-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.article-image-container {
    overflow: hidden;
    border-bottom: 1px solid #eee;
}

.article-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.article-card:hover .article-image {
    transform: scale(1.05);
}

.article-content {
    padding: 15px;
}

.article-title {
    margin-top: 0;
    font-size: 1.2rem;
}
</style>
