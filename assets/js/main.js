let locoScroll;

function locomotive(){
    gsap.registerPlugin(ScrollTrigger);

    // Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

    locoScroll = new LocomotiveScroll({
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

function textSplitter(){
    var allH1 = document.querySelectorAll(".page2 h1");
    // console.log(allH1);

    allH1.forEach(function(elem){
        var clutter = "";

        var h1Text = elem.textContent;
        var splittedText = h1Text.split("");

        splittedText.forEach(e => {
            clutter += `<span>${e}</span>`
        });

        elem.innerHTML = clutter;
    })
}

function gsapAnimation(){
    gsap.to(".page2 h1 span", {
        color: "#e3e3c4",
        stagger: 0.2,
        scrollTrigger:{
            trigger: ".page2 h1",
            scroller: ".main",
            start: "top 35%",
            end: "top -10%",
            scrub: 2,
            markers: false
        }
    })

    gsap.to(".page3 .title", {
        opacity: 1,
        scrollTrigger:{
            trigger: ".page3",
            scroller: ".main",
            start: "top 50%",
            end: "top -10%",
            scrub: 2,
            markers: false
        }
    })
}

import { servicesCopy } from "./services.js";
const legaciesAnimation = () => {
    document.addEventListener("DOMContentLoaded", () => {
        gsap.registerPlugin(ScrollTrigger);
      
        // const lenis = new Lenis();
        // lenis.on("scroll", ScrollTrigger.update);
        // gsap.ticker.add((time) => {
        //   lenis.raf(time * 1000);
        // });
      
        gsap.ticker.lagSmoothing(0);
      
        const stickySection = document.querySelector(".sticky");
        const stickyHeight = window.innerHeight * 6;
        const services = document.querySelectorAll(".service");
        const indicator = document.querySelector(".indicator");
        const currentCount = document.querySelector("#current-count");
        const serviceImg = document.querySelector(".service-img");
        const serviceCopy = document.querySelector(".service-copy p");
        const serviceHeight = 58;
        const imgHeight = 250;
      
        serviceCopy.textContent = servicesCopy[0][0];
        let currentSplitText = new SplitType(serviceCopy, { types: "lines" });
      
        const measureContainer = document.createElement("div");
        measureContainer.style.cssText = `
            position: absolute;
            visibility: hidden;
            height: auto;
            width: auto;
            white-space: nowrap;
            font-family: comicNeue;
            font-weight: 600;
            text-transform: uppercase;
        `;
        document.body.appendChild(measureContainer);
      
        const serviceWidths = Array.from(services).map((service) => {
          measureContainer.textContent = service.querySelector("p").textContent;
          return measureContainer.offsetWidth + 200;
        });
      
        document.body.removeChild(measureContainer);
      
        gsap.set(indicator, {
          width: serviceWidths[0],
          xPercent: -50,
          left: "50%",
        });
      
        const scrollPerService = window.innerHeight;
        let currentIndex = 0;
      
        const animateTextChange = (index) => {
          return new Promise((resolve) => {
            gsap.to(currentSplitText.lines, {
              opacity: 0,
              y: -20,
              duration: 0.25,
              stagger: 0.025,
              ease: "power3.inOut",
              onComplete: () => {
                currentSplitText.revert();
      
                const newText = servicesCopy[index][0];
                serviceCopy.textContent = newText;
      
                currentSplitText = new SplitType(serviceCopy, {
                  types: "lines",
                });
      
                gsap.set(currentSplitText.lines, {
                  opacity: 0,
                  y: 20,
                });
      
                gsap.to(currentSplitText.lines, {
                  opacity: 1,
                  y: 0,
                  duration: 0.25,
                  stagger: 0.025,
                  ease: "power3.out",
                  onComplete: resolve,
                });
              },
            });
          });
        };
      
        ScrollTrigger.create({
          trigger: stickySection,
          scroller: ".main",
          start: "top top",
          end: `${stickyHeight}px`,
          pin: true,
          onUpdate: async (self) => {
            const progress = self.progress;
            gsap.set(".progress", { scaleY: progress });
      
            const scrollPosition = Math.max(0, self.scroll() - window.innerHeight);
            const activeIndex = Math.floor(scrollPosition / scrollPerService);
      
            if (
              activeIndex >= 0 &&
              activeIndex < services.length &&
              currentIndex !== activeIndex
            ) {
              currentIndex = activeIndex;
      
              services.forEach((service) => service.classList.remove("active"));
              services[activeIndex].classList.add("active");
      
              await Promise.all([
                gsap.to(indicator, {
                  y: activeIndex * serviceHeight,
                  width: serviceWidths[activeIndex],
                  duration: 0.3,
                  ease: "power3.inOut",
                  overwrite: true,
                }),
      
                gsap.to(serviceImg, {
                  y: -(activeIndex * imgHeight),
                  duration: 0.3,
                  ease: "power3.inOut",
                  overwrite: true,
                }),
      
                gsap.to(currentCount, {
                  innerText: activeIndex + 1,
                  snap: { innerText: 1 },
                  duration: 0.3,
                  ease: "power3.out",
                }),
      
                animateTextChange(activeIndex),
              ]);
            }
          },
        });
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
              buttonText.textContent = 'Revelations 2025';
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

const loaderAnimation = () => {

  document.addEventListener("DOMContentLoaded", () => {
    const windowWidth = window.innerWidth;
    const wrapperWidth = 180;
    const finalPosition = windowWidth - wrapperWidth;
    const stepDistance = finalPosition / 6;
    const tl = gsap.timeline();
  
    tl.to(".count", {
      x: -900,
      duration: 0.85,
      delay: 0.5,
      ease: "power4.inOut",
      onStart: () => {
        locoScroll.stop();
      }
    });
  
    for (let i = 1; i <= 6; i++) {
      const xPosition = -900 + i * 180;
      tl.to(".count", {
        x: xPosition,
        duration: 0.85,
        ease: "power4.inOut",
        onStart: () => {
          gsap.to(".count-wrapper", {
            x: stepDistance * i,
            duration: 0.85,
            ease: "power4.inOut",
          });
        },
      });
    }
  
    gsap.set(".revealer svg", { scale: 0 });
  
    const delays = [6, 6.5, 7];
    document.querySelectorAll(".revealer svg").forEach((el, i) => {
      gsap.to(el, {
        scale: 45,
        duration: 1.5,
        ease: "power4.inOut",
        delay: delays[i],
        onComplete: () => {
          if (i === delays.length - 1) {
            document.querySelector(".loader").remove();
          }

          locoScroll.start();
          ScrollTrigger.refresh();
        },
      });
    });
  
    // gsap.to(".header h1", {
    //   onStart: () => {
    //     gsap.to(".toggle-btn", {
    //       scale: 1,
    //       duration: 1,
    //       ease: "power4.inOut",
    //     });
    //     gsap.to(".line p", {
    //       y: 0,
    //       duration: 1,
    //       stagger: 0.1,
    //       ease: "power3.out",
    //     });
    //   },
    //   rotateY: 0,
    //   opacity: 1,
    //   duration: 2,
    //   ease: "power3.out",
    //   delay: 8,
    // });
  });  
}

locomotive();
textSplitter();
gsapAnimation();
legaciesAnimation();
buttonAnimation();
loaderAnimation();