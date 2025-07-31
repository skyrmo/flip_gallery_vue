import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useArticleStore = defineStore("article", () => {
    // State
    const articles = ref([]);
    // const selectedArticleId = ref(null);
    // const isTransitioning = ref(false);
    // const initialPosition = ref(null);

    // Sample article data (in a real app, this would come from an API)
    const sampleArticles = [
        {
            id: 1,
            title: "Exploring Vue 3 Features",
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.",
            image: "./1.jpg",
        },
        {
            id: 2,
            title: "Mastering CSS Grid Layouts",
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.",
            image: "./2.jpg",
        },
        {
            id: 3,
            title: "Why use Vue over React",
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.",
            image: "./3.jpg",
        },
        {
            id: 4,
            title: "Master the sub-grid in CSS",
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.",
            image: "./4.jpg",
        },
        // Add more sample articles as needed
    ];

    // // Getters
    // const selectedArticle = computed(() =>
    //     articles.value.find(
    //         (article) => article.id === selectedArticleId.value,
    //     ),
    // );

    // Actions
    function fetchArticles() {
        // Simulate API call
        articles.value = sampleArticles;
    }

    // function selectArticle(id, position = null) {
    //     // Store the initial position for the FLIP animation
    //     initialPosition.value = position;
    //     isTransitioning.value = true;
    //     selectedArticleId.value = id;
    // }

    // function closeArticle() {
    //     isTransitioning.value = true;
    //     selectedArticleId.value = null;
    //     // Reset after animation completes
    //     setTimeout(() => {
    //         isTransitioning.value = false;
    //         initialPosition.value = null;
    //     }, 500); // Match this with your animation duration
    // }

    return {
        articles,
        // selectedArticleId,
        // selectedArticle,
        // isTransitioning,
        // initialPosition,
        fetchArticles,
        // selectArticle,
        // closeArticle,
    };
});
