import { ref, computed } from "vue";
import type { Card, Article, ModalElements } from "../types/appTypes";

const useAppStateManager = () => {
    // UI Visibility State
    const modalVisible = ref<boolean>(false);
    const cardsVisible = ref<boolean>(true);

    const articles = ref<Map<number, Article>>(new Map());
    const cards = ref<Map<number, Card>>(new Map());

    const modalElements = ref<ModalElements | null>(null);

    const selectedArticleId = ref<number | null>(null);

    const clickedCard = computed(() => {
        if (!selectedArticleId.value) {
            return null;
        }

        return cards.value.get(selectedArticleId.value);
    });

    const selectedArticle = computed(() => {
        if (!selectedArticleId.value) {
            return null;
        }

        return articles.value.get(selectedArticleId.value);
    });

    function registerCard(id: number, card: Card) {
        cards.value.set(id, card);
    }
    // function unregisterCard(id: number) {
    //     registeredCards.value.delete(id);
    // }

    // Simulate API call
    async function fetchArticles() {
        const response = await fetch("/articles.json");
        const data = await response.json();

        for (let article of data) {
            articles.value.set(article.id, article);
        }
    }

    return {
        modalVisible,
        cardsVisible,
        selectedArticleId,
        cards,
        articles,
        modalElements,

        // functions
        registerCard,
        fetchArticles,

        // computed
        clickedCard,
        selectedArticle,
    };
};

let appStateInstance: ReturnType<typeof useAppStateManager> | null = null;

export function getAppStateManager() {
    if (!appStateInstance) {
        appStateInstance = useAppStateManager();
    }
    return appStateInstance;
}
