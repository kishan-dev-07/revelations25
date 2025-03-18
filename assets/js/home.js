function locomotive() {
    gsap.registerPlugin(ScrollTrigger);

    // Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

    const locoScroll = new LocomotiveScroll({
        el: document.querySelector(".main"),
        smooth: true
    });
    // each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
    locoScroll.on("scroll", ScrollTrigger.update);

    // tell ScrollTrigger to use these proxy methods for the ".main" element since Locomotive Scroll is hijacking things
    ScrollTrigger.scrollerProxy(".main", {
        scrollTop(value) {
            return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
        }, // we don't have to define a scrollLeft because we're only scrolling vertically.
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
        pinType: document.querySelector(".main").style.transform ? "transform" : "fixed"
    });

    // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

    // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
    ScrollTrigger.refresh();

}

function textSplitter() {
    var allH1 = document.querySelectorAll(".page2 h1");
    // console.log(allH1);

    allH1.forEach(function (elem) {
        var clutter = "";

        var h1Text = elem.textContent;
        var splittedText = h1Text.split("");

        splittedText.forEach(e => {
            clutter += `<span>${e}</span>`
        });

        elem.innerHTML = clutter;
    })
}

function gsapAnimation() {
    gsap.to(".page2 h1 span", {
        color: "#e3e3c4",
        stagger: 0.01,
        scrollTrigger: {
            trigger: ".page2 h1",
            scroller: ".main",
            start: "top 25%",
            end: "top -10%",
            scrub: 2,
            markers: false
        }
    })
}

const heroAnimation = () => {
    document.addEventListener("DOMContentLoaded", () => {

        const container = document.querySelector(".trail-container");

        const config = {
            imageCount: 13,
            imageLifespan: 750,
            removalDelay: 50,
            mouseThreshold: 100,
            scrollThreshold: 50,
            idleCursorInterval: 300,
            inDuration: 750,
            outDuration: 1000,
            inEasing: "cubic-bezier(.07,.5,.5,1)",
            outEasing: "cubic-bezier(.87, 0, .13, 1)",
        };

        const images = Array.from(
            { length: config.imageCount },
            (_, i) => `assets/imgs/hero/img${i + 1}.gif`
        );
        const trail = [];

        let mouseX = 0,
            mouseY = 0,
            lastMouseX = 0,
            lastMouseY = 0;
        let isMoving = false,
            isCursorInContainer = false;
        let lastRemovalTime = 0,
            lastSteadyImageTime = 0,
            lastScrollTime = 0;
        let isScrolling = false,
            scrollTicking = false;

        const isInContainer = (x, y) => {
            const rect = container.getBoundingClientRect();
            return (
                x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
            );
        };

        const setInitialMousePos = (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            isCursorInContainer = isInContainer(mouseX, mouseY);
            document.removeEventListener("mouseover", setInitialMousePos, false);
        };
        document.addEventListener("mouseover", setInitialMousePos, false);

        const hasMovedEnough = () => {
            const distance = Math.sqrt(
                Math.pow(mouseX - lastMouseX, 2) + Math.pow(mouseY - lastMouseY, 2)
            );
            return distance > config.mouseThreshold;
        };

        const createTrailImage = () => {
            if (!isCursorInContainer) return;

            const now = Date.now();

            if (isMoving && hasMovedEnough()) {
                lastMouseX = mouseX;
                lastMouseY = mouseY;
                createImage();
                return;
            }

            if (!isMoving && now - lastSteadyImageTime >= config.idleCursorInterval) {
                lastSteadyImageTime = now;
                createImage();
            }
        };

        const createImage = () => {
            const img = document.createElement("img");
            img.classList.add("trail-img");

            const randomIndex = Math.floor(Math.random() * images.length);
            const rotation = (Math.random() - 0.5) * 50;
            img.src = images[randomIndex];

            const rect = container.getBoundingClientRect();
            const relativeX = mouseX - rect.left;
            const relativeY = mouseY - rect.top;

            img.style.left = `${relativeX}px`;
            img.style.top = `${relativeY}px`;
            img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
            img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

            container.appendChild(img);

            setTimeout(() => {
                img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
            }, 10);

            trail.push({
                element: img,
                rotation: rotation,
                removeTime: Date.now() + config.imageLifespan,
            });
        };

        const createScrollTrailImage = () => {
            if (!isCursorInContainer) return;

            lastMouseX += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
            lastMouseY += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);

            createImage();

            lastMouseX = mouseX;
            lastMouseY = mouseY;
        };

        const removeOldImages = () => {
            const now = Date.now();

            if (now - lastRemovalTime < config.removalDelay || trail.length === 0)
                return;

            const oldestImage = trail[0];
            if (now >= oldestImage.removeTime) {
                const imgToRemove = trail.shift();

                imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
                imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;

                lastRemovalTime = now;

                setTimeout(() => {
                    if (imgToRemove.element.parentNode) {
                        imgToRemove.element.parentNode.removeChild(imgToRemove.element);
                    }
                }, config.outDuration);
            }
        };

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isCursorInContainer = isInContainer(mouseX, mouseY);

            if (isCursorInContainer) {
                isMoving = true;
                clearTimeout(window.moveTimeout);
                window.moveTimeout = setTimeout(() => {
                    isMoving = false;
                }, 100);
            }
        });

        window.addEventListener(
            "scroll",
            () => {
                isCursorInContainer = isInContainer(mouseX, mouseY);

                if (isCursorInContainer) {
                    isMoving = true;
                    lastMouseX += (Math.random() - 0.5) * 10;

                    clearTimeout(window.scrollTimeout);
                    window.scrollTimeout = setTimeout(() => {
                        isMoving = false;
                    }, 100);
                }
            },
            { passive: true }
        );

        window.addEventListener(
            "scroll",
            () => {
                const now = Date.now();
                isScrolling = true;

                if (now - lastScrollTime < config.scrollThreshold) return;

                lastScrollTime = now;

                if (!scrollTicking) {
                    requestAnimationFrame(() => {
                        if (isScrolling) {
                            createScrollTrailImage();
                            isScrolling = false;
                        }
                        scrollTicking = false;
                    });
                    scrollTicking = true;
                }
            },
            { passive: true }
        );

        const animate = () => {
            createTrailImage();
            removeOldImages();
            requestAnimationFrame(animate);
        };
        animate();
    });
}


const buttonAnimation = () => {
    document.addEventListener('DOMContentLoaded', () => {
        const button = document.querySelector('.neon-button');
        const buttonText = document.querySelector('.button-text');
        let hasAnimated = false;
        
        // Create GSAP timelines
        const buttonTimeline = gsap.timeline({ paused: true });
        const textTimeline = gsap.timeline({ paused: true });
        
        buttonTimeline
          .to(button, {
            scale: 0.95,
            duration: 0.1
          })
          .to(button, {
            boxShadow: '0 0 30px #39ff14',
            duration: 0.2
          });
        
        textTimeline
          .to(buttonText, {
            opacity: 0,
            y: -20,
            duration: 0.2,
            onComplete: () => {
              buttonText.textContent = 'Events';
            }
          })
          .to(buttonText, {
            opacity: 1,
            y: 0,
            duration: 0.2
          });
        
        // Add event listeners
        button.addEventListener('mouseenter', () => {
          buttonTimeline.play();
          if (!hasAnimated) {
            textTimeline.play();
            hasAnimated = true;
          }
        });
        
        button.addEventListener('mouseleave', () => {
          buttonTimeline.reverse();
        });
      });
}

const stackAnimation = () => {

    const pinnedSection = document.querySelector(".pinned");
    const stickyHeader = document.querySelector(".sticky-header");
    const cards = document.querySelectorAll(".card");
    const progressBarContainer = document.querySelector(".progress-bar");
    const progressBar = document.querySelector(".progress");
    const indicesContainer = document.querySelector(".indices");
    const indices = document.querySelectorAll(".index");
    const cardCount = cards.length;
    const pinnedHeight = window.innerHeight * (cardCount + 1);
    const startRotations = [0, 5, 0, -5];
    const endRotations = [-10, -5, 10, 5];
    const progressColors = ["#A5D6A7", "#FFCC80", "#FFF59D", "#90CAF9", "#EF9A9A", "#BCAAA4"];

    cards.forEach((card, index) => {
        gsap.set(card, { rotation: startRotations[index] });
    });

    let isProgressBarVisible = false;
    let currentActiveIndex = -1;

    function animateIndexOpacity(newIndex) {
        if (newIndex !== currentActiveIndex) {
            indices.forEach((index, i) => {
                gsap.to(index, {
                    opacity: i === newIndex ? 1 : 0.25,
                    duration: 0.5,
                    ease: "power2.out",
                });
            });
            currentActiveIndex = newIndex;
        }
    }

    function showProgressAndIndices() {
        gsap.to([progressBarContainer, indicesContainer], {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
        });
        isProgressBarVisible = true;
    }

    function hideProgressAndIndices() {
        gsap.to([progressBarContainer, indicesContainer], {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
        });
        isProgressBarVisible = false;
        animateIndexOpacity(-1);
    }

    ScrollTrigger.create({
        trigger: pinnedSection,
        scroller: ".main",
        start: "top top",
        end: `+=${pinnedHeight}`,
        pin: true,
        pinSpacing: true,
        onLeave: () => {
            hideProgressAndIndices();
        },
        onEnterBack: () => {
            showProgressAndIndices();
        },
        onUpdate: (self) => {
            const progress = self.progress * (cardCount + 1);
            const currentCard = Math.floor(progress);

            if (progress <= 1) {
                gsap.to(stickyHeader, {
                    opacity: 1 - progress,
                    duration: 0.1,
                    ease: "none",
                });
            } else {
                gsap.set(stickyHeader, { opacity: 0 });
            }

            if (progress > 1 && !isProgressBarVisible) {
                showProgressAndIndices();
            } else if (progress <= 1 && isProgressBarVisible) {
                hideProgressAndIndices();
            }

            let progressHeight = 0;
            let colorIndex = -1;
            if (progress > 1) {
                progressHeight = ((progress - 1) / cardCount) * 100;
                colorIndex = Math.min(Math.floor(progress - 1), cardCount - 1);
            }

            gsap.to(progressBar, {
                height: `${progressHeight}%`,
                backgroundColor: progressColors[colorIndex],
                duration: 0.3,
                ease: "power1.out",
            });

            if (isProgressBarVisible) {
                animateIndexOpacity(colorIndex);
            }

            cards.forEach((card, index) => {
                if (index < currentCard) {
                    gsap.set(card, {
                        top: "50%",
                        rotation: endRotations[index],
                    });
                } else if (index === currentCard) {
                    const cardProgress = progress - currentCard;
                    const newTop = gsap.utils.interpolate(150, 50, cardProgress);
                    const newRotation = gsap.utils.interpolate(
                        startRotations[index],
                        endRotations[index],
                        cardProgress
                    );
                    gsap.set(card, {
                        top: `${newTop}%`,
                        rotation: newRotation,
                    });
                } else {
                    gsap.set(card, {
                        top: "150%",
                        rotation: startRotations[index],
                    });
                }
            });
        },
    });
}

locomotive();
textSplitter();
gsapAnimation();
heroAnimation();
buttonAnimation();
stackAnimation();