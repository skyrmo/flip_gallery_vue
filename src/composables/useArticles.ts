import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Article } from "../types/article";

export const useArticleStore = defineStore("article", () => {
    // State
    const articles = ref<Article[]>([]);
    const selectedArticleId = ref<number | null>(null);
    const clickedArticleId = ref<number | null>(null);
    const clickedCardPosition = ref<{ x: number; y: number } | null>(null);

    // Simulate API call
    async function fetchArticles(): Promise<void> {
        const response = await fetch("/articles.json");
        const data = await response.json();
        articles.value = data;
    }

    // Getters
    const clickedArticle = computed(() =>
        articles.value.find(
            (article: Article) => article.id === clickedArticleId.value,
        ),
    );

    // Getters
    const selectedArticle = computed(() =>
        articles.value.find(
            (article: Article) => article.id === selectedArticleId.value,
        ),
    );

    function closeArticle() {
        selectedArticleId.value = null;
        clickedCardPosition.value = null;
    }

    return {
        articles,
        selectedArticleId,
        clickedArticleId,
        clickedCardPosition,
        clickedArticle,
        selectedArticle,
        fetchArticles,
        closeArticle,
    };
});
