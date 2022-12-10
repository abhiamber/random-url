const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const ShortUrlModel = require("./models/shortUrl");
mongoose.set("strictQuery", true);
let connect = async () => {
  return mongoose.connect("mongodb://localhost:27017/ShortUrldb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
const app = express();

const Redis = require("ioredis");
// const redis = new Redis();

//*********************/ redis connection****************************
const redis = new Redis({
  port: 19976, // Redis port
  host: "redis-19976.c212.ap-south-1-1.ec2.cloud.redislabs.com", // Redis host
  username: "default", // needs Redis >= 6
  password: "9EXqExg917PU7CRTebFFgqeWu1AGHbuo",
  db: 0, // Defaults to 0
});

// app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// ******************render index.html********************
app.get("/", async (req, res) => {
  //   const shortUrls = await ShortUrlModel.find();
  //   res.render("index");
  res.sendFile(__dirname + "/index.html");
  //   res.render("index");
});

// *******************************when page will refresh thing api will give all urls**********************
app.get("/renderllurl", async (req, res) => {
  const shortUrls = await ShortUrlModel.find();
  try {
    console.log(shortUrls);
    return res.status(201).send(shortUrls);
  } catch (e) {
    return res.send(e.message);
  }
});

// **************To Create new short links**************
// Here i am createing short random string by shortId npm package to give random string by default and unique is true in Schema******
// so i am not checking that manually.  is that random string is exisiting or not.

// or I can do like ................
// In this file i could do like  we can generate new id and will check  that id is in exising shorturl if exist then we will generate new one again otherwise i will set it.

app.post("/shortUrls", async (req, res) => {
  let { fullUrl } = req.body;
  //   console.log(fullUrl);
  //   res.send(req.body);
  try {
    let newShortUrl = new ShortUrlModel({ full: fullUrl });
    await newShortUrl.save();

    const shortUrls = await ShortUrlModel.find();
    try {
      return res.send(shortUrls);
    } catch (e) {
      return res.send(e.message);
    }

    // console.log(newShortUrl);
  } catch (e) {
    console.log(e.message);
    return res.send(e.message);
  }
});

// increasing cilck***************
app.get("/:shortUrl", async (req, res) => {
  let { shortUrl } = req.params;
  shortUrl = `http://localhost:5000/${shortUrl}`;
  console.log(shortUrl);
  const shortUrls = await ShortUrlModel.findOne({ short: shortUrl });
  if (shortUrls == null) return res.sendStatus(404);

  //   shortUrls.clicks++;
  //   shortUrls.save();
  let diff = Date.now() - shortUrls.time;
  console.log(diff);
  if (diff >= 600000) {
    return res.send("url not exists");
  } else {
    return res.send(shortUrls.full);
  }
});

app.listen(5000, async () => {
  await connect();
  console.log("working");
});
