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
        return idx < iteration ? originalText[idx] : letters[Math.floor(Math.random() * letters.length)];
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

const searchInput = document.getElementById("codeSearchInput");
const optionsContainer = document.getElementById("codeOptions");
const hiddenInput = document.getElementById("codeType");

// Show options when input is focused
searchInput.addEventListener("focus", () => {
  optionsContainer.style.display = "block";
});

// Hide options if clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-select-container")) {
    optionsContainer.style.display = "none";
  }
});

// Filter options
function filterCodes() {
  const filter = searchInput.value.toLowerCase();
  const options = optionsContainer.querySelectorAll("div");

  options.forEach(opt => {
    const text = opt.innerText.toLowerCase();
    opt.style.display = text.includes(filter) ? "block" : "none";
  });
}

// When an option is clicked
optionsContainer.querySelectorAll("div").forEach(opt => {
  opt.addEventListener("click", () => {
    searchInput.value = opt.innerText;
    hiddenInput.value = opt.dataset.value;
    optionsContainer.style.display = "none";
  });
});

function showEncryptingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'encryptOverlay';
  overlay.className = 'encrypting-box';
  overlay.innerHTML = `
    <p>Encrypting your message...</p>
    <img src="assets/logo.png" alt="Encrypting" class="rotating-logo" />
    <button id="cancelEncrypt">Cancel</button>
  `;
  document.body.appendChild(overlay);

  document.getElementById("cancelEncrypt").addEventListener("click", () => {
    document.body.removeChild(overlay);
    document.getElementById("outputBox").innerHTML = "";
  });
}

function hideEncryptingOverlay() {
  const overlay = document.getElementById("encryptOverlay");
  if (overlay) overlay.remove();
}

const morseMap = {
A: ".-",     B: "-...",   C: "-.-.",
D: "-..",    E: ".",      F: "..-.",
G: "--.",    H: "....",   I: "..",
J: ".---",   K: "-.-",    L: ".-..",
M: "--",     N: "-.",     O: "---",
P: ".--.",   Q: "--.-",   R: ".-.",
S: "...",    T: "-",      U: "..-",
V: "...-",   W: ".--",    X: "-..-",
Y: "-.--",   Z: "--..",
0: "-----", 1: ".----", 2: "..---",
3: "...--", 4: "....-", 5: ".....",
6: "-....", 7: "--...", 8: "---..",
9: "----.",
" ": "/", "." : ".-.-.-", "," : "--..--"
};

document.getElementById("encryptBtn").addEventListener("click", () => {
    document.getElementById("inputText").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("encryptBtn").click();
    }
});

const text = document.getElementById("inputText").value;
const codeType = document.getElementById("codeType").value.toLowerCase();
const output = document.getElementById("outputBox");
const overlay = document.getElementById("encryptingOverlay");

if (!text.trim() || !codeType.trim()) {
    output.innerText = "Please enter text and select a code type.";
    return;
}

let cancelRequested = false;

cancelRequested = false;
overlay.style.display = "block";

setTimeout(() => {
    overlay.style.display = "none";

    if (cancelRequested) {
        output.innerText = "";
        return;
    }

let result = "";

switch (codeType) {
    case "morse":
        result = text.toUpperCase().split("").map(char => {
            return morseMap[char] || "?";
        }).join(" ");
        output.innerText = result;
        break;
    
    case "binary":
        result = text.split("").map(c =>
            c.charCodeAt(0).toString(2).padStart(8, 0)
        ).join(' ');
        output.innerText = result;
        break;
    
    case "ascii":
        result = text.split('').map(c =>
            c.charCodeAt(0)
        ).join(' ');
        output.innerText = result;
        break;

    case "hex":
        result = text.split('').map(c =>
            c.charCodeAt(0).toString(16).toUpperCase()
        ).join(' ');
        output.innerText = result;
        break;

    case "caesar":
        const shift = 3;
        result = text.split('').map(c => {
            if (/[a-z]/i.test(c)) {
                const code = c.charCodeAt(0);
                const base = c === c.toUpperCase () ? 65 : 97;
                return String.fromCharCode(((code - base + shift) % 26) + base);
            } else {
                return c;
            }
        }).join('');
        output.innerText = result;
        break;

    case "base13":
        result = text.toUpperCase().split("").map(char => {
            const base13Map = {
                A: "0",  B: "1",  C: "2",  D: "3",  E: "4",  F: "5",  G: "6",
                H: "7",  I: "8",  J: "9",  K: "A",  L: "B",  M: "C",
                N: "D",  O: "E",  P: "F",  Q: "G",  R: "H",  S: "I",  T: "J",
                U: "K",  V: "L",  W: "M",  X: "N",  Y: "O",  Z: "P",  1: "Q",
                2: "R",  3: "S",  4: "T",  5: "U",  6: "V",  7: "W",  8: "X",
                9: "Y",  0: "Z"
            };
            return base13Map[char] ?? "?";
        }).join("");
        output.innerText = result;
        break;

    case "vigenere":
        const keyword = "KEY";
        result = text.split('').map((char, i) => {
            if (!/[a-zA-Z]/.test(char)) return char;
            const base = char === char.toUpperCase() ? 65 : 97;
            const shift = keyword[i % keyword.length].toUpperCase().charCodeAt(0) - 65;
            return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
        }).join('');
        output.innerText = result;
        break;

    case "atbash":
        result = text.split('').map(char => {
            if (!/[a-zA-Z]/.test(char)) return char;
            const base = char === char.toUpperCase() ? 65 : 97;
            return String.fromCharCode(25 - (char.charCodeAt(0) - base) + base);
        }).join('');
        output.innerText = result;
        break;

    case "rot13":
        result = text.split('').map(char => {
            if (!/[a-zA-Z]/.test(char)) return char;
            const base = char === char.toUpperCase() ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
        }).join('');
        output.innerText = result;
        break;

    case "railfence":
        let rail1 = "", rail2 = "";
        for (let i = 0; i < text.length; i++) {
            if (i % 2 === 0) rail1 += text[i];
            else rail2 += text[i];
        }
        result = rail1 + rail2;
        output.innerText = result;
        break;

    case "qr":
        showEncryptingOverlay();

        setTimeout(() => {
            hideEncryptingOverlay();
            output.innerHTML = ""; // Clear previous content

            const qrWrapper = document.createElement("a");
            qrWrapper.href = text;
            qrWrapper.target = "_blank";
            qrWrapper.rel = "noopener noreferrer";

            const qrDiv = document.createElement("div");
            qrDiv.id = "qrCodeImage";

            qrWrapper.appendChild(qrDiv);
            output.appendChild(qrWrapper);

        new QRCode(qrDiv, {
            text: text,
            width: 200,
            height: 200,
            colorDark: "#000",
            colorLight: "#fff",
            correctLevel: QRCode.CorrectLevel.H
        });

        if (typeof QRCode === "undefined") {
            output.innerText = "QR Code library failed to load.";
        }

        qrWrapper.addEventListener("click", () => {
            window.open(text, '_blank');
        });

        const downloadBtn = document.createElement("button");
        downloadBtn.innerText = "Download Code";
        downloadBtn.id = "downloadQR";
        downloadBtn.classList.add("encrypt-button"); // Use existing styles

        output.appendChild(downloadBtn);

    // When button clicked
    downloadBtn.addEventListener("click", () => {
      const canvas = qrDiv.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg");
        link.download = "qr-code.jpg";
        link.click();
      } else {
        alert("QR code not ready yet.");
      }
    });
        
    }, 0);
        break;

    case "barcode":
        showEncryptingOverlay();

        setTimeout(() => {
            hideEncryptingOverlay();
            output.innerHTML = ""; // Clear previous content

            // Create a wrapper link if you want click to open
            const barcodeWrapper = document.createElement("div");

            // Create SVG for barcode
            const barcodeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            barcodeSvg.id = "barcodeImage";

            barcodeWrapper.appendChild(barcodeSvg);
            output.appendChild(barcodeWrapper);

            // Generate barcode
            try {
                JsBarcode(barcodeSvg, text, {
                    format: "CODE128", // most flexible format
                    lineColor: "#000",
                    width: 2,
                    height: 100,
                    displayValue: true
                });
            } catch (err) {
                output.innerText = "Invalid input for barcode.";
                return;
            }

            // Download Button
            const downloadBtn = document.createElement("button");
            downloadBtn.innerText = "Download Code";
            downloadBtn.id = "downloadBarcode";
            downloadBtn.classList.add("encrypt-button");

            output.appendChild(downloadBtn);

            // On click: download barcode as PNG
            downloadBtn.addEventListener("click", () => {
                const svgData = new XMLSerializer().serializeToString(barcodeSvg);
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const img = new Image();

                const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = "barcode.png";
                    link.click();
                };

                img.src = url;
            });

        }, 0);
        break;

    case "utf8":
        let utf8Result = '';
        for (let i = 0; i < text.length; i++) {
            utf8Result += encodeURIComponent(text[i]);
        }
        output.innerText = utf8Result;
        break;

    case "huffman":
        function buildFrequencyMap(str) {
            const freq = {};
            for (let char of str) {
            freq[char] = (freq[char] || 0) + 1;
            }
            return freq;
        }

        function buildHuffmanTree(freqMap) {
            const nodes = Object.entries(freqMap).map(([char, freq]) => ({ char, freq }));
            while (nodes.length > 1) {
            nodes.sort((a, b) => a.freq - b.freq);
            const left = nodes.shift();
            const right = nodes.shift();
            nodes.push({
                freq: left.freq + right.freq,
                left,
                right
            });
            }
            return nodes[0];
        }

        function generateCodes(node, prefix = '', codeMap = {}) {
            if (node.char !== undefined) {
            codeMap[node.char] = prefix;
            } else {
            generateCodes(node.left, prefix + '0', codeMap);
            generateCodes(node.right, prefix + '1', codeMap);
            }
            return codeMap;
        }

        function encodeWithHuffman(str, codeMap) {
            return str.split('').map(char => codeMap[char]).join('');
        }

        const freqMap = buildFrequencyMap(text);
        const huffmanTree = buildHuffmanTree(freqMap);
        const huffmanCodes = generateCodes(huffmanTree);
        const huffmanEncoded = encodeWithHuffman(text, huffmanCodes);

        output.innerText = huffmanEncoded;
        break;

        default:
            result = "Unsupported code type selected."
    }

}, 2500);
});

document.getElementById("cancelEncrypt").addEventListener("click", () => {
    cancelRequested = true;
    document.getElementById("encryptingOverlay").style.display = "none";
})
