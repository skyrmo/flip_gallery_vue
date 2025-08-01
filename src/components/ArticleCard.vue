<template>
    <div
        ref="cardRef"
        class="article-card"
        @click="$emit('click', article, $event)"
    >
        <div class="article-image-container">
            <img
                ref="imageRef"
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

<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import type { Article } from "../types/article";

const props = defineProps<{
    article: Article;
}>();

// const cardRef = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

onMounted(() => {
    const image = imageRef.value;
    if (image) {
        // Wait for image to load
        image.addEventListener("load", () => {
            setImagePosition(image);
        });
    }
});

function setImagePosition(image: HTMLImageElement) {
    const rect = image.getBoundingClientRect();
    const imageHeight = image.offsetHeight;

    props.article.initialPosition = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        imageHeight,
    };
}

defineEmits(["click"]);
</script>

<style scoped>
.article-card {
    border-radius: 8px;
    cursor: pointer;
    background: #fee;
    padding: 1rem;
}

.article-image-container {
    overflow: hidden;
    aspect-ratio: 2/3;
}

.article-content {
    padding: 15px;
}

.article-title {
    margin-top: 0;
    font-size: 1.2rem;
}
</style>
