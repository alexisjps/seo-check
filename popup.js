chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "seo_results") {
    displayResults(request.data);
  }
});

function sendMessageToContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      setTimeout(sendMessageToContentScript, 100);
    } else {
      chrome.tabs.sendMessage(tabs[0].id, { action: "analyze_seo" });
    }
  });
}

sendMessageToContentScript();

function displayResults(results) {
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "none";
  
  const resultsContainer = document.getElementById("results-container");
  
  const numberOfRows = Math.ceil(Object.keys(results).length / 3);

  for (let i = 0; i < numberOfRows; i++) {
    const resultsRow = document.createElement("div");
    resultsRow.classList.add("row", "mt-3", "mx-auto", "d-flex");
    resultsContainer.appendChild(resultsRow);

    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j;
      const key = Object.keys(results)[index];
      if (key) {
        const result = results[key];
        if (key === "brokenLinks") {
          const brokenLinksText = result.length > 0 ? `Liens brisés (${result.length}) : ${result.join(", ")}` : "✅";
          resultsRow.appendChild(createResultItem("Liens brisés", brokenLinksText));
        } else {
          const labelText = {
            title: "Titre",
            metaDescription: "Meta Description",
            pageLoadTime: "Temps de chargement",
            schema: "Schema.org",
            https: "HTTPS",
            doctype: "Doctype",
            lang: "Attribut de langue",
            imagesWithoutAlt: result === 0 ? "Texte alternatif pour les images" : "Images sans texte alternatif",
            compression: "Compression (Gzip/Brotli)",
            cdn: "Utilisation d'un CDN",
            robotsTxt: "Fichier robots.txt",
            sitemap: "Fichier sitemap.xml",
          }[key];
          const value = key === "pageLoadTime" ? `${result.value} ms` : checkOrCross(result.present || result);
          const col = createResultItem(labelText, value);

          if (key === "robotsTxt") {
            resultsRow.insertBefore(col, resultsRow.children[2]);
          } else {
            resultsRow.appendChild(col);
          }
        }
      }
    }
  }
}

function checkOrCross(condition) {
  return condition ? "✅" : "❌";
}

function createResultItem(label, result) {
  const col = document.createElement("div");
  col.classList.add("col-12", "col-md-6", "col-lg-6", "mb-3");

  const card = document.createElement("div");
  card.classList.add("card", "shadow", "h-100", "result-item");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body", "d-flex", "justify-content-between", "align-items-center", "px-3");

  const cardTitle = document.createElement("h6");
  cardTitle.classList.add("card-title", "mb-0");
  cardTitle.textContent = label;

  const cardResult = document.createElement("span");
  cardResult.textContent = result;

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardResult);
  card.appendChild(cardBody);
  col.appendChild(card);
  return col;
}
