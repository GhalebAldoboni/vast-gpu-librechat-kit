import { createServer } from 'node:http';

const port = Number.parseInt(process.env.PORT ?? '3090', 10);

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractXmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return decodeHtml(match?.[1] ?? '');
}

async function search(query) {
  const url = new URL('https://www.bing.com/search');
  url.searchParams.set('format', 'rss');
  url.searchParams.set('q', query);

  const response = await fetch(url, {
    headers: {
      accept: 'application/rss+xml, application/xml, text/xml',
      'user-agent': 'Mozilla/5.0 LibreChatLocalSearch/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Bing RSS returned ${response.status}`);
  }

  const rss = await response.text();
  return [...rss.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 10).map((match) => ({
    title: extractXmlValue(match[1], 'title'),
    url: extractXmlValue(match[1], 'link'),
    content: extractXmlValue(match[1], 'description'),
    publishedDate: extractXmlValue(match[1], 'pubDate'),
    engine: 'bing-rss',
    engines: ['bing-rss'],
    category: 'general',
  }));
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);

  if (requestUrl.pathname !== '/search') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  const query = requestUrl.searchParams.get('q')?.trim();
  if (!query) {
    sendJson(res, 400, { error: 'Missing q parameter' });
    return;
  }

  try {
    sendJson(res, 200, {
      query,
      number_of_results: 10,
      results: await search(query),
      suggestions: [],
      answers: [],
      corrections: [],
      infoboxes: [],
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Local SearXNG-compatible search proxy: http://127.0.0.1:${port}/search`);
});
