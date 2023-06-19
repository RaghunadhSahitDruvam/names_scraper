const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const path = require("path");
app.get("/", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "data.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/girlsData", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "girlsData.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});

app.get("/girls8Data", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "letter8Girls.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/naamhinaamGirls", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "naamHiNaamGirls.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/namesLookGirlNames", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "namesLookGirlNames.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/babyGirlNamesEasy1", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyGirlNamesEasy1.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/babyGirlNamesEasy2", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyGirlNamesEasy2.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/babyGirlNamesEasy3", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyGirlNamesEasy3.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/babyBoyNamesEasy1", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyBoyNamesEasy1.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});

app.get("/babyBoyNamesEasy2", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyBoyNamesEasy2.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/babyBoyNamesEasy3", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyBoyNamesEasy3.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});

app.get("/babyBoyNamesEasy4", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "babyBoyNamesEasy4.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/sixor7girlNames", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "sixor7girlNames.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/bulkBoyData", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "bulkBoyData.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
app.get("/only5letterBoynames", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "only5letterBoynames.json";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log("App is Running...");
});
