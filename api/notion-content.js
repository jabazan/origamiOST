// Función serverless de Vercel para obtener contenido de una página de Notion
// Esta función obtiene los bloques (contenido) de una página específica

const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY;

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptar GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pageId = req.query.pageId;

  if (!pageId) {
    return res.status(400).json({ error: 'pageId is required' });
  }

  // Validar credencial
  if (!NOTION_API_KEY) {
    console.error('❌ NOTION_API_KEY no configurado');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log('📄 Obteniendo contenido de página:', pageId);

    // Obtener bloques de la página
    const blocksData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.notion.com',
        path: `/v1/blocks/${pageId}/children?page_size=100`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        }
      };

      const notionReq = https.request(options, (notionRes) => {
        let data = '';
        notionRes.on('data', chunk => data += chunk);
        notionRes.on('end', () => {
          console.log('✅ Bloques obtenidos (status:', notionRes.statusCode, ')');
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      notionReq.on('error', reject);
      notionReq.end();
    });

    return res.status(200).json(blocksData);
  } catch (error) {
    console.error('❌ Error obteniendo contenido:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
