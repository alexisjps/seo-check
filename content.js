chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze_seo") {
    analyzeSeo();
  }
});

function analyzeSeo() {
  function getTitle() {
    const titleElement = document.querySelector("head title");
    return titleElement ? titleElement.textContent : "";
  }

  function getMetaDescription() {
    const descriptionElement = document.querySelector('head meta[name="description"]');
    return descriptionElement ? descriptionElement.content : "";
  }

  function getPageLoadTime() {
    const performanceTiming = window.performance.timing;
    return performanceTiming.loadEventEnd - performanceTiming.navigationStart;
  }

  function checkSchema() {
    return !!document.querySelector('script[type="application/ld+json"]');
  }

  function checkHttps() {
    return window.location.protocol === "https:";
  }

  function checkDoctype() {
    return document.doctype !== null;
  }

  function checkLangAttribute() {
    return document.documentElement.lang !== "";
  }

  function getImagesWithoutAlt() {
    return Array.from(document.getElementsByTagName("img")).filter((img) => !img.hasAttribute("alt")).length;
  }

  function getBrokenLinks() {
    const links = Array.from(document.getElementsByTagName("a"));
    return Promise.all(
      links.map((link) =>
        fetch(link.href).then(
          (response) => (response.status >= 400 ? link.href : null),
          () => null
        )
      )
    ).then((brokenLinks) => brokenLinks.filter((link) => link !== null));
  }

  function checkCompression() {
    return fetch(window.location.href)
      .then((response) => {
        const encoding = response.headers.get("Content-Encoding");
        return encoding === "gzip" || encoding === "br";
      })
      .catch(() => false);
  }
  function checkRobotsTxt() {
    return new Promise((resolve) => {
      const url = new URL(window.location.href);
      const robotsTxtUrl = `${url.protocol}//${url.host}/robots.txt`;

      const xhr = new XMLHttpRequest();
      xhr.open('GET', robotsTxtUrl, true);

      xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      xhr.onerror = function () {
        resolve(false);
      };

      xhr.send(null);
    });
  }

  function checkSitemap() {
    const sitemapUrl = `${window.location.origin}/sitemap.xml`;
  
    return fetch(sitemapUrl)
      .then((response) => {
        return response.status >= 200 && response.status < 400;
      })
      .catch(() => false);
  }

  function checkCdn() {
    const cdnDomains = [
      "akamai.net",
      "akamaized.net",
      "cloudflare.com",
      "maxcdn.bootstrapcdn.com",
      "stackpath.bootstrapcdn.com",
      "fbcdn.net",
      "googleusercontent.com",
    ];

    return new Promise((resolve) => {
      const links = Array.from(document.getElementsByTagName("link"));
      const scripts = Array.from(document.getElementsByTagName("script"));

      const resources = links.concat(scripts);
      const cdnUsed = resources.some((resource) =>
        cdnDomains.some((cdnDomain) => resource.src && resource.src.includes(cdnDomain))
      );

      resolve(cdnUsed);
    });
  }

 Promise.all([
    getTitle(),
    getMetaDescription(),
    getPageLoadTime(),
    checkRobotsTxt(),
    checkSchema(),
    checkHttps(),
    checkDoctype(),
    checkLangAttribute(),
    getImagesWithoutAlt(),
    getBrokenLinks(),
    checkCompression(),
    checkCdn(),
    checkSitemap(),
  ]).then((results) => {
    const [
      title,
      metaDescription,
      pageLoadTime,
      schema,
      https,
      doctype,
      lang,
      imagesWithoutAlt,
      brokenLinks,
      compression,
      cdn,
      robotsTxt,
      sitemap,
    ] = results;

    chrome.runtime.sendMessage({
      action: "seo_results",
      data: {
        title: {
          present: title !== "",
        },
        metaDescription: {
          present: metaDescription !== "",
        },
        pageLoadTime: {
          value: pageLoadTime,
        },
        schema: {
          present: schema,
        },
        https: https,
        doctype: doctype,
        lang: lang,
        imagesWithoutAlt: imagesWithoutAlt,
        brokenLinks: brokenLinks,
        compression: compression,
        cdn: cdn,
        robotsTxt: robotsTxt,
        sitemap: sitemap,
      },
    });
  });
}

