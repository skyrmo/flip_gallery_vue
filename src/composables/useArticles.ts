import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Article } from "../types/article";

export const useArticleStore = defineStore("article", () => {
    const articles = ref<Article[]>([]);
    const selectedArticleId = ref<number | null>(null);

    // Simulate API call
    async function fetchArticles() {
        const response = await fetch("/articles.json");
        const data = await response.json();
        articles.value = await data;
    }

    // Getters
    const selectedArticle = computed(() =>
        articles.value.find(
            (article: Article) => article.id === selectedArticleId.value,
        ),
    );

    return {
        articles,
        selectedArticleId,
        selectedArticle,
        fetchArticles,
    };
});
