import { splitEvents } from "./lib/events.js";
import QRCode from "qrcode";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "styles.css": "styles.css",
    "theme.js": "theme.js",
    "print-dark.css": "print-dark.css",
    "src/images": "images",
  });

  eleventyConfig.addCollection("schedule", (api) =>
    splitEvents(api.getFilteredByGlob("src/events/*.md"), new Date())
  );

  eleventyConfig.addFilter("datefmt", (d) =>
    new Date(d).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  eleventyConfig.addNunjucksAsyncShortcode("qr", async (text) =>
    QRCode.toString(text, { type: "svg", margin: 1 })
  );

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
