"use strict";

const express = require("express");
const createRenderer = require("./renderer");

const port = process.env.PORT || 3000;

const app = express();

let renderer = null;

// Configure.
app.disable("x-powered-by");

// Render url.
app.use(async (req, res, next) => {
  let url = req.query.url;

  if (!url) {
    return res
      .status(400)
      .send("Search with url parameter. For eaxample, ?url=http://yourdomain");
  }

  if (!url.includes("://")) {
    url = `http://${url}`;
  }

  try {
    const options = {};
    for (const field of ["waitForSelector", "delay", "viewportWidth", "viewportHeight"]) {
      if (req.query[field]) {
        options[field] = req.query[field];
      }
    }
    console.log("req.query", req.query);
    console.log("options", options);

    switch (req.query.type) {
      case "pdf":
        const pdf = await renderer.pdf(url, options);
        res.set("Content-type", "application/pdf").send(pdf);
        break;

      case "screenshot":
        const image = await renderer.screenshot(url, options);
        res.set("Content-type", "image/png").send(image);
        break;

      default:
        const html = await renderer.render(url, options);
        res.status(200).send(html);
    }
  } catch (e) {
    next(e);
  }
});

// Error page.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Oops, An expected error seems to have occurred.");
});

// Create renderer and start server.
createRenderer()
  .then(createdRenderer => {
    renderer = createdRenderer;
    console.info("Initialized renderer.");

    app.listen(port, () => {
      console.info(`Listen port on ${port}.`);
    });
  })
  .catch(e => {
    console.error("Fail to initialze renderer.", e);
  });
