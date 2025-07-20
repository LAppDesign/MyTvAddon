const express = require('express');
const cors = require('cors');
const { addonBuilder } = require('stremio-addon-sdk');
const PlaylistTransformer = require('./playlist-transformer');
const { catalogHandler, streamHandler } = require('./handlers');
const metaHandler = require('./meta-handler');
const EPGManager = require('./epg-manager');
const config = require('./config');
const CacheManager = require('./cache-manager')(config);
const { renderConfigPage } = require('./views');
const PythonRunner = require('./python-runner');
const ResolverStreamManager = require('./resolver-stream-manager')();
const PythonResolver = require('./python-resolver');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota principal - suporta tanto o sistema antigo como o novo
app.get('/', async (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  res.send(renderConfigPage(protocol, host, req.query, config.manifest));
});
// Nova rota para a configuração codificada
app.get('/:config/configure', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       
       // Inicializa o gerador Python se configurado
       if (decodedConfig.python_script_url) {
           console.log('Inicialização do Script Python do Gerador a partir da configuração');
           try {
               // Descarrega o script Python se não estiver já descarregado
               await PythonRunner.downloadScript(decodedConfig.python_script_url);
               
               // Se foi definido um intervalo de atualização, define-o
               if (decodedConfig.python_update_interval) {
                   console.log('Definindo a atualização automática do gerador Python');
                   PythonRunner.scheduleUpdate(decodedConfig.python_update_interval);
               }
           } catch (pythonError) {
               console.error('Erro na inicialização do script Python:', pythonError);
           }
       }
       
       res.send(renderConfigPage(protocol, host, decodedConfig, config.manifest));
   } catch (error) {
       console.error('Erro na configuração:', error);
       res.redirect('/');
   }
});
// Rota para o manifest - suporta tanto o sistema antigo como o novo
app.get('/manifest.json', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');
       let configUrl = `${protocol}://${host}/?${new URLSearchParams(req.query)}`;
       if (req.query.resolver_update_interval) {
           configUrl += `&resolver_update_interval=${encodeURIComponent(req.query.resolver_update_interval)}`;
       }
      
       if (req.query.m3u && CacheManager.cache.m3uUrl !== req.query.m3u) {
           await CacheManager.rebuildCache(req.query.m3u);
       }
       
       const { genres } = CacheManager.getCachedData();
       const manifestConfig = {
           ...config.manifest,
           catalogs: [{
               ...config.manifest.catalogs[0],
               extra: [
                   {
                       name: 'genre',
                       isRequired: false,
                       options: genres
                   },
                   {
                       name: 'search',
                       isRequired: false
                   },
                   {
                       name: 'skip',
                       isRequired: false
                   }
               ]
           }],
           behaviorHints: {
               configurable: true,
               configurationURL: configUrl,
               reloadRequired: true
           }
       };
       const builder = new addonBuilder(manifestConfig);
       
       if (req.query.epg_enabled === 'true') {
           // Se não foi fornecido manualmente um URL EPG, usa o da playlist
           const epgToUse = req.query.epg ||
               (CacheManager.getCachedData().epgUrls && 
                CacheManager.getCachedData().epgUrls.length > 0 
                   ? CacheManager.getCachedData().epgUrls.join(',') 
                   : null);
           if (epgToUse) {
               await EPGManager.initializeEPG(epgToUse);
           }
       }
       builder.defineCatalogHandler(async (args) => catalogHandler({ ...args, config: req.query }));
       builder.defineStreamHandler(async (args) => streamHandler({ ...args, config: req.query }));
       builder.defineMetaHandler(async (args) => metaHandler({ ...args, config: req.query }));
       res.setHeader('Content-Type', 'application/json');
       res.send(builder.getInterface().manifest);
   } catch (error) {
       console.error('Erro ao criar o manifest:', error);
       res.status(500).json({ error: 'Erro interno do servidor' });
   }
});

// Nova rota para o manifest com configuração codificada
app.get('/:config/manifest.json', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));

       if (decodedConfig.m3u && CacheManager.cache.m3uUrl !== decodedConfig.m3u) {
           await CacheManager.rebuildCache(decodedConfig.m3u);
       }
       if (decodedConfig.resolver_script) {
           console.log('Inicialização do Script Resolver a partir da configuração');
           try {
               // Descarrega o script Resolver
               const resolverDownloaded = await PythonResolver.downloadScript(decodedConfig.resolver_script);
          
               // Se foi definido um intervalo de atualização, define-o
               if (decodedConfig.resolver_update_interval) {
                   console.log('Definindo a atualização automática do resolver');
                   PythonResolver.scheduleUpdate(decodedConfig.resolver_update_interval);
               }
           } catch (resolverError) {
               console.error('Erro na inicialização do script Resolver:', resolverError);
           }
       }
       // Inicializa o gerador Python se configurado
       if (decodedConfig.python_script_url) {
           console.log('Inicialização do Script Python do Gerador a partir da configuração');
           try {
               // Descarrega o script Python se não estiver já descarregado
               await PythonRunner.downloadScript(decodedConfig.python_script_url);
               // Se foi definido um intervalo de atualização, define-o
               if (decodedConfig.python_update_interval) {
                   console.log('Definindo a atualização automática do gerador Python');
                   PythonRunner.scheduleUpdate(decodedConfig.python_update_interval);
               }
           } catch (pythonError) {
               console.error('Erro na inicialização do script Python:', pythonError);
           }
       }

       const { genres } = CacheManager.getCachedData();
       const manifestConfig = {
           ...config.manifest,
           catalogs: [{
               ...config.manifest.catalogs[0],
               extra: [
                   {
                       name: 'genre',
                       isRequired: false,
                       options: genres
                   },
                   {
                       name: 'search',
                       isRequired: false
                   },
                   {
                       name: 'skip',
                       isRequired: false
                   }
               ]
           }],
           behaviorHints: {
               configurable: true,
               configurationURL: `${protocol}://${host}/${req.params.config}/configure`,
               reloadRequired: true
           }
       };
       const builder = new addonBuilder(manifestConfig);
       
       if (decodedConfig.epg_enabled === 'true') {
           // Se não foi fornecido manualmente um URL EPG, usa o da playlist
           const epgToUse = decodedConfig.epg ||
               (CacheManager.getCachedData().epgUrls && 
                CacheManager.getCachedData().epgUrls.length > 0 
                   ? CacheManager.getCachedData().epgUrls.join(',') 
                   : null);
           if (epgToUse) {
               await EPGManager.initializeEPG(epgToUse);
           }
       }
       
       builder.defineCatalogHandler(async (args) => catalogHandler({ ...args, config: decodedConfig }));
       builder.defineStreamHandler(async (args) => streamHandler({ ...args, config: decodedConfig }));
       builder.defineMetaHandler(async (args) => metaHandler({ ...args, config: decodedConfig }));
       
       res.setHeader('Content-Type', 'application/json');
       res.send(builder.getInterface().manifest);
   } catch (error) {
       console.error('Erro ao criar o manifest:', error);
       res.status(500).json({ error: 'Erro interno do servidor' });
   }
});

// Mantemos a rota existente para os outros endpoints
app.get('/:resource/:type/:id/:extra?.json', async (req, res, next) => {
   const { resource, type, id } = req.params;
   const extra = req.params.extra 
       ? safeParseExtra(req.params.extra) 
       : {};
   
   try {
       let result;
       switch (resource) {
           case 'stream':
               result = await streamHandler({ type, id, config: req.query });
               break;
           case 'catalog':
               result = await catalogHandler({ type, id, extra, config: req.query });
               break;
           case 'meta':
               result = await metaHandler({ type, id, config: req.query });
               break;
           default:
               next();
               return;
       }
       
       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Erro ao lidar com o pedido:', error);
       res.status(500).json({ error: 'Erro interno do servidor' });
   }
});

// rota download template
app.get('/api/resolver/download-template', (req, res) => {
   const PythonResolver = require('./python-resolver');
   const fs = require('fs');
   
   try {
       if (fs.existsSync(PythonResolver.scriptPath)) {
           res.setHeader('Content-Type', 'text/plain');
           res.setHeader('Content-Disposition', 'attachment; filename="resolver_script.py"');
           res.sendFile(PythonResolver.scriptPath);
       } else {
           res.status(404).json({ success: false, message: 'Template não encontrado. Crie-o primeiro com a função "Criar Template".' });
       }
   } catch (error) {
       console.error('Erro no download do template:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
function cleanupTempFolder() {
   console.log('\n=== Limpeza da pasta temporária ao iniciar ===');
   const tempDir = path.join(__dirname, 'temp');
   // Verifica se a pasta temp existe
   if (!fs.existsSync(tempDir)) {
       console.log('Pasta temp não encontrada, a criar...');
       fs.mkdirSync(tempDir, { recursive: true });
       return;
   }
   
   try {
       // Lê todos os ficheiros na pasta temp
       const files = fs.readdirSync(tempDir);
       let deletedCount = 0;
       
       // Elimina cada ficheiro
       for (const file of files) {
           try {
               const filePath = path.join(tempDir, file);
               // Verifica se é um ficheiro e não uma pasta
               if (fs.statSync(filePath).isFile()) {
                   fs.unlinkSync(filePath);
                   deletedCount++;
               }
           } catch (fileError) {
               console.error(`❌ Erro ao eliminar o ficheiro ${file}:`, fileError.message);
           }
       }
       
       console.log(`✓ Eliminados ${deletedCount} ficheiros temporários`);
       console.log('=== Limpeza da pasta temporária concluída ===\n');
   } catch (error) {
       console.error('❌ Erro na limpeza da pasta temporária:', error.message);
   }
}

function safeParseExtra(extraParam) {
   try {
       if (!extraParam) return {};
       const decodedExtra = decodeURIComponent(extraParam);
       
       // Suporte para skip com género
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
       console.error('Erro ao analisar extra:', error);
       return {};
   }
}

// Para o catálogo com config codificada
app.get('/:config/catalog/:type/:id/:extra?.json', async (req, res) => {
   try {
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       const extra = req.params.extra 
           ? safeParseExtra(req.params.extra) 
           : {};
       
       const result = await catalogHandler({ 
           type: req.params.type, 
           id: req.params.id, 
           extra, 
           config: decodedConfig 
       });
       
       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Erro ao lidar com o pedido de catálogo:', error);
       res.status(500).json({ error: 'Erro interno do servidor' });
   }
});
// Para o stream com config codificada
app.get('/:config/stream/:type/:id.json', async (req, res) => {
   try {
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       
       const result = await streamHandler({ 
           type: req.params.type, 
           id: req.params.id, 
           config: decodedConfig 
       });
       
       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Erro ao lidar com o pedido de stream:', error);
       res.status(500).json({ error: 'Erro interno do servidor' });
   }
});
// Para o meta com config codificada
app.get('/:config/meta/:type/:id.json', async (req, res) => {
   try {
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       
       const result = await metaHandler({ 
           type: req.params.type, 
           id: req.params.id, 
           config: decodedConfig 
       });
       
       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Erro ao lidar com o pedido de meta:', error);
       res.status(500).json({ error: 'Erro interno do servidor' });
   }
});
// Rota para servir o ficheiro M3U gerado
app.get('/generated-m3u', (req, res) => {
   const m3uContent = PythonRunner.getM3UContent();
   if (m3uContent) {
       res.setHeader('Content-Type', 'text/plain');
       res.send(m3uContent);
   } else {
       res.status(404).send('Ficheiro M3U não encontrado. Execute primeiro o script Python.');
   }
});
app.post('/api/resolver', async (req, res) => {
   const { action, url, interval } = req.body;
   
   try {
       if (action === 'download' && url) {
           const success = await PythonResolver.downloadScript(url);
           if (success) {
               res.json({ success: true, message: 'Script resolver descarregado com sucesso' });
           } else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'create-template') {
           const success = await PythonResolver.createScriptTemplate();
           if (success) {
               res.json({ 
                   success: true, 
                   message: 'Template do script resolver criado com sucesso',
                   scriptPath: PythonResolver.scriptPath
               });
           } else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'check-health') {
           const isHealthy = await PythonResolver.checkScriptHealth();
           res.json({ 
               success: isHealthy, 
               message: isHealthy ? 'Script resolver válido' : PythonResolver.getStatus().lastError 
           });
       } else if (action === 'status') {
           res.json(PythonResolver.getStatus());
       } else if (action === 'clear-cache') {
           PythonResolver.clearCache();
           res.json({ success: true, message: 'Cache do resolver esvaziada' });
       } else if (action === 'schedule' && interval) {
           const success = PythonResolver.scheduleUpdate(interval);
           if (success) {
               res.json({ 
                   success: true, 
                   message: `Atualização automática definida para cada ${interval}` 
               });
           } else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'stopSchedule') {
           const stopped = PythonResolver.stopScheduledUpdates();
           res.json({ 
               success: true, 
               message: stopped ? 'Atualização automática parada' : 'Nenhuma atualização programada para parar' 
           });
       } else {
           res.status(400).json({ success: false, message: 'Ação inválida' });
       }
   } catch (error) {
       console.error('Erro API Resolver:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});

app.post('/api/rebuild-cache', async (req, res) => {
   try {
       const m3uUrl = req.body.m3u;
       if (!m3uUrl) {
           return res.status(400).json({ success: false, message: 'URL M3U é obrigatório' });
       }

       console.log('🔄 Pedido de reconstrução da cache recebido');
       await CacheManager.rebuildCache(req.body.m3u, req.body);
       
       if (req.body.epg_enabled === 'true') {
           console.log('📡 Reconstrução do EPG em curso...');
           const epgToUse = req.body.epg || 
               (CacheManager.getCachedData().epgUrls && CacheManager.getCachedData().epgUrls.length > 0 
                   ? CacheManager.getCachedData().epgUrls.join(',') 
                   : null);
           if (epgToUse) {
               await EPGManager.initializeEPG(epgToUse);
           }
       }

       res.json({ success: true, message: 'Cache e EPG reconstruídos com sucesso' });
   } catch (error) {
       console.error('Erro na reconstrução da cache:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
// Endpoint API para as operações no script Python
app.post('/api/python-script', async (req, res) => {
   const { action, url, interval } = req.body;
   
   try {
       if (action === 'download' && url) {
           const success = await PythonRunner.downloadScript(url);
           if (success) {
               res.json({ success: true, message: 'Script descarregado com sucesso' });
           } else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'execute') {
           const success = await PythonRunner.executeScript();
           if (success) {
               res.json({ 
                   success: true, 
                   message: 'Script executado com sucesso', 
                   m3uUrl: `${req.protocol}://${req.get('host')}/generated-m3u` 
               });
           } else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'status') {
           res.json(PythonRunner.getStatus());
       } else if (action === 'schedule' && interval) {
           const success = PythonRunner.scheduleUpdate(interval);
           if (success) {
               res.json({ 
                   success: true, 
                   message: `Atualização automática definida para cada ${interval}` 
               });
           } else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'stopSchedule') {
           const stopped = PythonRunner.stopScheduledUpdates();
           res.json({ 
               success: true, 
               message: stopped ? 'Atualização automática parada' : 'Nenhuma atualização programada para parar' 
           });
       } else {
           res.status(400).json({ success: false, message: 'Ação inválida' });
       }
   } catch (error) {
       console.error('Erro API Python:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
async function startAddon() {
  cleanupTempFolder();
  try {
      const port = process.env.PORT || 10000;
      app.listen(port, () => {
         console.log('=============================\n');
         console.log('OMG ADDON Iniciado com sucesso');
         console.log('Visite a página web para gerar a configuração do manifest e instalá-lo no Stremio');
         console.log('Link para a página de configuração:', `http://localhost:${port}`);
         console.log('=============================\n');
       });
  } catch (error) {
      console.error('Falha ao iniciar o addon:', error);
      process.exit(1);
  }
}

startAddon();