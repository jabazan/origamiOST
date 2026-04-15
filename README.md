# Odoo Scope Tool - Notion Integration

Herramienta de relevamiento de alcance para Odoo que carga dinámicamente preguntas desde una base de datos de Notion.

## Características

- 📊 **251 preguntas** desde Notion
- 🔐 **Credenciales seguras** en variables de entorno
- ⚡ **Cero servidores** - Despliega en Vercel gratis
- 💾 **Caché local** - Funciona offline después de la primera carga
- 🔄 **Actualización dinámica** - Cambios en Notion reflejados automáticamente

## Instalación Local

### Desarrollo con Node.js

```bash
# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env

# Editar .env con tus credenciales de Notion
# NOTION_API_KEY=ntn_...
# NOTION_DATABASE_ID=...

# Ejecutar servidor local
npm start
```

Abre http://localhost:8080 en tu navegador.

## Despliegue en Vercel (Recomendado)

### Paso 1: Crear una cuenta en Vercel
Visita https://vercel.com y crea una cuenta (gratis).

### Paso 2: Conectar el repositorio
1. En Vercel, haz clic en "New Project"
2. Importa tu repositorio de GitHub
3. Haz clic en "Import"

### Paso 3: Configurar variables de entorno
1. En el proyecto de Vercel, ve a Settings → Environment Variables
2. Agrega estas dos variables:
   - `NOTION_API_KEY` = tu token de Notion
   - `NOTION_DATABASE_ID` = el ID de tu base de datos

3. Haz clic en "Save"

### Paso 4: Deploy
Vercel deployará automáticamente. Tu app estará en `https://[tu-proyecto].vercel.app`

## Obtener credenciales de Notion

### 1. Crear una Integración
1. Ve a https://www.notion.com/my-integrations
2. Haz clic en "New integration"
3. Dale un nombre (ej: "Odoo Scope Tool")
4. Copia el "Internal Integration Token" (empieza con `ntn_...`)

### 2. Conectar a tu base de datos
1. Abre tu base de datos de Notion
2. Haz clic en "Share" (arriba a la derecha)
3. Selecciona tu integración de la lista
4. Haz clic en "Invite"
5. Copia el ID de la base de datos de la URL: `https://www.notion.so/[ID]?v=...`

## Estructura

```
.
├── public/              # Archivos estáticos (servidos por Vercel)
│   └── index.html       # Interfaz web
├── api/                 # Funciones serverless
│   └── notion.js        # Proxy de API de Notion
├── .env.example         # Plantilla de configuración
├── package.json         # Dependencias
├── vercel.json          # Configuración de Vercel
└── server.js            # Servidor local (para desarrollo)
```

## Desarrollo

### Desarrollo local
```bash
npm start
# Abre http://localhost:8080
```

### Cambios automáticos en Vercel
Cada vez que hagas push a main, Vercel deployará automáticamente.

## Seguridad

- ✅ Token de Notion almacenado en variables de entorno
- ✅ No se comite el `.env` a Git
- ✅ Token nunca llega al navegador
- ✅ Proxy serverless maneja todas las peticiones a Notion

## Solución de problemas

### "Servidor proxy de Notion no disponible"
- Verifica que la función `/api/notion.js` esté desplegada en Vercel
- Revisa los logs: Vercel → Project → Deployments → Logs

### Las preguntas no cargan
- Verifica que `NOTION_API_KEY` y `NOTION_DATABASE_ID` estén configurados
- Abre DevTools (F12) → Console para ver los errores
- Verifica que la integración de Notion tenga acceso a la base de datos

### CORS error
- Esto no debería pasar con Vercel. El proxy maneja CORS correctamente.
- Si ocurre, verifica los logs de Vercel.

## Preguntas frecuentes

**P: ¿Necesito un servidor?**  
R: No, Vercel proporciona serverless functions gratis. Nada que mantener.

**P: ¿Funciona offline?**  
R: Sí, después de la primera carga. Los datos se cachean 1 hora en localStorage.

**P: ¿Qué pasa si cambio preguntas en Notion?**  
R: Se cargarán automáticamente en la siguiente sesión (después de 1 hora de caché).

**P: ¿Es gratis?**  
R: Completamente. Vercel tiene plan gratuito sin límite de funciones serverless.

## Licencia

MIT

---

Hecho con ❤️ para Origami Soft
