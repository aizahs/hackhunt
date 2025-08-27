

const express = require("express");
const cheerio = require("cheerio");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();


app.use(morgan("dev"));
app.use(cors());

 
app.use(express.static(path.join(__dirname, "public")));

const CACHE_TTL_MS = 5 * 60 * 1000; 
let cache = { html: null, ts: 0, season: "2025" };


async function fetchMLH(season = "2025") {
  const fresh = Date.now() - cache.ts < CACHE_TTL_MS && cache.season === season;
  if (cache.html && fresh) return cache.html;

  const url = `https://mlh.io/seasons/${season}/events`;
  const res = await fetch(url, {
    headers: { "User-Agent": "hackhunt/1.0 (educational demo)" },
  });
  if (!res.ok) {
    throw new Error(`MLH fetch failed: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  cache = { html, ts: Date.now(), season };
  return html;
}

function parseEvents(html) {
  const $ = cheerio.load(html);
  const items = [];

 
  $(".event").each((_, el) => {
    const title = $(el).find(".event-name").text().trim();
    const url = $(el).find("a").attr("href") || "";
    const location = $(el).find(".event-location").text().trim();
    const dateStr = $(el).find(".event-date").text().trim();
    const online = /online/i.test(location) || /online/i.test($(el).text());

   
    const month = (dateStr.match(/[A-Za-z]{3,}/)?.[0] || "").slice(0, 3).toUpperCase();
    const day = (dateStr.match(/\b\d{1,2}\b/) || [])[0] || "";

    items.push({ title, url, location, dateStr, online, month, day });
  });

  return items;
}

app.get("/api/mlh", async (req, res) => {
  try {
    const city = (req.query.city || "").toString().trim().toLowerCase();
    const season = (req.query.season || "2025").toString();

    const html = await fetchMLH(season);
    const all = parseEvents(html);

    const results = city
      ? all.filter(ev => ev.location.toLowerCase().includes(city))
      : all;

    res.json({ count: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch MLH events." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HackHunt running → http://localhost:${PORT}`);
});
