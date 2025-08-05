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
import { defineProps, onMounted, ref, watch } from "vue";
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

// Watch for changes in the selectedArticleId
watch(
    () => articleStore.clickedArticleId,
    () => {
        let card = cardRef.value;

        if (articleStore.clickedArticleId == props.article.id) {
            return;
        }

        // Calculate delay based on distance from clicked card
        let delay = 0;
        if (articleStore.clickedCardPosition && card) {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;

            const clickedPos = articleStore.clickedCardPosition;
            const distance = Math.sqrt(
                Math.pow(cardCenterX - clickedPos.x, 2) +
                    Math.pow(cardCenterY - clickedPos.y, 2),
            );

            // Convert distance to delay with responsive calculation
            // Adjust base distance based on viewport size for better mobile experience
            const viewportWidth = window.innerWidth;
            const baseDistance = viewportWidth < 768 ? 400 : 800;
            const maxDelay = viewportWidth < 768 ? 0.3 : 0.5;

            const normalizedDistance = Math.min(distance / baseDistance, 2);
            delay = Math.pow(normalizedDistance, 1.2) * maxDelay;
        }

        // Create GSAP timeline
        let currentTimeline = gsap.timeline({
            onComplete: () => {
                articleStore.selectedArticleId = articleStore.clickedArticleId;
            },
        });

        // Animate card to fade out with distance-based delay
        if (card) {
            currentTimeline.to(card, {
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
                delay: delay,
            });
        }
    },
);

// Watch for when article is closed to fade cards back in
watch(
    () => articleStore.selectedArticleId,
    (newValue, oldValue) => {
        let card = cardRef.value;

        // If article was closed (selectedArticleId became null)
        if (oldValue !== null && newValue === null && card) {
            // Reset clickedArticleId first
            articleStore.clickedArticleId = null;

            // Fade card back in
            gsap.to(card, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
                delay: Math.random() * 0.3, // Small random delay for staggered appearance
            });
        }
    },
);

// onMounted(() => {});

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
