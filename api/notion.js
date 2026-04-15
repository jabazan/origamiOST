// Función serverless de Vercel para proxy a Notion API
// Esta función maneja las llamadas a la API de Notion de forma segura

const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validar credenciales
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error('❌ Credenciales de Notion no configuradas');
    console.error('NOTION_API_KEY:', NOTION_API_KEY ? 'definido' : 'FALTA');
    console.error('NOTION_DATABASE_ID:', NOTION_DATABASE_ID ? 'definido' : 'FALTA');
    return res.status(500).json({ error: 'Server configuration error - missing credentials' });
  }

  try {
    const body = JSON.stringify(req.body);
    console.log('📡 Petición a Notion:', body.substring(0, 100));
    console.log('📍 Database ID:', NOTION_DATABASE_ID);

    // Hacer petición a Notion API
    const notionData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.notion.com',
        path: `/v1/databases/${NOTION_DATABASE_ID}/query`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const notionReq = https.request(options, (notionRes) => {
        let data = '';
        notionRes.on('data', chunk => data += chunk);
        notionRes.on('end', () => {
          console.log('✅ Respuesta de Notion (status:', notionRes.statusCode, '):', data);
          try {
            const parsed = JSON.parse(data);
            console.log('📊 Parsed data:', JSON.stringify(parsed).substring(0, 200));
            resolve(parsed);
          } catch (e) {
            console.error('❌ Error parsing Notion response:', e.message);
            reject(e);
          }
        });
      });

      notionReq.on('error', reject);
      notionReq.write(body);
      notionReq.end();
    });

    return res.status(200).json(notionData);
  } catch (error) {
    console.error('❌ Error en proxy de Notion:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
