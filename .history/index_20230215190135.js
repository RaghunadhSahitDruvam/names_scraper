const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
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

  await page.goto("https://indianhindunames.com/indian-hindu-girl-name-a.htm");
  for (let i = 1; i < 3; i++) {
    await page.waitForSelector(
      `body > div:nth-child(6) > div > div.col-lg-10 > div > div.col-lg-7.nl > ul > li:nth-child(${i})`
    );
    let element = await page.$(
      `body > div:nth-child(6) > div > div.col-lg-10 > div > div.col-lg-7.nl > ul > li:nth-child(${i})`
    );
    let value = await page.evaluate((el) => el.textContent, element);
    value = value.split(" = ", 1)[0];

    // let fetchUrl = `https://zeppoh.com/convert?name=${value}`;
    // fetch(fetchUrl)
    //   .then((res) => res.json())
    //   .then((d) => data.push(d));
    // console.log(data);
    console.log(val);
  }

  await browser.close();
})();
app.get("/", function (req, res) {
  res.status(200).json(data);
});
app.listen(5173, () => {
  console.log("Yes iam running on port 5173");
});
