const puppeteer = require("puppeteer-extra");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
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
    "https://646b05a2d4f25f27a3a83a12--strong-tartufo-21ea58.netlify.app/"
  );
  //28320
  for (let i = 1; i < 5971; i++) {
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
      .replaceAll("Bríet", "bhuja")
      .replaceAll("Björg", "bhoja")
      .replaceAll("Björk", "bindu")

      .replaceAll("SharÃ»", "sharda")
      .replaceAll("SinadÃ©vi", "Saindhavi")
      .replaceAll("DakshayajÃ±avinaashin", "Dakshayajvinaashin")
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

    axios(`https://zeppoh.com/convert?name=${value}`)
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
// const express = require("express");
// const cors = require("cors");
// const app = express();
// app.use(cors());
// const path = require("path");
// app.get("/", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "data.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// app.get("/girlsData", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "girlsData.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });

// app.get("/girls8Data", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "letter8Girls.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// app.get("/naamhinaamGirls", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "naamHiNaamGirls.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// app.get("/namesLookGirlNames", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "namesLookGirlNames.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// app.get("/babyGirlNamesEasy1", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "babyGirlNamesEasy1.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// app.get("/babyGirlNamesEasy2", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "babyGirlNamesEasy2.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// app.get("/babyGirlNamesEasy3", (req, res) => {
//   const options = {
//     root: path.join(__dirname),
//   };
//   const fileName = "babyGirlNamesEasy3.json";
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// });
// const PORT = 3000 || process.env.PORT;
// app.listen(PORT, () => {
//   console.log("App is Running...");
// });
