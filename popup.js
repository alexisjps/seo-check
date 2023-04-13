chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "seo_results") {
    displayResults(request.data);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: "analyze_seo" });
});

function displayResults(results) {
  const resultsContainer = document.getElementById("results-container");
  const resultsRow = document.createElement("div");
  resultsRow.classList.add("row", "mt-3", "mx-auto");
  resultsContainer.appendChild(resultsRow);

  const checkOrCross = (condition) => (condition ? "✅" : "❌");

  const createResultItem = (label, result) => {
    const col = document.createElement("div");
    col.classList.add("col-md-4", "mb-3");

    const card = document.createElement("div");
    card.classList.add("card", "shadow", "h-100");

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
  };

  resultsRow.appendChild(createResultItem("Titre", checkOrCross(results.title.present)));
  resultsRow.appendChild(createResultItem("Meta Description", checkOrCross(results.metaDescription.present)));
  resultsRow.appendChild(createResultItem("Temps de chargement", `${results.pageLoadTime.value} ms`));

  resultsRow.appendChild(createResultItem("Schema.org", checkOrCross(results.schema.present)));
  resultsRow.appendChild(createResultItem("HTTPS", checkOrCross(results.https)));
  resultsRow.appendChild(createResultItem("Doctype", checkOrCross(results.doctype)));

  resultsRow.appendChild(createResultItem("Attribut de langue", checkOrCross(results.lang)));

  if (results.imagesWithoutAlt === 0) {
    resultsRow.appendChild(createResultItem("Texte alternatif pour les images", "✅"));
  } else {
    resultsRow.appendChild(createResultItem("Images sans texte alternatif", "❌"));
  }

  resultsRow.appendChild(createResultItem("Compression (Gzip/Brotli)", checkOrCross(results.compression)));
  resultsRow.appendChild(createResultItem("Utilisation d'un CDN", checkOrCross(results.cdn)));

  if (results.brokenLinks.length > 0) {
    const brokenLinksText = `Liens brisés (${results.brokenLinks.length}) : ${results.brokenLinks.join(", ")}`;
    resultsRow.appendChild(createResultItem("Liens brisés", brokenLinksText));
  } else {
    resultsRow.appendChild(createResultItem("Liens brisés", "✅"));
  }
}
