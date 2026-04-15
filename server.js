const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const NOTION_API_KEY = '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';
const NOTION_DATABASE_ID = '3428fd6ff3da80ea852cde1f44dd6e66';

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Servir index.html
  if (req.url === '/' || req.url === '/index.html') {
    try {
      let html = fs.readFileSync('index.html', 'utf-8');
      // Inyectar el servidor proxy en el HTML
      const proxyScript = `
        <script>
          window.NOTION_PROXY_URL = 'http://localhost:${PORT}/api/notion';
        </script>
      `;
      html = html.replace('</head>', `${proxyScript}</head>`);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (err) {
      res.writeHead(500);
      res.end('Error loading index.html');
    }
    return;
  }

  // Proxy a Notion
  if (req.url === '/api/notion' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const notionReq = require('https').request(
          {
            hostname: 'api.notion.com',
            path: `/v1/databases/${NOTION_DATABASE_ID}/query`,
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${NOTION_API_KEY}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body)
            }
          },
          (notionRes) => {
            let data = '';
            notionRes.on('data', chunk => data += chunk);
            notionRes.on('end', () => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(data);
            });
          }
        );

        notionReq.on('error', err => {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        });

        notionReq.write(body);
        notionReq.end();
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Otros archivos
  const filePath = path.join(__dirname, req.url);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200);
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('Not found');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Odoo Scope Tool - Servidor iniciado   ║
╚════════════════════════════════════════╝

🌐 Abre: http://localhost:${PORT}

✓ Proxy Notion configurado
✓ CORS habilitado

💡 Ctrl+C para detener
  `);
});
