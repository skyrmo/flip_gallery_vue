export const ANIMATION_CONFIG = {
    DURATIONS: {
        cardFadeOut: 0.8, // time for card to fade out
        modalBackgroundTransition: 1.2, // modal bg to go full sacreen
        modalImageTransition: 1.0, // model image to go full screen
        contentFadeIn: 0.4, //  the modal text to fade in
        contentFadeOut: 0.4, // the modal text to fade in
        closeAnimation: 0.8, // modal bg AND image use thgois to animate back to card
    },

    EASING: {
        cardFadeOut: "expo.Out",
        modalTransition: "expo.inOut",
        closeTransition: "expo.inOut",
        contentFade: "expo.Out", // Updated to match what was in the code
    },

    // delays and offsets for animation start
    DELAYS: {
        cardAnimationStart: 0.3,
        modalImageStart: 0.6,
        contentFadeStart: 1.5,
        maxCardDelay: 0.5,
        maxCardDelayMobile: 0.3,
    },

    // amount of size increase for elements
    SCALES: {
        cardHover: 1.02,
        cardFadeOut: 0.5,
    },

    // these adjust the rate of expo delay for smaller/ larger screens
    DISTANCES: {
        baseDistanceDesktop: 800,
        baseDistanceMobile: 400,
    },
} as const;
