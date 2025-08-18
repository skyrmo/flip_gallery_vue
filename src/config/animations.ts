export const ANIMATION_CONFIG = {
    DURATIONS: {
        cardFadeOut: 0.35,
        cardHover: 0.2,
        modalBackgroundTransition: 1.2,
        modalImageTransition: 1.0,
        contentFadeIn: 0.4,
        closeAnimation: 0.8,
        contentFadeOut: 0.2,
    },

    EASING: {
        cardFadeOut: "expo.inOut",
        cardHover: "power2.out",
        modalTransition: "expo.inOut",
        closeTransition: "expo.inOut",
        contentFade: "power2.out",
    },

    // delays and offsets for animation start
    DELAYS: {
        cardAnimationStart: 0.4,
        modalImageStart: 0.6,
        contentFadeStart: 1.5,
        maxCardDelay: 0.5,
        maxCardDelayMobile: 0.3,
    },

    // amount of size increase for elements
    SCALES: {
        cardHover: 1.02,
        cardFadeOut: 1,
    },

    // these adjust the rate of expo delay for smaller/ larger screens
    DISTANCES: {
        baseDistanceDesktop: 800,
        baseDistanceMobile: 400,
    },
} as const;
