// JS placeholder for translators
console.log("CodeVault loaded. Ready to decode...");

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function applyScrambleEffect(target) {
let interval = null;
let isAnimating = false;

const textNode = target.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  target.dataset.original = textNode.textContent;

target.addEventListener("mouseenter", () => {
  if (isAnimating) return;

  isAnimating = true;
  const originalText = target.dataset.original;

  let iteration = 0;

  interval = setInterval(() => {
    textNode.textContent = originalText
      .split("")
      .map((char, idx) => {
        if (char === " ") return " ";
        return idx < iteration ? originalText[idx] : letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");

    iteration += 1 / 2;

    if (iteration >= originalText.length) {
      clearInterval(interval);
      textNode.textContent = originalText;
      isAnimating = false;
    }
  }, 50);
});

target.addEventListener("mouseleave", () => {
  if (interval) clearInterval(interval);
  textNode.textContent = target.dataset.original;
  isAnimating = false;
});
}

document.querySelectorAll(".scramble").forEach(applyScrambleEffect);

const morseMap = {
      A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
      F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
      K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
      P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
      U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
      " ": " ", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
      "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----."
    };

    function toMorse(str) {
      return str.toUpperCase().split('').map(char => morseMap[char] || '').join(' ');
    }

    function toBinary(str) {
      return str.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    }

    function toASCII(str) {
      return str.split('').map(c => c.charCodeAt(0)).join(' ');
    }

function animateText(el, toText, onFinish = () => {}, delayAfter = 0) {
  const chars = toText.split('');
  let i = 0;

  el.classList.add('animating');
  el.style.pointerEvents = 'none';

  const interval = setInterval(() => {
    el.textContent = chars.slice(0, i + 1).join('');
    i++;
    if (i >= chars.length) {
      clearInterval(interval);

        if (delayAfter > 0) {
          setTimeout(() => {
            onFinish();
          }, delayAfter);
        } else {
          onFinish();
        }

      el.classList.remove('animating');
      el.style.pointerEvents = '';
    }
  }, 30);
}

function setupHeader(id, encoder) {
  const h3 = document.querySelector(`#${id} h3`);
  const original = h3.textContent;
  const encoded = encoder(original);

  h3.dataset.original = original;
  h3.dataset.encoded = encoded;

  let animating = false;
  
  h3.addEventListener('mouseenter', () => {
    if (animating) return;
    animating = true;

    animateText(h3, encoded, () => {
      animateText(h3, original, () => {
        animating = false;
      });
    }, 800);
  });
}

setupHeader("morse", toMorse);
setupHeader("binary", toBinary);
setupHeader("ascii", toASCII);

