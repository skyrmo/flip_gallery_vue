import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Article } from "../types/article";

export const useArticleStore = defineStore("article", () => {
    const articles = ref<Article[]>([]);

    const selectedArticleId = ref<number | null>(null);

    // Simulate API call
    async function fetchArticles(): Promise<void> {
        const response = await fetch("/articles.json");
        const data = await response.json();
        articles.value = await data;
        console.log(articles.value);
    }

    // Getters
    const selectedArticle = computed(() =>
        articles.value.find(
            (article: Article) => article.id === selectedArticleId.value,
        ),
    );

    // // used to enable and disable scroll during animation
    // function setAnimating(animating: boolean) {
    //     if (animating) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "";
    //     }
    // }

    return {
        articles,
        selectedArticleId,
        selectedArticle,
        fetchArticles,
    };
});
