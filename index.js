const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());

const DATA_DIRECTORY = __dirname;
const DATA_FILES = fs
  .readdirSync(DATA_DIRECTORY)
  .filter(
    (fileName) =>
      fileName.endsWith(".json") &&
      fileName !== "package.json" &&
      fileName !== "package-lock.json",
  );

const FILE_ROUTES = {
  "/girlsData": "girlsData.json",
  "/girls8Data": "letter8Girls.json",
  "/naamhinaamGirls": "naamHiNaamGirls.json",
  "/namesLookGirlNames": "namesLookGirlNames.json",
  "/babyGirlNamesEasy1": "babyGirlNamesEasy1.json",
  "/babyGirlNamesEasy2": "babyGirlNamesEasy2.json",
  "/babyGirlNamesEasy3": "babyGirlNamesEasy3.json",
  "/babyBoyNamesEasy1": "babyBoyNamesEasy1.json",
  "/babyBoyNamesEasy2": "babyBoyNamesEasy2.json",
  "/babyBoyNamesEasy3": "babyBoyNamesEasy3.json",
  "/babyBoyNamesEasy4": "babyBoyNamesEasy4.json",
  "/sixor7girlNames": "sixor7girlNames.json",
  "/bulkBoyData": "bulkBoyData.json",
  "/only5letterBoynames": "only5letterBoynames.json",
  "/only6letterBoynames": "sixboynames.json",
  "/easybabynames": "easybabynames.json",
  "/nameslook": "nameslook.json",
  "/angelsname": "angelsname.json",
};

let cachedRecords = [];

function extractName(blockValue) {
  if (typeof blockValue !== "string") {
    return "";
  }

  const matches = [...blockValue.matchAll(/<td>(.*?)<\/td>/gi)].map((match) =>
    match[1].trim(),
  );

  if (matches.length === 0) {
    return "";
  }

  return matches[matches.length - 1];
}

function loadAllRecords() {
  return DATA_FILES.flatMap((fileName) => {
    const filePath = path.join(DATA_DIRECTORY, fileName);
    const rawContent = fs.readFileSync(filePath, "utf8");
    const parsedContent = JSON.parse(rawContent);

    if (!Array.isArray(parsedContent)) {
      return [];
    }

    return parsedContent
      .map((item) => ({
        fileName,
        name: extractName(item.name_g1_block),
        g2tot: Number(item.g2tot),
        g3tot: Number(item.g3tot),
        tot_letters: Number(item.tot_letters),
      }))
      .filter((item) => item.name);
  });
}

function refreshCache() {
  cachedRecords = loadAllRecords();
}

function createHomePage() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Name Search</title>
    <style>
      :root {
        --bg: #f4ede2;
        --panel: rgba(255, 252, 246, 0.92);
        --panel-border: rgba(107, 72, 45, 0.16);
        --text: #2f241d;
        --muted: #6e5a49;
        --accent: #8f4f2d;
        --accent-dark: #6d3b20;
        --shadow: 0 24px 70px rgba(66, 38, 21, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(196, 143, 98, 0.24), transparent 28%),
          radial-gradient(circle at bottom right, rgba(143, 79, 45, 0.18), transparent 26%),
          linear-gradient(135deg, #f7f0e5 0%, #efe2cf 48%, #e8d7c3 100%);
        padding: 32px 18px;
      }

      .shell {
        width: min(980px, 100%);
        margin: 0 auto;
      }

      .hero {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 28px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .hero-top {
        padding: 34px 28px 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0));
      }

      .eyebrow {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--accent);
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 5vw, 3.8rem);
        line-height: 0.95;
        font-weight: 700;
      }

      .intro {
        margin: 16px 0 0;
        max-width: 700px;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--muted);
      }

      .content {
        padding: 20px 28px 30px;
      }

      form {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        align-items: end;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text);
      }

      .field {
        display: flex;
        flex-direction: column;
      }

      input {
        width: 100%;
        border: 1px solid rgba(107, 72, 45, 0.18);
        border-radius: 16px;
        padding: 15px 16px;
        font: inherit;
        font-size: 1rem;
        background: rgba(255, 255, 255, 0.94);
        color: var(--text);
        transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }

      input:focus {
        outline: none;
        border-color: rgba(143, 79, 45, 0.45);
        box-shadow: 0 0 0 5px rgba(143, 79, 45, 0.1);
        transform: translateY(-1px);
      }

      .actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 6px;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 14px 24px;
        font: inherit;
        font-size: 0.98rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
        color: #fff9f2;
        cursor: pointer;
        box-shadow: 0 16px 32px rgba(109, 59, 32, 0.24);
        transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      }

      button:hover {
        transform: translateY(-1px);
        box-shadow: 0 20px 36px rgba(109, 59, 32, 0.28);
      }

      button:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .hint {
        color: var(--muted);
        font-size: 0.94rem;
      }

      .results {
        margin-top: 28px;
        border-top: 1px solid rgba(107, 72, 45, 0.12);
        padding-top: 24px;
      }

      .results-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .results-head h2 {
        margin: 0;
        font-size: 1.25rem;
      }

      .status {
        margin: 0;
        color: var(--muted);
      }

      .empty {
        padding: 18px 20px;
        border-radius: 18px;
        background: rgba(143, 79, 45, 0.07);
        color: var(--text);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.78);
      }

      th,
      td {
        padding: 14px 16px;
        text-align: left;
      }

      thead {
        background: rgba(143, 79, 45, 0.1);
      }

      tbody tr:nth-child(even) {
        background: rgba(255, 250, 243, 0.72);
      }

      .name-cell {
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0.03em;
      }

      @media (max-width: 760px) {
        .hero-top,
        .content {
          padding-left: 18px;
          padding-right: 18px;
        }

        form {
          grid-template-columns: 1fr;
        }

        button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="hero-top">
          <p class="eyebrow">Name Filter</p>
          <h1>Search names across every dataset.</h1>
          <p class="intro">
            Enter Chaldean number, Pythagorean number, and total letters. Matching names from all JSON files will appear below.
          </p>
        </div>
        <div class="content">
          <form id="search-form">
            <div class="field">
              <label for="g2tot">Chaldean Number</label>
              <input id="g2tot" name="g2tot" type="number" min="0" inputmode="numeric" placeholder="Matches g2tot" />
            </div>
            <div class="field">
              <label for="g3tot">Pythagorean Number</label>
              <input id="g3tot" name="g3tot" type="number" min="0" inputmode="numeric" placeholder="Matches g3tot" />
            </div>
            <div class="field">
              <label for="tot_letters">Total Letters</label>
              <input id="tot_letters" name="tot_letters" type="number" min="0" inputmode="numeric" placeholder="Matches tot_letters" />
            </div>
            <div class="actions">
              <button id="submit-button" type="submit">Show Matching Names</button>
              <span class="hint">You can fill one, two, or all three fields.</span>
            </div>
          </form>

          <section class="results" aria-live="polite">
            <div class="results-head">
              <h2>Results</h2>
              <p id="status" class="status">Submit the form to see matches.</p>
            </div>
            <div id="results-content" class="empty">Only matching names will be shown here.</div>
          </section>
        </div>
      </section>
    </main>

    <script>
      const form = document.getElementById("search-form");
      const submitButton = document.getElementById("submit-button");
      const resultsContent = document.getElementById("results-content");
      const statusText = document.getElementById("status");

      function escapeHtml(value) {
        return value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function renderResults(names) {
        if (!names.length) {
          resultsContent.className = "empty";
          resultsContent.textContent = "No matching names were found for the values you entered.";
          return;
        }

        resultsContent.className = "";
        resultsContent.innerHTML = [
          '<table>',
          '  <thead>',
          '    <tr>',
          '      <th>Name</th>',
          '    </tr>',
          '  </thead>',
          '  <tbody>',
          names.map((name) => '<tr><td class="name-cell">' + escapeHtml(name) + '</td></tr>').join(''),
          '  </tbody>',
          '</table>'
        ].join('');
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
          if (value !== "") {
            params.set(key, value);
          }
        }

        if (!params.toString()) {
          statusText.textContent = "Enter at least one number to filter the names.";
          resultsContent.className = "empty";
          resultsContent.textContent = "The search needs at least one value.";
          return;
        }

        submitButton.disabled = true;
        statusText.textContent = "Searching all datasets...";

        try {
          const response = await fetch('/search?' + params.toString());

          if (!response.ok) {
            throw new Error("Search request failed.");
          }

          const payload = await response.json();
          statusText.textContent = payload.count + ' matching name' + (payload.count === 1 ? '' : 's') + ' found.';
          renderResults(payload.names);
        } catch (error) {
          statusText.textContent = "Search failed.";
          resultsContent.className = "empty";
          resultsContent.textContent = "There was a problem loading the matching names.";
        } finally {
          submitButton.disabled = false;
        }
      });
    </script>
  </body>
</html>`;
}

function sendJsonFile(fileName) {
  return (req, res, next) => {
    const options = {
      root: DATA_DIRECTORY,
    };

    res.sendFile(fileName, options, (error) => {
      if (error) {
        next(error);
        return;
      }

      console.log("Sent:", fileName);
    });
  };
}

refreshCache();

app.get("/", (req, res) => {
  res.type("html").send(createHomePage());
});

app.get("/search", (req, res) => {
  const rawG2 = req.query.g2tot;
  const rawG3 = req.query.g3tot;
  const rawLetters = req.query.tot_letters;

  const filters = {
    g2tot: rawG2 === undefined ? null : Number(rawG2),
    g3tot: rawG3 === undefined ? null : Number(rawG3),
    tot_letters: rawLetters === undefined ? null : Number(rawLetters),
  };

  const hasAtLeastOneFilter = Object.values(filters).some(
    (value) => value !== null,
  );
  const hasInvalidFilter = Object.values(filters).some(
    (value) => value !== null && Number.isNaN(value),
  );

  if (!hasAtLeastOneFilter) {
    res.status(400).json({ error: "At least one filter is required." });
    return;
  }

  if (hasInvalidFilter) {
    res.status(400).json({ error: "All filters must be valid numbers." });
    return;
  }

  const names = [
    ...new Set(
      cachedRecords
        .filter((item) => {
          if (filters.g2tot !== null && item.g2tot !== filters.g2tot) {
            return false;
          }

          if (filters.g3tot !== null && item.g3tot !== filters.g3tot) {
            return false;
          }

          if (
            filters.tot_letters !== null &&
            item.tot_letters !== filters.tot_letters
          ) {
            return false;
          }

          return true;
        })
        .map((item) => item.name),
    ),
  ];

  res.json({
    count: names.length,
    names,
  });
});

Object.entries(FILE_ROUTES).forEach(([routePath, fileName]) => {
  app.get(routePath, sendJsonFile(fileName));
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
