import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const PORT = Number(process.env.PORT ?? 4010);

async function readJson(file) {
  const content = await fs.readFile(path.join(cwd, "data", file), "utf-8");
  return JSON.parse(content);
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) return sendJson(res, { error: "Missing URL" }, 400);

    const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = requestUrl.pathname;

    const [bundle, sources, reports] = await Promise.all([
      readJson("bundle.json"),
      readJson("source-catalog.json"),
      readJson("reports.json")
    ]);

    if (pathname === "/api/health") {
      return sendJson(res, { ok: true, now: new Date().toISOString() });
    }

    if (pathname === "/api/sources") {
      const category = requestUrl.searchParams.get("category");
      const payload = category ? sources.filter((item) => item.category === category) : sources;
      return sendJson(res, payload);
    }

    if (pathname === "/api/briefs") {
      return sendJson(res, reports.sort((a, b) => b.month.localeCompare(a.month)));
    }

    if (pathname.startsWith("/api/briefs/")) {
      const month = pathname.split("/").pop();
      const brief = reports.find((item) => item.month === month);
      return brief ? sendJson(res, brief) : sendJson(res, { error: "Brief not found" }, 404);
    }

    if (pathname === "/api/records") {
      const category = requestUrl.searchParams.get("category");
      const month = requestUrl.searchParams.get("month");
      const tableMap = {
        policy: bundle.policies,
        debt: bundle.debt,
        news: bundle.news,
        paper: bundle.papers
      };

      if (!category || !(category in tableMap)) {
        return sendJson(res, { error: "category must be one of policy, debt, news, paper" }, 400);
      }

      const rows = tableMap[category].filter((item) => !month || String(item.date ?? `${item.year}-01-01`).slice(0, 7) === month);
      return sendJson(res, rows);
    }

    if (pathname === "/api/dashboard") {
      return sendJson(res, {
        metadata: bundle.metadata,
        counts: {
          policies: bundle.policies.length,
          debt: bundle.debt.length,
          news: bundle.news.length,
          papers: bundle.papers.length,
          briefs: reports.length,
          sources: sources.length
        }
      });
    }

    return sendJson(res, { error: "Not found" }, 404);
  } catch (error) {
    return sendJson(res, { error: error instanceof Error ? error.message : "unknown error" }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
