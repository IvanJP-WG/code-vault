const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const headers = document.querySelectorAll("h2.code-category, .scramble");

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

function searchCodes() {
  const input = document.getElementById("searchInput").value.toLowerCase().trim();
  const codeSections = document.querySelectorAll(".code-section");

  codeSections.forEach(section => {
    const listItems = section.querySelectorAll("li");
    let sectionHasVisibleItems = false;

    listItems.forEach(li => {
      const codeName = li.textContent.toLowerCase();
      const match = codeName.includes(input);
      li.style.display = match ? "list-item" : "none";
      if (match) sectionHasVisibleItems = true;
    });

    section.style.display = sectionHasVisibleItems ? "block" : "none";
  });

  if (input === "") {
    document.querySelectorAll(".code-section").forEach(section => {
      section.style.display = "block";
      section.querySelectorAll("li").forEach(li => li.style.display = "list-item");
    });
  }
}
