"use strict";

const puppeteer = require("puppeteer");

function _delay(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

class Renderer {
  constructor(browser) {
    this.browser = browser;
  }

  async createPage(url, options) {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const viewportWidth = options.viewportWidth ? parseInt(options.viewportWidth, 10) : 800;
    await page.setViewport({ width: viewportWidth, height: 600, deviceScaleFactor: 2 });

    if (options.waitForSelector) {
      console.log("wait for ", options.waitForSelector);
      await page.waitForSelector(options.waitForSelector, { visible: true });
    }

    if (options.delay) {
      await _delay(parseInt(options.delay, 10));
    }

    return page;
  }

  async render(url, options) {
    let page = null;
    try {
      page = await this.createPage(url, options);
      const html = await page.content();
      return html;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async pdf(url, options) {
    let page = null;
    try {
      page = await this.createPage(url, options);
      const buffer = await page.pdf({ format: "A4" });
      return buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async screenshot(url, options) {
    let page = null;
    try {
      page = await this.createPage(url, options);
      const buffer = await page.screenshot({ fullPage: true });
      return buffer;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}

async function create() {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  return new Renderer(browser);
}

module.exports = create;
