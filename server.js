const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const NOTION_API_KEY = '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';
const NOTION_DATABASE_ID = '3428fd6ff3da80ea852cde1f44dd6e66';
const PROJECT_DIR = path.dirname(__filename);

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
      let html = fs.readFileSync(path.join(PROJECT_DIR, 'index.html'), 'utf-8');
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
      console.error('Error loading index.html:', err.message);
      console.error('Looking for file at:', path.join(PROJECT_DIR, 'index.html'));
      res.writeHead(500);
      res.end('Error loading index.html: ' + err.message);
    }
    return;
  }

  // Proxy a Notion
  if (req.url === '/api/notion' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        console.log('📡 Petición a Notion:', body);
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
              console.log('✅ Respuesta de Notion:', data.substring(0, 200) + '...');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(data);
            });
          }
        );

        notionReq.on('error', err => {
          console.error('❌ Error en Notion:', err.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        });

        notionReq.write(body);
        notionReq.end();
      } catch (err) {
        console.error('❌ Error en try/catch:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Otros archivos
  const filePath = path.join(PROJECT_DIR, req.url);
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
