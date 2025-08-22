You are a senior developer and you are assisting me, a junior developer, with a problem that i would like to fix. I would like to explore many options and point out anything that i might be missing. I would like to use modern vue practices, specifically composition api, and i would like to use clean code.

# GSAP Animations Analysis

## GridItem Class Animations

### 1. Background Scale Animation (Hover Effect)

**Location:** `toggleAnimationOnHover()` method

```javascript
TweenMax.to(this.DOM.bg, 1, {
    ease: Expo.easeOut,
    scale: type === "mouseenter" ? 1.15 : 1,
});
```

- **Target:** Background element (`.grid__item-bg`)
- **Duration:** 1 second
- **Easing:** Expo.easeOut (exponential ease out - starts fast, slows dramatically)
- **Effect:** Scales to 115% on mouseenter, back to 100% on mouseleave
- **Purpose:** Creates a subtle zoom effect on hover

### 2. Number Letters Animation (First Phase - Hide)

**Location:** `toggleAnimationOnHover()` method

```javascript
TweenMax.to(letter, 0.2, {
    ease: Quad.easeIn,
    delay: pos * 0.1,
    y: type === "mouseenter" ? "-50%" : "50%",
    opacity: 0,
    onComplete: () => {
        /* Second phase animation */
    },
});
```

- **Target:** Individual letter spans in the number
- **Duration:** 0.2 seconds
- **Easing:** Quad.easeIn (quadratic ease in - starts slow, accelerates)
- **Delay:** Staggered by 0.1 seconds per letter position
- **Effect:** Moves letters up 50% (mouseenter) or down 50% (mouseleave) while fading out
- **Purpose:** Creates a typewriter-like letter animation effect

### 3. Number Letters Animation (Second Phase - Show)

**Location:** `toggleAnimationOnHover()` method (inside onComplete)

```javascript
TweenMax.to(letter, type === "mouseenter" ? 0.6 : 1, {
    ease: type === "mouseenter" ? Expo.easeOut : Elastic.easeOut.config(1, 0.4),
    startAt: { y: type === "mouseenter" ? "70%" : "-70%", opacity: 0 },
    y: "0%",
    opacity: 1,
});
```

- **Target:** Individual letter spans in the number
- **Duration:** 0.6 seconds (mouseenter) or 1 second (mouseleave)
- **Easing:**
    - Mouseenter: Expo.easeOut (exponential ease out)
    - Mouseleave: Elastic.easeOut with config(1,0.4) (elastic bounce with amplitude 1, period 0.4)
- **StartAt:** Positions letters at 70% down (mouseenter) or -70% up (mouseleave)
- **Effect:** Animates letters back to original position with fade in
- **Purpose:** Completes the letter reveal animation with different bounce effects

### 4. Tilt Animation (Mouse Movement)

**Location:** `tilt()` method

```javascript
TweenMax.to(this.DOM.tilt[key], 2, {
    ease: Expo.easeOut,
    x: ((t.x[1] - t.x[0]) / bounds.width) * relmousepos.x + t.x[0],
    y: ((t.y[1] - t.y[0]) / bounds.height) * relmousepos.y + t.y[0],
});
```

- **Target:** Tiltable elements (image, title, number)
- **Duration:** 2 seconds
- **Easing:** Expo.easeOut
- **Effect:** Moves elements based on mouse position relative to the grid item
- **Translation Ranges:**
    - Title: x: [-8,8], y: [4,-4]
    - Number: x: [-5,5], y: [-10,10]
    - Image: x: [-15,15], y: [-10,10]
- **Purpose:** Creates parallax-like tilt effect following mouse movement

### 5. Reset Tilt Animation

**Location:** `resetTilt()` method

```javascript
TweenMax.to(this.DOM.tilt[key], 2, {
    ease: Elastic.easeOut.config(1, 0.4),
    x: 0,
    y: 0,
});
```

- **Target:** All tiltable elements
- **Duration:** 2 seconds
- **Easing:** Elastic.easeOut.config(1,0.4) (bouncy return)
- **Effect:** Returns elements to center position (0,0)
- **Purpose:** Smooth elastic return when mouse leaves

### 6. Hide/Show Item Image

**Location:** `toggle()` method

```javascript
TweenMax.to(this.DOM.tilt.img, withAnimation ? 0.8 : 0, {
    ease: Expo.easeInOut,
    delay: !withAnimation ? 0 : show ? 0.15 : 0,
    scale: show ? 1 : 0,
    opacity: show ? 1 : 0,
});
```

- **Target:** Grid item image
- **Duration:** 0.8 seconds (if animated) or 0 (instant)
- **Easing:** Expo.easeInOut
- **Delay:** 0.15 seconds when showing, no delay when hiding
- **Effect:** Scales and fades image in/out
- **Purpose:** Hide/show animation for grid reorganization

### 7. Hide/Show Item Background

**Location:** `toggle()` method

```javascript
TweenMax.to(this.DOM.bg, withAnimation ? 0.8 : 0, {
    ease: Expo.easeInOut,
    delay: !withAnimation ? 0 : show ? 0 : 0.15,
    scale: show ? 1 : 0,
    opacity: show ? 1 : 0,
});
```

- **Target:** Grid item background
- **Duration:** 0.8 seconds (if animated)
- **Easing:** Expo.easeInOut
- **Delay:** 0.15 seconds when hiding, no delay when showing
- **Effect:** Scales and fades background in/out
- **Purpose:** Coordinated hide/show with slight timing offset from image

### 8. Text Elements Animation

**Location:** `toggleTexts()` method

```javascript
TweenMax.to(
    [this.DOM.tilt.title, this.DOM.tilt.number],
    !withAnimation ? 0 : show ? 1 : 0.5,
    {
        ease: show ? Expo.easeOut : Quart.easeIn,
        delay: !withAnimation ? 0 : delay,
        y: show ? 0 : 20,
        opacity: show ? 1 : 0,
    },
);
```

- **Target:** Title and number elements (array target)
- **Duration:** 1 second (show) or 0.5 seconds (hide)
- **Easing:**
    - Show: Expo.easeOut
    - Hide: Quart.easeIn (quartic ease in)
- **Delay:** Variable delay parameter
- **Effect:** Moves text 20px down and fades out when hiding, reverse when showing
- **Purpose:** Smooth text reveal/hide animations

## Content Class Animations

### 9. Title Letters Animation

**Location:** `toggle()` method in Content class

```javascript
TweenMax.to(letter, !withAnimation ? 0 : show ? 0.6 : 0.3, {
    ease: show ? Back.easeOut : Quart.easeIn,
    delay: !withAnimation
        ? 0
        : show
          ? pos * 0.05
          : (this.titleLettersTotal - pos - 1) * 0.04,
    startAt: show ? { y: "50%", opacity: 0 } : null,
    y: show ? "0%" : "50%",
    opacity: show ? 1 : 0,
});
```

- **Target:** Individual letters in content title
- **Duration:** 0.6 seconds (show) or 0.3 seconds (hide)
- **Easing:**
    - Show: Back.easeOut (overshoots then settles)
    - Hide: Quart.easeIn
- **Delay:**
    - Show: 0.05 seconds per letter position (left to right)
    - Hide: 0.04 seconds per reverse position (right to left)
- **StartAt:** Positions letters 50% down when showing
- **Effect:** Staggered letter animation with overshoot effect
- **Purpose:** Dramatic title reveal with bouncy letter animation

## Grid Class Animations

### 10. Background Expansion (Item Opening)

**Location:** `openItem()` method

```javascript
TweenMax.to(item.DOM.bg, 1.2, {
    ease: Expo.easeInOut,
    delay: 0.4,
    x: winsize.width / 2 - (itemDim.left + itemDim.width / 2),
    y: winsize.height / 2 - (itemDim.top + itemDim.height / 2),
    scaleX: d / itemDim.width,
    scaleY: d / itemDim.height,
    rotation: -1 * item.angle * 2,
});
```

- **Target:** Selected item background
- **Duration:** 1.2 seconds
- **Easing:** Expo.easeInOut
- **Delay:** 0.4 seconds
- **Effect:**
    - Moves to viewport center
    - Scales to cover entire viewport (using diagonal calculation)
    - Rotates to counteract image rotation
- **Purpose:** Dramatic full-screen expansion effect

### 11. Image Transformation (Item Opening)

**Location:** `openItem()` method

```javascript
TweenMax.to(item.DOM.tilt.img, 1.2, {
    ease: Expo.easeInOut,
    delay: 0.55,
    scaleX: contentImgDim.width / imgDim.width,
    scaleY: contentImgDim.height / imgDim.height,
    x:
        contentImgDim.left +
        contentImgDim.width / 2 -
        (imgDim.left + imgDim.width / 2),
    y:
        contentImgDim.top +
        contentImgDim.height / 2 -
        (imgDim.top + imgDim.height / 2),
    rotation: 0,
    onComplete: () => {
        /* Completion logic */
    },
});
```

- **Target:** Grid item image
- **Duration:** 1.2 seconds
- **Easing:** Expo.easeInOut
- **Delay:** 0.55 seconds (0.15s after background starts)
- **Effect:**
    - Scales to match content image size
    - Translates to content image position
    - Resets rotation to 0
- **Purpose:** Seamless transition from grid image to content image

### 12. Image Return Animation (Item Closing)

**Location:** `closeItem()` method

```javascript
TweenMax.to(item.DOM.tilt.img, withAnimation ? 1.2 : 0, {
    ease: Expo.easeInOut,
    scaleX: 1,
    scaleY: 1,
    x: 0,
    y: 0,
    rotation: item.angle * 2,
});
```

- **Target:** Grid item image
- **Duration:** 1.2 seconds (if animated)
- **Easing:** Expo.easeInOut
- **Effect:** Returns image to original grid position, scale, and rotation
- **Purpose:** Reverse of opening animation

### 13. Background Return Animation (Item Closing)

**Location:** `closeItem()` method

```javascript
TweenMax.to(item.DOM.bg, withAnimation ? 1.2 : 0, {
    ease: Expo.easeInOut,
    delay: 0.15,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    onComplete: () => {
        /* Cleanup logic */
    },
});
```

- **Target:** Item background
- **Duration:** 1.2 seconds (if animated)
- **Easing:** Expo.easeInOut
- **Delay:** 0.15 seconds
- **Effect:** Returns background to original grid position and scale
- **Purpose:** Coordinated return animation with cleanup

### 14. Content Controls Animation

**Location:** `toggleContentElems()` method

```javascript
TweenMax.to(
    [this.DOM.closeCtrl, this.DOM.scrollIndicator],
    withAnimation ? 0.8 : 0,
    {
        ease: show ? Expo.easeOut : Expo.easeIn,
        delay: withAnimation ? delay : 0,
        startAt: show ? { y: 60 } : null,
        y: show ? 0 : 60,
        opacity: show ? 1 : 0,
    },
);
```

- **Target:** Close button and scroll indicator (array target)
- **Duration:** 0.8 seconds (if animated)
- **Easing:**
    - Show: Expo.easeOut
    - Hide: Expo.easeIn
- **Delay:** Variable delay parameter
- **StartAt:** Positions controls 60px down when showing
- **Effect:** Slides controls up/down with fade in/out
- **Purpose:** Smooth reveal/hide of navigation controls

## Animation Timing Summary

The code creates sophisticated choreographed sequences:

1. **Hover Effects:** Quick responsive animations (0.2-2s) with elastic returns
2. **Grid Reorganization:** Medium timing (0.8s) with exponential easing for smooth transitions
3. **Item Opening:** Longer dramatic sequence (1.2s) with staggered delays (0.4s, 0.55s)
4. **Content Reveal:** Staggered letter animations with back easing for bounce effects
5. **Closing Sequence:** Coordinated reverse animations with cleanup timing

The easing choices create distinct feels:

- **Expo.easeOut/InOut:** Smooth, premium feel for major transitions
- **Elastic.easeOut:** Playful bounce for interactive elements
- **Back.easeOut:** Attention-grabbing overshoot for text reveals
- **Quad/Quart.easeIn:** Quick snappy hiding animations
