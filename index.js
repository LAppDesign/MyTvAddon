const express = require('express');
const cors = require('cors');
const { addonBuilder } = require('stremio-addon-sdk');
const PlaylistTransformer = require('./playlist-transformer');
const { catalogHandler, streamHandler } = require('./handlers');
const metaHandler = require('./meta-handler');
const EPGManager = require('./epg-manager');
const config = require('./config');
const CacheManager = require('./cache-manager')(config);
const { renderConfigPage } = require('./views'); // Ainda necessário se 'renderConfigPage' for usada em algum lugar (mas não na raiz)
const PythonRunner = require('./python-runner');
const ResolverStreamManager = require('./resolver-stream-manager')();
const PythonResolver = require('./python-resolver');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================================
// Rota Principal (AGORA SEM PÁGINA DE CONFIGURAÇÃO DIRETA)
// Se você não quer nenhuma configuração, esta rota pode ser uma página de "bem-vindo"
// ou simplesmente um redirecionamento, ou pode ser removida se não for necessária.
// Por enquanto, vamos manter uma mensagem simples.
// =========================================================================
app.get('/', async (req, res) => {
   res.send(`
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>MyAddonStudio - Informações</title>
           <style>
               body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #1a1a1a; color: #e0e0e0; }
               h1 { color: #673ab7; }
               p { margin-top: 20px; }
           </style>
       </head>
       <body>
           <h1>MyAddonStudio</h1>
           <p>Este é o addon MyAddonStudio para Stremio.</p>
           <p>Não requer configuração adicional.</p>
       </body>
       </html>
   `);
});

// =========================================================================
// Rota para o Manifest (AGORA SEM behaviorHints para configuração)
// =========================================================================
app.get('/manifest.json', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');

       // IMPORTANTE: Não há mais currentConfig vindo da URL para o manifest.
       // Se seu addon precisar de alguma configuração inicial (ex: URL M3U padrão),
       // ela deve vir de 'config.js' ou variáveis de ambiente.
       // Se você ainda quiser que o addon seja personalizável na URL de instalação
       // mas sem o botão "Configurar", a lógica de 'req.query' para os handlers
       // ainda pode ser usada, mas o Stremio não oferecerá um UI para isso.
       
       // Exemplo: Se você ainda quer permitir M3U na URL, mas sem botão de config
       const m3uUrlFromQuery = req.query.m3u;

       if (m3uUrlFromQuery && CacheManager.cache.m3uUrl !== m3uUrlFromQuery) {
           await CacheManager.rebuildCache(m3uUrlFromQuery);
       }

       // Se o EPG for baseado na config inicial (não mais do UI de config)
       const epgEnabledFromQuery = req.query.epg_enabled === 'true';
       if (epgEnabledFromQuery) {
           const epgToUse = req.query.epg ||
               (CacheManager.getCachedData().epgUrls && CacheManager.getCachedData().epgUrls.length > 0
                   ? CacheManager.getCachedData().epgUrls.join(',')
                   : null);
           if (epgToUse) {
               await EPGManager.initializeEPG(epgToUse);
           }
       }


       const { genres } = CacheManager.getCachedData();
       const manifestConfig = {
           ...config.manifest,
           catalogs: [{
               ...config.manifest.catalogs[0],
               extra: [
                   { name: 'genre', isRequired: false, options: genres },
                   { name: 'search', isRequired: false },
                   { name: 'skip', isRequired: false }
               ]
           }],
           // REMOVIDO: behaviorHints para configurable, configurationURL, reloadRequired
           // Isso garante que o Stremio não mostrará o botão de "Configurar"
       };

       const builder = new addonBuilder(manifestConfig);

       // Continue passando 'req.query' para os handlers se você espera configurações na URL de instalação
       builder.defineCatalogHandler(async (args) => catalogHandler({ ...args, config: req.query }));
       builder.defineStreamHandler(async (args) => streamHandler({ ...args, config: req.query }));
       builder.defineMetaHandler(async (args) => metaHandler({ ...args, config: req.query }));

       res.setHeader('Content-Type', 'application/json');
       res.send(builder.getInterface().manifest);
   } catch (error) {
       console.error('Error creating manifest:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});

// =========================================================================
// REMOÇÃO DE ROTAS ESPECÍFICAS DE CONFIGURAÇÃO ANTIGAS
// Estas rotas não são mais necessárias se não há UI de configuração no Stremio.
// =========================================================================

// A rota original /:config/configure -> REMOVIDA
// A rota original /:config/manifest.json -> REMOVIDA (pois agora tudo vai para /manifest.json diretamente)


// =========================================================================
// As rotas abaixo foram simplificadas para ler req.query diretamente
// (mantendo a funcionalidade de passar parâmetros na URL, se desejado,
// mas sem a interface de configuração do Stremio para isso).
// =========================================================================

// Manteniamo la route esistente per gli altri endpoint (recursos)
app.get('/:resource/:type/:id/:extra?.json', async (req, res, next) => {
   const { resource, type, id } = req.params;
   const extra = req.params.extra
       ? safeParseExtra(req.params.extra)
       : {};

   try {
       let result;
       // As configurações agora vêm dos query parameters (req.query)
       // Se você não quer nenhuma configuração, este objeto 'currentConfig' pode ser vazio {}
       const currentConfig = {
           m3u: req.query.m3u,
           epg: req.query.epg,
           epg_enabled: req.query.epg_enabled === 'true',
           python_script_url: req.query.python_script_url,
           python_update_interval: req.query.python_update_interval,
           resolver_script: req.query.resolver_script,
           resolver_update_interval: req.query.resolver_update_interval
       };

       switch (resource) {
           case 'stream':
               result = await streamHandler({ type, id, config: currentConfig });
               break;
           case 'catalog':
               result = await catalogHandler({ type, id, extra, config: currentConfig });
               break;
           case 'meta':
               result = await metaHandler({ type, id, config: currentConfig });
               break;
           default:
               next();
               return;
       }

       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Error handling request:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});

// =========================================================================
// As rotas abaixo não precisam de modificação.
// =========================================================================

// route download template
app.get('/api/resolver/download-template', (req, res) => {
   const PythonResolver = require('./python-resolver');
   const fs = require('fs');

   try {
       if (fs.existsSync(PythonResolver.scriptPath)) {
           res.setHeader('Content-Type', 'text/plain');
           res.setHeader('Content-Disposition', 'attachment; filename="resolver_script.py"');
           res.sendFile(PythonResolver.scriptPath);
       } else {
           res.status(404).json({ success: false, message: 'Template non trovato. Crealo prima con la funzione "Crea Template".' });
       }
   } catch (error) {
       console.error('Errore nel download del template:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});

function cleanupTempFolder() {
   console.log('\n=== Pulizia cartella temp all\'avvio ===');
   const tempDir = path.join(__dirname, 'temp');
   if (!fs.existsSync(tempDir)) {
       console.log('Cartella temp non trovata, la creo...');
       fs.mkdirSync(tempDir, { recursive: true });
       return;
   }

   try {
       const files = fs.readdirSync(tempDir);
       let deletedCount = 0;

       for (const file of files) {
           try {
               const filePath = path.join(tempDir, file);
               if (fs.statSync(filePath).isFile()) {
                   fs.unlinkSync(filePath);
                   deletedCount++;
               }
           } catch (fileError) {
               console.error(`❌ Errore nell'eliminazione del file ${file}:`, fileError.message);
           }
       }

       console.log(`✓ Eliminati ${deletedCount} file temporanei`);
       console.log('=== Pulizia cartella temp completata ===\n');
   } catch (error) {
       console.error('❌ Errore nella pulizia della cartella temp:', error.message);
   }
}

function safeParseExtra(extraParam) {
   try {
       if (!extraParam) return {};
       const decodedExtra = decodeURIComponent(extraParam);

       if (decodedExtra.includes('genre=') && decodedExtra.includes('&skip=')) {
           const parts = decodedExtra.split('&');
           const genre = parts.find(p => p.startsWith('genre=')).split('=')[1];
           const skip = parts.find(p => p.startsWith('skip=')).split('=')[1];
           return {
               genre,
               skip: parseInt(skip, 10) || 0
           };
       }

       if (decodedExtra.startsWith('skip=')) {
           return { skip: parseInt(decodedExtra.split('=')[1], 10) || 0 };
       }

       if (decodedExtra.startsWith('genre=')) {
           return { genre: decodedExtra.split('=')[1] };
       }

       if (decodedExtra.startsWith('search=')) {
           return { search: decodedExtra.split('=')[1] };
       }

       try {
           return JSON.parse(decodedExtra);
       } catch {
           return {};
       }
   } catch (error) {
       console.error('Error parsing extra:', error);
       return {};
   }
}

// Per il catalog con config codificato -> SIMPLIFICADA
app.get('/catalog/:type/:id/:extra?.json', async (req, res) => {
   try {
       // Se você não quer nenhuma configuração, este objeto 'currentConfig' pode ser vazio {}
       const currentConfig = {
           m3u: req.query.m3u,
           epg: req.query.epg,
           epg_enabled: req.query.epg_enabled === 'true',
           python_script_url: req.query.python_script_url,
           python_update_interval: req.query.python_update_interval,
           resolver_script: req.query.resolver_script,
           resolver_update_interval: req.query.resolver_update_interval
       };

       const extra = req.params.extra
           ? safeParseExtra(req.params.extra)
           : {};

       const result = await catalogHandler({
           type: req.params.type,
           id: req.params.id,
           extra,
           config: currentConfig
       });

       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Error handling catalog request:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});

// Per lo stream con config codificato -> SIMPLIFICADA
app.get('/stream/:type/:id.json', async (req, res) => {
   try {
       // Se você não quer nenhuma configuração, este objeto 'currentConfig' pode ser vazio {}
       const currentConfig = {
           m3u: req.query.m3u,
           epg: req.query.epg,
           epg_enabled: req.query.epg_enabled === 'true',
           python_script_url: req.query.python_script_url,
           python_update_interval: req.query.python_update_interval,
           resolver_script: req.query.resolver_script,
           resolver_update_interval: req.query.resolver_update_interval
       };

       const result = await streamHandler({
           type: req.params.type,
           id: req.params.id,
           config: currentConfig
       });

       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Error handling stream request:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});

// Per il meta con config codificato -> SIMPLIFICADA
app.get('/meta/:type/:id.json', async (req, res) => {
   try {
       // Se você não quer nenhuma configuração, este objeto 'currentConfig' pode ser vazio {}
       const currentConfig = {
           m3u: req.query.m3u,
           epg: req.query.epg,
           epg_enabled: req.query.epg_enabled === 'true',
           python_script_url: req.query.python_script_url,
           python_update_interval: req.query.python_update_interval,
           resolver_script: req.query.resolver_script,
           resolver_update_interval: req.query.resolver_update_interval
       };

       const result = await metaHandler({
           type: req.params.type,
           id: req.params.id,
           config: currentConfig
       });

       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Error handling meta request:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});

// Route per servire il file M3U generato
app.get('/generated-m3u', (req, res) => {
   const m3uContent = PythonRunner.getM3UContent();
   if (m3uContent) {
       res.setHeader('Content-Type', 'text/plain');
       res.send(m3uContent);
   } else {
       res.status(404).send('File M3U non trovato. Eseguire prima lo script Python.');
   }
});

app.post('/api/resolver', async (req, res) => {
   const { action, url, interval } = req.body;

   try {
       if (action === 'download' && url) {
           const success = await PythonResolver.downloadScript(url);
           if (success) {
               res.json({ success: true, message: 'Script resolver scaricato con successo' });
           } else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'create-template') {
           const success = await PythonResolver.createScriptTemplate();
           if (success) {
               res.json({
                   success: true,
                   message: 'Template script resolver creato con successo',
                   scriptPath: PythonResolver.scriptPath
               });
           }
           else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'check-health') {
           const isHealthy = await PythonResolver.checkScriptHealth();
           res.json({
               success: isHealthy,
               message: isHealthy ? 'Script resolver valido' : PythonResolver.getStatus().lastError
           });
       } else if (action === 'status') {
           res.json(PythonResolver.getStatus());
       } else if (action === 'clear-cache') {
           PythonResolver.clearCache();
           res.json({ success: true, message: 'Cache resolver svuotata' });
       } else if (action === 'schedule' && interval) {
           const success = PythonResolver.scheduleUpdate(interval);
           if (success) {
               res.json({
                   success: true,
                   message: `Aggiornamento automatico impostato ogni ${interval}`
               });
           } else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'stopSchedule') {
           const stopped = PythonResolver.stopScheduledUpdates();
           res.json({
               success: true,
               message: stopped ? 'Aggiornamento automatico fermato' : 'Nessun aggiornamento pianificato da fermare'
           });
       } else {
           res.status(400).json({ success: false, message: 'Azione non valida' });
       }
   } catch (error) {
       console.error('Errore API Resolver:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});

app.post('/api/rebuild-cache', async (req, res) => {
   try {
       const m3uUrl = req.body.m3u;
       if (!m3uUrl) {
           return res.status(400).json({ success: false, message: 'URL M3U richiesto' });
       }

       console.log('🔄 Richiesta di ricostruzione cache ricevuta');
       await CacheManager.rebuildCache(req.body.m3u, req.body);

       if (req.body.epg_enabled === 'true') {
           console.log('📡 Ricostruzione EPG in corso...');
           const epgToUse = req.body.epg ||
               (CacheManager.getCachedData().epgUrls && CacheManager.getCachedData().epgUrls.length > 0
                   ? CacheManager.getCachedData().epgUrls.join(',')
                   : null);
           if (epgToUse) {
               await EPGManager.initializeEPG(epgToUse);
           }
       }

       res.json({ success: true, message: 'Cache e EPG ricostruiti con successo' });

   } catch (error) {
       console.error('Errore nella ricostruzione della cache:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});

// Endpoint API per le operazioni sullo script Python
app.post('/api/python-script', async (req, res) => {
   const { action, url, interval } = req.body;

   try {
       if (action === 'download' && url) {
           const success = await PythonRunner.downloadScript(url);
           if (success) {
               res.json({ success: true, message: 'Script scaricato con successo' });
           } else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'execute') {
           const success = await PythonRunner.executeScript();
           if (success) {
               res.json({
                   success: true,
                   message: 'Script eseguito con successo',
                   m3uUrl: `${req.protocol}://${req.get('host')}/generated-m3u`
               });
           }
           else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'status') {
           res.json(PythonRunner.getStatus());
       } else if (action === 'schedule' && interval) {
           const success = PythonRunner.scheduleUpdate(interval);
           if (success) {
               res.json({
                   success: true,
                   message: `Aggiornamento automatico impostato ogni ${interval}`
               });
           } else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'stopSchedule') {
           const stopped = PythonRunner.stopScheduledUpdates();
           res.json({
               success: true,
               message: stopped ? 'Aggiornamento automatico fermato' : 'Nessun aggiornamento pianificato da fermare'
           });
       } else {
           res.status(400).json({ success: false, message: 'Azione non valida' });
       }
   } catch (error) {
       console.error('Errore API Python:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
async function startAddon() {
   cleanupTempFolder();
   try {
       const port = process.env.PORT || 10000;
       app.listen(port, () => {
           console.log('=============================\n');
           console.log('OMG ADDON Avviato con sucesso');
           // A mensagem abaixo pode ser ajustada, pois não há mais uma página de configuração para visitar
           console.log('Addon Stremio MyAddonStudio está ativo e pronto para uso.');
           console.log('=============================\n');
       });
   } catch (error) {
       console.error('Failed to start addon:', error);
       process.exit(1);
   }
}

startAddon();

Explicação das mudanças para atingir seu objetivo:
1. Remoção de behaviorHints no /manifest.json:
   * No bloco onde você define manifestConfig para o addonBuilder (dentro da rota app.get('/manifest.json', ...) ), eu removi completamente a seção behaviorHints:
// ...
const manifestConfig = {
   ...config.manifest,
   catalogs: [{
       ...config.manifest.catalogs[0],
       extra: [
           { name: 'genre', isRequired: false, options: genres },
           { name: 'search', isRequired: false },
           { name: 'skip', isRequired: false }
       ]
   }],
   // <<< AQUI NÃO HÁ MAIS behaviorHints PARA CONFIGURAÇÃO >>>
};
// ...