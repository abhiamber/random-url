const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const shortId = require("shortid");

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

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// ******************render index.html********************
app.get("/", async (req, res) => {
  //   const shortUrls = await ShortUrlModel.find();
  res.render("index");
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
  let randomurl = shortId.generate();

  redis.set(fullUrl, `http://localhost:5000/${randomurl}`);
  //   redis.expire(fullUrl, 60);
  redis.set(`http://localhost:5000/${randomurl}`, fullUrl);
  console.log({ fullUrl, randomurl });
  return res.send({ fullUrl, randomurl });
});

// increasing cilck***************
app.get("/:shortUrl", async (req, res) => {
  let { shortUrl } = req.params;
  shortUrl = `http://localhost:5000/${shortUrl}`;

  redis.ttl("token", (err, result) => {
    console.log(result);
    if (result > 0) {
      redis.get("shortUrl", (err, results) => {
        console.log(results);
        return res.send(results);
      });
    } else {
      return res.send(" expired");
    }
  });
});

app.listen(5000, async () => {
  console.log("working");
});
