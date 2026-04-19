const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.disable("etag");

const EXCLUDED_JSON_FILES = new Set([
  "package.json",
  "package-lock.json",
  "vercel.json",
]);

function getJsonDataFiles(directoryPath) {
  if (!directoryPath || !fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath)
    .filter(
      (fileName) =>
        fileName.endsWith(".json") && !EXCLUDED_JSON_FILES.has(fileName),
    );
}

function resolveDataSource() {
  const candidateDirectories = [
    process.cwd(),
    __dirname,
    path.join(process.cwd(), "api"),
    path.join(__dirname, "api"),
  ];

  for (const directoryPath of candidateDirectories) {
    const files = getJsonDataFiles(directoryPath);

    if (files.length > 0) {
      return {
        directoryPath,
        files,
      };
    }
  }

  return {
    directoryPath: process.cwd(),
    files: [],
  };
}

let { directoryPath: DATA_DIRECTORY, files: DATA_FILES } = resolveDataSource();

const FILE_ROUTE_ALIASES = {
  "/girlsData": "girlsData.json",
  "/girls8Data": "letter8Girls.json",
  "/indian_child_names": "indian_child_names.json",
  "/indianChildNames": "indian_child_names.json",
  "/dotiamnames": "dotiamnames.json",
  "/dotIamNames": "dotiamnames.json",
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
  "/new_data": "new_data.json",
};

function buildFileRoutes(fileNames) {
  const discoveredRoutes = Object.fromEntries(
    fileNames.map((fileName) => [
      `/${path.basename(fileName, ".json")}`,
      fileName,
    ]),
  );

  return {
    ...discoveredRoutes,
    ...FILE_ROUTE_ALIASES,
  };
}

let FILE_ROUTES = buildFileRoutes(DATA_FILES);

let cachedRecords = [];

function normalizeName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function extractName(blockValue) {
  if (typeof blockValue !== "string") {
    return "";
  }

  const rows = [...blockValue.matchAll(/<tr>(.*?)<\/tr>/gi)].map(
    (match) => match[1],
  );

  if (rows.length > 0) {
    const lastRowCells = [...rows[rows.length - 1].matchAll(/<td>(.*?)<\/td>/gi)]
      .map((match) =>
        match[1]
          .replace(/&nbsp;/gi, " ")
          .replace(/<[^>]+>/g, "")
          .trim(),
      )
      .filter(Boolean);

    if (lastRowCells.length > 0) {
      return lastRowCells.join(" ");
    }
  }

  const matches = [...blockValue.matchAll(/<td>(.*?)<\/td>/gi)].map((match) =>
    match[1]
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]+>/g, "")
      .trim(),
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
        name:
          typeof item.name === "string" && item.name.trim()
            ? item.name.trim()
            : extractName(item.name_g1_block),
        name_g1_block:
          typeof item.name_g1_block === "string" ? item.name_g1_block : "",
        name_g2_block:
          typeof item.name_g2_block === "string" ? item.name_g2_block : "",
        name_g3_block:
          typeof item.name_g3_block === "string" ? item.name_g3_block : "",
        g1tot: Number(item.g1tot),
        g2tot: Number(item.g2tot),
        g3tot: Number(item.g3tot),
        g1vtot: Number(item.g1vtot),
        g2vtot: Number(item.g2vtot),
        g3vtot: Number(item.g3vtot),
        g1nettot: Number(item.g1nettot),
        g2nettot: Number(item.g2nettot),
        g3nettot: Number(item.g3nettot),
        tot_letters: Number(item.tot_letters),
        dob_tot: Number(item.dob_tot),
      }))
      .filter((item) => item.name);
  });
}

function removeDuplicateRecords(records) {
  const seen = new Set();

  return records.filter((record) => {
    const key = [
      normalizeName(record.name),
      Number.isFinite(record.g2tot) ? record.g2tot : "",
      Number.isFinite(record.g3tot) ? record.g3tot : "",
      Number.isFinite(record.tot_letters) ? record.tot_letters : "",
    ].join("|");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function refreshCache() {
  const dataSource = resolveDataSource();

  DATA_DIRECTORY = dataSource.directoryPath;
  DATA_FILES = dataSource.files;
  FILE_ROUTES = buildFileRoutes(DATA_FILES);
  cachedRecords = removeDuplicateRecords(loadAllRecords());
}

function ensureCacheLoaded() {
  if (cachedRecords.length > 0) {
    return;
  }

  refreshCache();
}

function setNoCacheHeaders(res) {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  });
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

      .records {
        display: grid;
        gap: 18px;
      }

      .record-card {
        overflow-x: auto;
      }

      .record-name {
        margin: 0 0 10px;
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text);
        letter-spacing: 0.04em;
      }

      .matrix {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        border: 4px solid #ca8a04;
        background: rgba(255, 255, 255, 0.88);
      }

      .matrix th,
      .matrix td {
        border: 4px solid #ca8a04;
        padding: 10px 12px;
        vertical-align: top;
      }

      .matrix thead th,
      .metric-label {
        background: #16a34a;
        color: #fff;
        font-weight: 700;
      }

      .matrix tbody {
        color: #6d184b;
        font-weight: 700;
      }

      .block-cell table {
        width: 100%;
        border-collapse: collapse;
      }

      .block-cell td {
        padding: 6px 8px;
        border: 0;
        text-align: center;
        font-weight: 700;
      }

      .totals-line {
        color: #16a34a;
        font-size: 1.2rem;
        font-weight: 700;
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
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function renderResults(records) {
        if (!records.length) {
          resultsContent.className = "empty";
          resultsContent.textContent = "No results found for the filters you entered.";
          return;
        }

        resultsContent.className = "records";
        resultsContent.innerHTML = records.map((record) => [
          '<article class="record-card">',
          '  <h3 class="record-name">' + escapeHtml(record.name || 'Unnamed') + '</h3>',
          '  <table class="matrix">',
          '    <thead>',
          '      <tr>',
          '        <th>Grp.</th>',
          '        <th>Name Block</th>',
          '        <th>Total</th>',
          '        <th>V</th>',
          '        <th>C</th>',
          '      </tr>',
          '    </thead>',
          '    <tbody>',
          '      <tr>',
          '        <td class="metric-label">C</td>',
          '        <td class="block-cell"><table>' + (record.name_g2_block || '') + '</table></td>',
          '        <td class="metric-label">' + escapeHtml(Number.isFinite(record.g2tot) ? record.g2tot : 0) + '</td>',
          '        <td class="metric-label">' + escapeHtml(Number.isFinite(record.g2vtot) ? record.g2vtot : 0) + '</td>',
          '        <td class="metric-label">' + escapeHtml(Number.isFinite(record.g2nettot) ? record.g2nettot : 0) + '</td>',
          '      </tr>',
          '      <tr>',
          '        <td class="metric-label">P</td>',
          '        <td class="block-cell"><table>' + (record.name_g3_block || '') + '</table></td>',
          '        <td class="metric-label">' + escapeHtml(Number.isFinite(record.g3tot) ? record.g3tot : 0) + '</td>',
          '        <td class="metric-label">' + escapeHtml(Number.isFinite(record.g3vtot) ? record.g3vtot : 0) + '</td>',
          '        <td class="metric-label">' + escapeHtml(Number.isFinite(record.g3nettot) ? record.g3nettot : 0) + '</td>',
          '      </tr>',
          '    </tbody>',
          '  </table>',
          '  <div class="totals-line">Total Letters - ' + escapeHtml(Number.isFinite(record.tot_letters) ? record.tot_letters : 0) + '</div>',
          '</article>'
        ].join('')).join('');
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
          const response = await fetch('/search?' + params.toString(), {
            cache: 'no-store'
          });

          if (!response.ok) {
            throw new Error("Search request failed.");
          }

          const payload = await response.json();
          statusText.textContent = payload.count + ' matching name' + (payload.count === 1 ? '' : 's') + ' found.';
          renderResults(payload.records || []);
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
  setNoCacheHeaders(res);
  res.type("html").send(createHomePage());
});

app.get("/search", (req, res) => {
  setNoCacheHeaders(res);
  ensureCacheLoaded();

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

  if (DATA_FILES.length === 0) {
    res
      .status(500)
      .json({ error: "No JSON data files were found on the server." });
    return;
  }

  const records = removeDuplicateRecords(cachedRecords.filter((item) => {
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
  }));

  res.json({
    count: records.length,
    records,
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

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
