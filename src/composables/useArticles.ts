import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Article } from "../types/article";

export const useArticleStore = defineStore("article", () => {
    // State
    const articles = ref<Article[]>([]);
    const selectedArticleId = ref<number | null>(null);

    // Simulate API call
    async function fetchArticles(): Promise<void> {
        const response = await fetch("/articles.json");
        const data = await response.json();
        articles.value = data;
    }

    function selectArticle(id: number) {
        selectedArticleId.value = id;
    }

    // Getters
    const selectedArticle = computed(() =>
        articles.value.find(
            (article: Article) => article.id === selectedArticleId.value,
        ),
    );

    function closeArticle() {
        selectedArticleId.value = null;
    }

    return {
        articles,
        selectedArticleId,
        selectedArticle,
        fetchArticles,
        selectArticle,
        closeArticle,
    };
});
