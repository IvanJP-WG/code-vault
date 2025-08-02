// decrypt.js
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const headers = document.querySelectorAll(".scramble");

headers.forEach((target) => {
  let isAnimating = false;
  let interval;

  target.addEventListener("mouseenter", () => {
    if (isAnimating) return;

    isAnimating = true;
    const originalText = target.dataset.original || target.innerText;
    target.dataset.original = originalText;

    let iteration = 0;

    interval = setInterval(() => {
      target.innerText = originalText
        .split("")
        .map((char, idx) => {
          if (char === " ") return " ";
          return idx < iteration
            ? originalText[idx]
            : letters[Math.floor(Math.random() * letters.length)];
        })
        .join("");

      iteration += 0.5;

      if (iteration >= originalText.length) {
        clearInterval(interval);
        target.innerText = originalText;
        isAnimating = false;
      }
    }, 50);
  });
});

let cancelled = false;

const searchInput = document.getElementById("codeSearchInput");
const optionsContainer = document.getElementById("codeOptions");
const hiddenInput = document.getElementById("codeType");

searchInput.addEventListener("focus", () => {
  optionsContainer.style.display = "block";
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-select-container")) {
    optionsContainer.style.display = "none";
  }
});

function filterCodes() {
  const filter = searchInput.value.toLowerCase();
  const options = optionsContainer.querySelectorAll("div");

  options.forEach((opt) => {
    const text = opt.innerText.toLowerCase();
    opt.style.display = text.includes(filter) ? "block" : "none";
  });
}

optionsContainer.querySelectorAll("div").forEach((opt) => {
  opt.addEventListener("click", () => {
    searchInput.value = opt.innerText;
    hiddenInput.value = opt.dataset.value;
    optionsContainer.style.display = "none";
  });
});

function showDecryptingOverlay() {
  cancelled = false; // Reset when starting
  const overlay = document.createElement("div");
  overlay.id = "encryptOverlay";
  overlay.className = "encrypting-box";
  overlay.innerHTML = `
    <p>Decrypting your message...</p>
    <img src="assets/logo.png" alt="Decrypting" class="rotating-logo" />
    <button id="cancelDecrypt">Cancel</button>
  `;
  document.body.appendChild(overlay);

  const cancelBtn = overlay.querySelector("#cancelDecrypt");
  cancelBtn.addEventListener("click", () => {
    cancelled = true;
    hideDecryptingOverlay();
    document.getElementById("outputBox").innerHTML = "";
  });
}

function hideDecryptingOverlay() {
  const overlay = document.getElementById("encryptOverlay");
  if (overlay) overlay.remove();
}

const morseMapReverse = Object.fromEntries(
  Object.entries({
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
    6: "-....", 7: "--...", 8: "---..", 9: "----.", " ": "/", ".": ".-.-.-", ",": "--..--"
  }).map(([k, v]) => [v, k])
);

function decodeBinary(str) {
  return str.split(" ").map(bin => {
    const charCode = parseInt(bin, 2);
    return isNaN(charCode) || charCode > 255 ? "�" : String.fromCharCode(charCode);
  }).join("");
}

function decodeAscii(str) {
  return str.split(" ").map(c => String.fromCharCode(parseInt(c))).join("");
}

function decodeHex(str) {
  return str.split(" ").map(hex => String.fromCharCode(parseInt(hex, 16))).join("");
}

function decodeCaesar(str) {
  return str.split('').map(c => {
    if (/[a-z]/i.test(c)) {
      const code = c.charCodeAt(0);
      const base = c === c.toUpperCase() ? 65 : 97;
      return String.fromCharCode(((code - base - 3 + 26) % 26) + base);
    } else {
      return c;
    }
  }).join('');
}

function decodeAtbash(str) {
  return str.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char === char.toUpperCase() ? 65 : 97;
    return String.fromCharCode(25 - (char.charCodeAt(0) - base) + base);
  }).join('');
}

function decodeRot13(str) {
  return str.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char === char.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  }).join('');
}

function decodeRailfence(str) {
  const mid = Math.ceil(str.length / 2);
  let rail1 = str.slice(0, mid);
  let rail2 = str.slice(mid);
  let result = "";
  for (let i = 0; i < mid; i++) {
    result += rail1[i] || "";
    result += rail2[i] || "";
  }
  return result;
}

function decodeUtf8(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return "Invalid UTF-8 format";
  }
}

function decodeHuffman(treeObj, encodedStr) {
  const tree = typeof treeObj === "string" ? JSON.parse(treeObj) : treeObj;
  let result = "";
  let node = tree;

  for (let bit of encodedStr) {
    node = bit === "0" ? node.left : node.right;
    if (node.char !== undefined) {
      result += node.char;
      node = tree;
    }
  }

  return result;
}

function detectCodeType(text) {
  const morseRegex = /^[-.\/ ]+$/;
  const binaryRegex = /^[01 ]+$/;
  const asciiRegex = /^(\d{2,3}\s*)+$/;
  const hexRegex = /^([0-9A-Fa-f]{2}\s*)+$/;
  const utf8Regex = /%[0-9A-Fa-f]{2}/;

  if (morseRegex.test(text.trim())) return "morse";
  if (binaryRegex.test(text.trim())) return "binary";
  if (asciiRegex.test(text.trim()) && !text.includes("0x")) return "ascii";
  if (hexRegex.test(text.trim())) return "hex";
  if (utf8Regex.test(text)) return "utf8";

  // Basic Caesar or ROT13 detection
  const caesarLetters = text.replace(/[^a-zA-Z]/g, '');
  if (caesarLetters.length && /^[a-zA-Z\s.,!?]+$/.test(text)) {
    return "caesar";
  }

  return "unknown";
}

const detectedDisplay = document.getElementById("detectedTypeDisplay");

searchInput.addEventListener("input", filterCodes);

document.getElementById("inputText").addEventListener("input", (e) => {
  const input = e.target.value.trim();
  const detected = detectCodeType(input);

  if (detected !== "unknown") {
    detectedDisplay.innerText = `Detected Code: ${detected.toUpperCase()}`;
    detectedDisplay.dataset.detected = detected;
  } else {
    detectedDisplay.innerText = `Code Type: Undetectable`;
    detectedDisplay.dataset.detected = "";
  }
});

const decryptBtn = document.getElementById("decryptBtn");
if (decryptBtn) {
  decryptBtn.addEventListener("click", () => {
    const text = document.getElementById("inputText").value.trim();
    let codeType = document.getElementById("codeType").value.trim().toLowerCase();
    const detectedType = detectedDisplay.dataset.detected;

    if (!codeType && detectedType) {
        codeType = detectedType;
    } else if (!codeType && !detectedType) {
        output.innerText = "Please select a code type or enter a recognizable code.";
        return;
    }
    const output = document.getElementById("outputBox");

    if (!text || !codeType) {
      output.innerText = "Please enter text and select a code type.";
      return;
    }

    showDecryptingOverlay();
    cancelled = false;

    setTimeout(() => {
      if (cancelled) return;

      hideDecryptingOverlay();

      let result = "";

      switch (codeType) {
        case "morse":
          result = text.split(" ").map(symbol => morseMapReverse[symbol] || "?").join("");
          break;
        case "binary":
          result = decodeBinary(text);
          break;
        case "ascii":
          result = decodeAscii(text);
          break;
        case "hex":
          result = decodeHex(text);
          break;
        case "caesar":
          result = decodeCaesar(text);
          break;
        case "atbash":
          result = decodeAtbash(text);
          break;
        case "rot13":
          result = decodeRot13(text);
          break;
        case "railfence":
          result = decodeRailfence(text);
          break;
        case "utf8":
          result = decodeUtf8(text);
          break;
        case "huffman":
          try {
            const parsed = JSON.parse(text);
            result = decodeHuffman(parsed.tree, parsed.encoded);
          } catch (e) {
            result = "Invalid Huffman format.";
          }
          break;
        default:
          result = "Decryption for this code type is not available.";
      }

      if (!result || /[�?]{2,}/.test(result)) {
        output.innerText = "Your message can't be decrypted.";
      } else {
        output.innerText = result;
      }
    }, 2500);
  });
}
