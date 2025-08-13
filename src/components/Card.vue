<template>
    <div
        class="article-card"
        @click="$emit('click', article, $event)"
        ref="cardRef"
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
import { defineProps, ref, watch } from "vue";
// import { useArticleStore } from "../composables/useArticles";
import { useCardStore } from "../composables/useCards";

// import { gsap } from "gsap";
import type { Article } from "../types/article";
import { onMounted } from "vue";

const props = defineProps<{
    article: Article;
}>();

// const articleStore = useArticleStore();
const cardStore = useCardStore();

// const imageRef = ref<HTMLImageElement>();
const cardRef = ref<HTMLImageElement>();
const imageRef = ref<HTMLImageElement>();

onMounted(() => {
    const card = cardRef.value;
    const image = imageRef.value;

    if (!card || !image) return;
    cardStore.addCard(props.article.id, card);
    cardStore.addImage(props.article.id, image);
});

// // Watch for changes in the selectedArticleId
// watch(
//     () => articleStore.selectedArticleId,
//     () => {
//         let card = cardRef.value;

//         if (articleStore.selectedArticleId == props.article.id) {
//             return;
//         }

//         // Calculate delay based on distance from clicked card
//         let delay = 0;

//         if (articleStore.clickedCardPosition && card) {
//             const cardRect = card.getBoundingClientRect();
//             const cardCenterX = cardRect.left + cardRect.width / 2;
//             const cardCenterY = cardRect.top + cardRect.height / 2;

//             const clickedPos = articleStore.clickedCardPosition;
//             const distance = Math.sqrt(
//                 Math.pow(cardCenterX - clickedPos.x, 2) +
//                     Math.pow(cardCenterY - clickedPos.y, 2),
//             );

//             // Convert distance to delay with responsive calculation
//             // Adjust base distance based on viewport size for better mobile experience
//             const viewportWidth = window.innerWidth;
//             const baseDistance = viewportWidth < 768 ? 400 : 800;
//             const maxDelay = viewportWidth < 768 ? 0.3 : 0.5;

//             const normalizedDistance = Math.min(distance / baseDistance, 2);
//             delay = Math.pow(normalizedDistance, 1.2) * maxDelay;
//         }

//         // // Disable scrolling when animation starts
//         // articleStore.setAnimating(true);

//         // Create GSAP timeline
//         let currentTimeline = gsap.timeline({
//             onComplete: () => {
//                 articleStore.selectedArticleId = articleStore.clickedArticleId;
//             },
//         });

//         // Animate card to fade out with distance-based delay
//         if (card) {
//             currentTimeline.to(card, {
//                 opacity: 0,
//                 duration: 0.5,
//                 ease: "power3.out",
//                 delay: delay,
//             });
//         }
//     },
// );

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
