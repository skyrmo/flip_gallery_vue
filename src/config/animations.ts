export const ANIMATION_CONFIG = {
    DURATIONS: {
        cardFadeOut: 0.4,
        cardHover: 0.2,
        modalBackgroundTransition: 1.2,
        modalImageTransition: 1.0,
        contentFadeIn: 0.4,
        closeAnimation: 0.8,
        contentFadeOut: 0.2,
    },

    EASING: {
        cardFadeOut: "power2.out",
        cardHover: "power2.out",
        modalTransition: "expo.inOut",
        closeTransition: "power3.out",
        contentFade: "power2.out",
    },

    DELAYS: {
        cardAnimationStart: 0.8,
        modalImageStart: 1.0,
        contentFadeStart: 2.0,
        maxCardDelay: 0.5,
        maxCardDelayMobile: 0.3,
    },

    SCALES: {
        cardHover: 1.02,
        cardFadeOut: 0.98,
    },

    DISTANCES: {
        baseDistanceDesktop: 800,
        baseDistanceMobile: 400,
    },
} as const;
