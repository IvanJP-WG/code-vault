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

  let found = false;

  codeSections.forEach(section => {
    const listItems = section.querySelectorAll("li");
    listItems.forEach(li => {
      const codeName = li.textContent.toLowerCase();
      if (codeName.includes(input)) {
        li.style.display = "list-item";
        section.style.display = "block";
        found = true;
      } else {
        li.style.display = "none";
      }
    });

    // If none of the items in this section match, hide the section
    const visibleItems = Array.from(listItems).filter(li => li.style.display !== "none");
    section.style.display = visibleItems.length > 0 ? "block" : "none";
  });

  if (!found) {
    alert("No matching code found.");
  }
}
