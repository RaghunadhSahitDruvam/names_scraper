const puppeteer = require("puppeteer-extra");

const express = require("express");
const cors = require("cors");
// require executablePath from puppeteer
const { executablePath } = require("puppeteer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();

app.use(cors());
let data = [];
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  await page.goto(
    "https://645f6ceb23d90c2d6ec695e5--incredible-piroshki-2bcc45.netlify.app/"
  );
  for (let i = 1; i < 1100; i++) {
    // #root > div > tr:nth-child(200)
    await page.waitForSelector(`#root > div > tr:nth-child(${i})`);
    // await page.setDefaultNavigationTimeout(0);

    let element = await page.$(`#root > div > tr:nth-child(${i})`);
    let value = await page.evaluate((el) => el.textContent, element);
    value = value.split("=", 1)[0];
    value = value.split("/", 1)[0];
    value = value.split(",", 1)[0];
    value = value.split("'", 1)[0];
    value = value.split("(", 1)[0];
    value = value.split("-", 1)[0];

    value = value
      .replaceAll("-", "")
      .replaceAll(".", " ")
      .replaceAll("{", "")
      .replaceAll("}", "")
      .replaceAll("( ", "")
      .replaceAll(" )", "")
      .replaceAll("(", "")
      .replaceAll(")", "")
      .replaceAll("  ", " ")
      .replaceAll("'", "")
      .replaceAll("&", "and")
      .replaceAll("3", "c")
      .replaceAll(`"`, "")
      .replaceAll(`  `, "")
      .replaceAll("2", "b")
      .replaceAll("1", "a")
      .replaceAll("LTD", "")
      .replaceAll("Ltd", "")
      .replaceAll("ltd", "")
      .replaceAll("Limited", "")
      .replaceAll("LIMITED", "");

    let fetchUrl = `https://zeppoh.com/convert?name=${value}`;

    fetch(fetchUrl)
      .then((res) => res.json())
      .then((d) => data.push(d));
    console.log(data);
  }

  await browser.close();
})();
app.get("/", function (req, res) {
  res.status(200).json(data);
});
app.listen(5173, () => {
  console.log("Yes iam running on port 5173");
});
