/* Edit the name in content.js; motion settings live in this file. */
(() => {
  "use strict";

  const button = document.querySelector(".name-button");
  if (!button) return;

  const name = button.textContent.trim();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  button.setAttribute("aria-label", name + " Play name animation");
  button.replaceChildren();

  name.split(/\s+/).forEach((word, wordIndex) => {
    if (wordIndex) button.append(document.createTextNode(" "));
    const wrapper = document.createElement("span");
    wrapper.className = "name-word";
    wrapper.setAttribute("aria-hidden", "true");

    for (const character of word) {
      const letter = document.createElement("span");
      letter.className = "name-letter";
      letter.textContent = character;
      wrapper.append(letter);
    }
    button.append(wrapper);
  });

  const letters = [...button.querySelectorAll(".name-letter")];
  const animations = new Map();
  let timer;

  function jump(letter, delay = 0) {
    if (reducedMotion.matches || typeof letter.animate !== "function") return;
    animations.get(letter)?.cancel();
    const animation = letter.animate([
      { transform: "translateY(0) scale(1, 1)" },
      { transform: "translateY(2px) scale(1.08, .9)", offset: .14 },
      { transform: "translateY(-13px) rotate(-5deg) scale(.97, 1.04)", offset: .42 },
      { transform: "translateY(0) scale(1.06, .94)", offset: .72 },
      { transform: "translateY(-3px) rotate(2deg)", offset: .86 },
      { transform: "translateY(0) scale(1, 1)" }
    ], { duration: 620, delay, easing: "ease-in-out" });
    animations.set(letter, animation);
    animation.onfinish = () => {
      if (animations.get(letter) === animation) animations.delete(letter);
    };
  }

  function wave() {
    if (document.hidden || reducedMotion.matches) return;
    letters.forEach((letter, index) => jump(letter, index * 55));
  }

  button.addEventListener("pointerover", event => {
    if (event.pointerType === "mouse" && event.target.matches(".name-letter")) {
      jump(event.target);
    }
  });
  button.addEventListener("click", wave);
  button.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) wave();
    }
  });

  function schedule() {
    clearInterval(timer);
    animations.forEach(animation => animation.cancel());
    animations.clear();
    if (reducedMotion.matches) return;
    timer = setInterval(() => {
      const bounds = button.getBoundingClientRect();
      if (bounds.top < innerHeight && bounds.bottom > 0) wave();
    }, 6500);
  }

  reducedMotion.addEventListener("change", schedule);
  window.addEventListener("pagehide", () => clearInterval(timer));
  window.addEventListener("pageshow", schedule);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        wave();
        observer.disconnect();
      }
    });
    observer.observe(button);
  }
  schedule();
})();

