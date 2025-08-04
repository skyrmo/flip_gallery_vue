<template>
    <div
        ref="cardRef"
        class="article-card"
        :class="cardClasses"
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
import { defineProps, onMounted, ref, computed, watch } from "vue";
import type { Article } from "../types/article";
import { useArticleStore } from "../composables/useArticles";
import { gsap } from "gsap";

const props = defineProps<{
    article: Article;
}>();

const articleStore = useArticleStore();

// const cardRef = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();
const cardRef = ref<HTMLImageElement>();

// Computed class based on store state
const cardClasses = computed(() => ({
    "is-selected": articleStore.clickedArticleId === props.article.id,
    "isnt-selected":
        articleStore.clickedArticleId &&
        articleStore.clickedArticleId !== props.article.id,
}));

// Watch for changes in the clickedArticleId
watch(
    () => articleStore.clickedArticleId,
    (newValue) => {
        if (!cardRef.value) return;

        if (articleStore.clickedArticleId == props.article.id) return;

        // Create GSAP timeline
        let currentTimeline = gsap.timeline({
            onComplete: () => {
                articleStore.selectedArticleId = articleStore.clickedArticleId;
            },
        });

        // Animate card to fade out
        currentTimeline.to(
            cardRef.value,
            {
                opacity: 0,
                duration: 0.5,
                ease: "power3.out",
            },
            0,
        );
    },
);

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

.article-card.is-selected {
    background-color: blue;
}

.article-card.isnt-selected {
    background-color: red;
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
