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

// Route principale - supporta sia il vecchio che il nuovo sistema
app.get('/', async (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  res.send(renderConfigPage(protocol, host, req.query, config.manifest));
});

// Nuova route per la configurazione codificata
app.get('/:config/configure', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       
       // Inizializza il generatore Python se configurato
       if (decodedConfig.python_script_url) {
           console.log('Inizializzazione Script Python Generatore dalla configurazione');
           try {
               // Scarica lo script Python se non già scaricato
               await PythonRunner.downloadScript(decodedConfig.python_script_url);
               
               // Se è stato definito un intervallo di aggiornamento, impostalo
               if (decodedConfig.python_update_interval) {
                   console.log('Impostazione dell\'aggiornamento automatico del generatore Python');
                   PythonRunner.scheduleUpdate(decodedConfig.python_update_interval);
               }
           } catch (pythonError) {
               console.error('Errore nell\'inizializzazione dello script Python:', pythonError);
           }
       }
       
       res.send(renderConfigPage(protocol, host, decodedConfig, config.manifest));
   } catch (error) {
       console.error('Errore nella configurazione:', error);
       res.redirect('/');
   }
});

// Route per il manifest - supporta sia il vecchio che il nuovo sistema
app.get('/manifest.json', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');
       const configUrl = `${protocol}://${host}/?${new URLSearchParams(req.query)}`;
       if (req.query.resolver_update_interval) {
           configUrl += `&resolver_update_interval=${encodeURIComponent(req.query.resolver_update_interval)}`;
       }
      
       // --- ALTERAÇÃO AQUI (PRIMEIRA ROTA) ---
       [span_0](start_span)const m3uUrlFromEnv = process.env.IPTV_M3U_URL; // Tenta ler da variável de ambiente[span_0](end_span)
       const m3uUrlToUse = m3uUrlFromEnv || req.query.m3u; [span_1](start_span)// Prioriza variável de ambiente[span_1](end_span)

       if (m3uUrlToUse && CacheManager.cache.m3uUrl !== m3uUrlToUse) {
           console.log(`DEBUG: Usando URL M3U (via query ou env): ${m3uUrlToUse}`); [span_2](start_span)// Para depuração nos logs[span_2](end_span)
           [span_3](start_span)await CacheManager.rebuildCache(m3uUrlToUse);[span_3](end_span)
       } else if (!m3uUrlToUse) {
           [span_4](start_span)console.error('Erro: URL M3U não fornecido via variável de ambiente nem query.');[span_4](end_span)
           [span_5](start_span)res.status(400).json({ error: 'M3U URL is missing. Configure it via environment variable or query parameter.' });[span_5](end_span)
           return; [span_6](start_span)// Interrompe a execução da rota[span_6](end_span)
       }
       // --- FIM DA ALTERAÇÃO ---
       
       [span_7](start_span)const { genres } = CacheManager.getCachedData();[span_7](end_span)
       const manifestConfig = {
           ...config.manifest,
           catalogs: [{
               ...config.manifest.catalogs[0],
               extra: [
                   {
                       name: 'genre',
                       isRequired: false,
                       [span_8](start_span)options: genres[span_8](end_span)
                   },
                   {
                       name: 'search',
                       [span_9](start_span)isRequired: false[span_9](end_span)
                   },
                   {
                       name: 'skip',
                       [span_10](start_span)isRequired: false[span_10](end_span)
                   }
               ]
           }],
           behaviorHints: {
               configurable: true,
               configurationURL: configUrl,
               [span_11](start_span)reloadRequired: true[span_11](end_span)
           }
       };
       [span_12](start_span)const builder = new addonBuilder(manifestConfig);[span_12](end_span)
       
       if (req.query.epg_enabled === 'true') {
           // Se non è stato fornito manualmente un EPG URL, usa quello della playlist
           const epgToUse = req.query.epg ||
               [span_13](start_span)(CacheManager.getCachedData().epgUrls &&[span_13](end_span)
                [span_14](start_span)CacheManager.getCachedData().epgUrls.length > 0[span_14](end_span)
                   ? [span_15](start_span)CacheManager.getCachedData().epgUrls.join(',')[span_15](end_span)
                   : null);
           if (epgToUse) {
               [span_16](start_span)await EPGManager.initializeEPG(epgToUse);[span_16](end_span)
           }
       }
       [span_17](start_span)builder.defineCatalogHandler(async (args) => catalogHandler({ ...args, config: req.query }));[span_17](end_span)
       [span_18](start_span)builder.defineStreamHandler(async (args) => streamHandler({ ...args, config: req.query }));[span_18](end_span)
       builder.defineMetaHandler(async (args) => metaHandler({ ...args, config: req.query }));
       res.setHeader('Content-Type', 'application/json');
       res.send(builder.getInterface().manifest);
   } catch (error) {
       [span_19](start_span)console.error('Error creating manifest:', error);[span_19](end_span)
       [span_20](start_span)res.status(500).json({ error: 'Internal server error' });[span_20](end_span)
   }
});

// Nuova route per il manifest con configurazione codificata
app.get('/:config/manifest.json', async (req, res) => {
   try {
       const protocol = req.headers['x-forwarded-proto'] || req.protocol;
       const host = req.headers['x-forwarded-host'] || req.get('host');
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));

       // --- ALTERAÇÃO AQUI (SEGUNDA ROTA) ---
       [span_21](start_span)const m3uUrlFromEnv = process.env.IPTV_M3U_URL; // Tenta ler da variável de ambiente[span_21](end_span)
       const m3uUrlToUse = m3uUrlFromEnv || decodedConfig.m3u; [span_22](start_span)// Prioriza variável de ambiente[span_22](end_span)

       if (m3uUrlToUse && CacheManager.cache.m3uUrl !== m3uUrlToUse) {
           console.log(`DEBUG: Usando URL M3U (via config codificada ou env): ${m3uUrlToUse}`); [span_23](start_span)// Para depuração[span_23](end_span)
           [span_24](start_span)await CacheManager.rebuildCache(m3uUrlToUse);[span_24](end_span)
       } else if (!m3uUrlToUse) {
           [span_25](start_span)console.error('Erro: URL M3U não fornecido via variável de ambiente nem config codificada.');[span_25](end_span)
           [span_26](start_span)res.status(400).json({ error: 'M3U URL is missing. Configure it via environment variable or encoded config.' });[span_26](end_span)
           return; [span_27](start_span)// Interrompe a execução da rota[span_27](end_span)
       }
       // --- FIM DA ALTERAÇÃO ---

       if (decodedConfig.resolver_script) {
           console.log('Inizializzazione Script Resolver dalla configurazione');
           try {
               // Scarica lo script Resolver
               const resolverDownloaded = await PythonResolver.downloadScript(decodedConfig.resolver_script);
          
               // Se è stato definito un intervallo di aggiornamento, impostalo
               if (decodedConfig.resolver_update_interval) {
                   console.log('Impostazione dell\'aggiornamento automatico del resolver');
                   [span_28](start_span)PythonResolver.scheduleUpdate(decodedConfig.resolver_update_interval);[span_28](end_span)
               }
           } catch (resolverError) {
               [span_29](start_span)console.error('Errore nell\'inizializzazione dello script Resolver:', resolverError);[span_29](end_span)
           }
       }
       // Inizializza il generatore Python se configurato
       if (decodedConfig.python_script_url) {
           [span_30](start_span)console.log('Inizializzazione Script Python Generatore dalla configurazione');[span_30](end_span)
           try {
               // Scarica lo script Python se non già scaricato
               [span_31](start_span)await PythonRunner.downloadScript(decodedConfig.python_script_url);[span_31](end_span)
               // Se è stato definito un intervallo di aggiornamento, impostalo
               if (decodedConfig.python_update_interval) {
                   [span_32](start_span)console.log('Impostazione dell\'aggiornamento automatico del generatore Python');[span_32](end_span)
                   [span_33](start_span)PythonRunner.scheduleUpdate(decodedConfig.python_update_interval);[span_33](end_span)
               }
           } catch (pythonError) {
               [span_34](start_span)console.error('Errore nell\'inizializzazione dello script Python:', pythonError);[span_34](end_span)
           }
       }

       [span_35](start_span)const { genres } = CacheManager.getCachedData();[span_35](end_span)
       const manifestConfig = {
           ...config.manifest,
           catalogs: [{
               ...config.manifest.catalogs[0],
               extra: [
                   {
                       [span_36](start_span)name: 'genre',[span_36](end_span)
                       isRequired: false,
                       options: genres
                   },
                   {
                       [span_37](start_span)name: 'search',[span_37](end_span)
                       isRequired: false
                   },
                   {
                       [span_38](start_span)name: 'skip',[span_38](end_span)
                       isRequired: false
                   }
               ]
           }],
           behaviorHints: {
               [span_39](start_span)configurable: true,[span_39](end_span)
               configurationURL: `${protocol}://${host}/${req.params.config}/configure`,
               reloadRequired: true
           }
       };
       [span_40](start_span)const builder = new addonBuilder(manifestConfig);[span_40](end_span)
       
       if (decodedConfig.epg_enabled === 'true') {
           // Se non è stato fornito manualmente un EPG URL, usa quello della playlist
           const epgToUse = decodedConfig.epg ||
               [span_41](start_span)(CacheManager.getCachedData().epgUrls &&[span_41](end_span)
                [span_42](start_span)CacheManager.getCachedData().epgUrls.length > 0[span_42](end_span)
                   ? [span_43](start_span)CacheManager.getCachedData().epgUrls.join(',')[span_43](end_span)
                   : null);
           if (epgToUse) {
               [span_44](start_span)await EPGManager.initializeEPG(epgToUse);[span_44](end_span)
           }
       }
       
       [span_45](start_span)builder.defineCatalogHandler(async (args) => catalogHandler({ ...args, config: decodedConfig }));[span_45](end_span)
       [span_46](start_span)builder.defineStreamHandler(async (args) => streamHandler({ ...args, config: decodedConfig }));[span_46](end_span)
       builder.defineMetaHandler(async (args) => metaHandler({ ...args, config: decodedConfig }));
       
       res.setHeader('Content-Type', 'application/json');
       res.send(builder.getInterface().manifest);
   } catch (error) {
       [span_47](start_span)console.error('Error creating manifest:', error);[span_47](end_span)
       [span_48](start_span)res.status(500).json({ error: 'Internal server error' });[span_48](end_span)
   }
});

// Manteniamo la route esistente per gli altri endpoint
app.get('/:resource/:type/:id/:extra?.json', async (req, res, next) => {
   const { resource, type, id } = req.params;
   const extra = req.params.extra 
       ? safeParseExtra(req.params.extra) 
       : {};
   
   try {
       let result;
       switch (resource) {
           [span_49](start_span)case 'stream':[span_49](end_span)
               result = await streamHandler({ type, id, config: req.query });
               break;
           case 'catalog':
               result = await catalogHandler({ type, id, extra, config: req.query });
               break;
           [span_50](start_span)case 'meta':[span_50](end_span)
               result = await metaHandler({ type, id, config: req.query });
               break;
           default:
               next();
               return;
       }

       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       [span_51](start_span)console.error('Error handling request:', error);[span_51](end_span)
       [span_52](start_span)res.status(500).json({ error: 'Internal server error' });[span_52](end_span)
   }
});

//route download template
app.get('/api/resolver/download-template', (req, res) => {
   const PythonResolver = require('./python-resolver');
   const fs = require('fs');
   
   try {
       if (fs.existsSync(PythonResolver.scriptPath)) {
           res.setHeader('Content-Type', 'text/plain');
           res.setHeader('Content-Disposition', 'attachment; filename="resolver_script.py"');
           res.sendFile(PythonResolver.scriptPath);
       } else {
           [span_53](start_span)res.status(404).json({ success: false, message: 'Template non trovato. Crealo prima con la funzione "Crea Template".' });[span_53](end_span)
       }
   } catch (error) {
       console.error('Errore nel download del template:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
[span_54](start_span)function cleanupTempFolder() {[span_54](end_span)
   console.log('\n=== Pulizia cartella temp all\'avvio ===');
   [span_55](start_span)const tempDir = path.join(__dirname, 'temp');[span_55](end_span)
   // Controlla se la cartella temp esiste
   if (!fs.existsSync(tempDir)) {
       [span_56](start_span)console.log('Cartella temp non trovata, la creo...');[span_56](end_span)
       [span_57](start_span)fs.mkdirSync(tempDir, { recursive: true });[span_57](end_span)
       return;
   }
   
   try {
       // Leggi tutti i file nella cartella temp
       [span_58](start_span)const files = fs.readdirSync(tempDir);[span_58](end_span)
       [span_59](start_span)let deletedCount = 0;[span_59](end_span)
       
       // Elimina ogni file
       for (const file of files) {
           try {
               [span_60](start_span)const filePath = path.join(tempDir, file);[span_60](end_span)
               // Controlla se è un file e non una cartella
               if (fs.statSync(filePath).isFile()) {
                   [span_61](start_span)fs.unlinkSync(filePath);[span_61](end_span)
                   [span_62](start_span)deletedCount++;[span_62](end_span)
               }
           } catch (fileError) {
               [span_63](start_span)console.error(`❌ Errore nell'eliminazione del file ${file}:`, fileError.message);[span_63](end_span)
           }
       }
       
       [span_64](start_span)console.log(`✓ Eliminati ${deletedCount} file temporanei`);[span_64](end_span)
       [span_65](start_span)console.log('=== Pulizia cartella temp completata ===\n');[span_65](end_span)
   } catch (error) {
       [span_66](start_span)console.error('❌ Errore nella pulizia della cartella temp:', error.message);[span_66](end_span)
   }
}

function safeParseExtra(extraParam) {
   try {
       [span_67](start_span)if (!extraParam) return {};[span_67](end_span)
       [span_68](start_span)const decodedExtra = decodeURIComponent(extraParam);[span_68](end_span)
       
       // Supporto per skip con genere
       if (decodedExtra.includes('genre=') && decodedExtra.includes('&skip=')) {
           [span_69](start_span)const parts = decodedExtra.split('&');[span_69](end_span)
           [span_70](start_span)const genre = parts.find(p => p.startsWith('genre=')).split('=')[1];[span_70](end_span)
           [span_71](start_span)const skip = parts.find(p => p.startsWith('skip=')).split('=')[1];[span_71](end_span)
           return { 
               genre, 
               [span_72](start_span)skip: parseInt(skip, 10) ||[span_72](end_span)
               [span_73](start_span)0
           };
       }
       
       if (decodedExtra.startsWith('skip=')) {
           return { skip: parseInt(decodedExtra.split('=')[1], 10) ||[span_73](end_span)
           [span_74](start_span)0 };[span_74](end_span)
       }
       
       if (decodedExtra.startsWith('genre=')) {
           [span_75](start_span)return { genre: decodedExtra.split('=')[1] };[span_75](end_span)
       }
       
       if (decodedExtra.startsWith('search=')) {
           [span_76](start_span)return { search: decodedExtra.split('=')[1] };[span_76](end_span)
       }
       
       try {
           [span_77](start_span)return JSON.parse(decodedExtra);[span_77](end_span)
       } catch {
           [span_78](start_span)return {};[span_78](end_span)
       }
   } catch (error) {
       [span_79](start_span)console.error('Error parsing extra:', error);[span_79](end_span)
       return {};
   }
}

// Per il catalog con config codificato
app.get('/:config/catalog/:type/:id/:extra?.json', async (req, res) => {
   try {
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       const extra = req.params.extra 
           ? safeParseExtra(req.params.extra) 
           : {};
       
       [span_80](start_span)const result = await catalogHandler({[span_80](end_span)
           type: req.params.type, 
           id: req.params.id, 
           extra, 
           config: decodedConfig 
       });
       
       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       [span_81](start_span)console.error('Error handling catalog request:', error);[span_81](end_span)
       res.status(500).json({ error: 'Internal server error' });
   }
});
// Per lo stream con config codificato
app.get('/:config/stream/:type/:id.json', async (req, res) => {
   try {
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       
       const result = await streamHandler({ 
           type: req.params.type, 
           id: req.params.id, 
           [span_82](start_span)config: decodedConfig[span_82](end_span)
       });
       
       res.setHeader('Content-Type', 'application/json');
       res.send(result);
   } catch (error) {
       console.error('Error handling stream request:', error);
       res.status(500).json({ error: 'Internal server error' });
   }
});
// Per il meta con config codificato
app.get('/:config/meta/:type/:id.json', async (req, res) => {
   try {
       const configString = Buffer.from(req.params.config, 'base64').toString();
       const decodedConfig = Object.fromEntries(new URLSearchParams(configString));
       
       const result = await metaHandler({ 
           type: req.params.type, 
           id: req.params.id, 
           [span_83](start_span)config: decodedConfig[span_83](end_span)
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
   const PythonRunner = require('./python-runner');
   const fs = require('fs');
   
   try {
       if (fs.existsSync(PythonRunner.scriptPath)) {
           res.setHeader('Content-Type', 'text/plain');
           res.setHeader('Content-Disposition', 'attachment; filename="resolver_script.py"');
           res.sendFile(PythonRunner.scriptPath);
       } else {
           [span_84](start_span)res.status(404).send('File M3U non trovato. Eseguire prima lo script Python.');[span_84](end_span)
       }
   } catch (error) {
       console.error('Errore nel download del template:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
[span_85](start_span)app.post('/api/resolver', async (req, res) => {[span_85](end_span)
   const { action, url, interval } = req.body;
   
   try {
       if (action === 'download' && url) {
           const success = await PythonResolver.downloadScript(url);
           if (success) {
               [span_86](start_span)res.json({ success: true, message: 'Script resolver scaricato con successo' });[span_86](end_span)
           } else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'create-template') {
           const success = await PythonResolver.createScriptTemplate();
           if (success) {
               [span_87](start_span)res.json({[span_87](end_span)
                   success: true, 
                   message: 'Template script resolver creato con successo',
                   scriptPath: PythonResolver.scriptPath
               });
           [span_88](start_span)}
           else {
               res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });
           }
       } else if (action === 'check-health') {
           const isHealthy = await PythonResolver.checkScriptHealth();[span_88](end_span)
           res.json({ 
               success: isHealthy, 
               message: isHealthy ? 'Script resolver valido' : PythonResolver.getStatus().lastError 
           [span_89](start_span)});[span_89](end_span)
       } else if (action === 'status') {
           [span_90](start_span)res.json(PythonResolver.getStatus());[span_90](end_span)
       } else if (action === 'clear-cache') {
           [span_91](start_span)PythonResolver.clearCache();[span_91](end_span)
           res.json({ success: true, message: 'Cache resolver svuotata' });
       } else if (action === 'schedule' && interval) {
           [span_92](start_span)const success = PythonResolver.scheduleUpdate(interval);[span_92](end_span)
           if (success) {
               res.json({ 
                   success: true, 
                   message: `Aggiornamento automatico impostato ogni ${interval}` 
               [span_93](start_span)});[span_93](end_span)
           } else {
               [span_94](start_span)res.status(500).json({ success: false, message: PythonResolver.getStatus().lastError });[span_94](end_span)
           }
       } else if (action === 'stopSchedule') {
           [span_95](start_span)const stopped = PythonResolver.stopScheduledUpdates();[span_95](end_span)
           res.json({ 
               success: true, 
               message: stopped ? 'Aggiornamento automatico fermato' : 'Nessun aggiornamento pianificato da fermare' 
           [span_96](start_span)});[span_96](end_span)
       } else {
           [span_97](start_span)res.status(400).json({ success: false, message: 'Azione non valida' });[span_97](end_span)
       }
   } catch (error) {
       [span_98](start_span)console.error('Errore API Resolver:', error);[span_98](end_span)
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
       
       [span_99](start_span)if (req.body.epg_enabled === 'true') {[span_99](end_span)
           console.log('📡 Ricostruzione EPG in corso...');
           [span_100](start_span)const epgToUse = req.body.epg ||[span_100](end_span)
               (CacheManager.getCachedData().epgUrls && CacheManager.getCachedData().epgUrls.length > 0 
                   ? CacheManager.getCachedData().epgUrls.join(',') 
                   : null);
           if (epgToUse) {
               await EPGManager.initializeEPG(epgToUse);
           }
       }

       res.json({ success: true, message: 'Cache e EPG ricostruiti con successo' });
      
   } catch (error) {
       [span_101](start_span)console.error('Errore nella ricostruzione[span_101](end_span) della cache:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});
// Endpoint API per le operazioni sullo script Python
[span_102](start_span)app.post('/api/python-script', async (req, res) => {[span_102](end_span)
   const { action, url, interval } = req.body;
   
   try {
       if (action === 'download' && url) {
           const success = await PythonRunner.downloadScript(url);
           if (success) {
               [span_103](start_span)res.json({ success: true, message: 'Script scaricato con[span_103](end_span) successo' });
           } else {
               res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });
           }
       } else if (action === 'execute') {
           const success = await PythonRunner.executeScript();
           if (success) {
               [span_104](start_span)res.json({[span_104](end_span)
                   success: true, 
                   message: 'Script eseguito con successo', 
                   m3uUrl: `${req.protocol}://${req.get('host')}/generated-m3u` 
               [span_105](start_span)});[span_105](end_span)
           } else {
               [span_106](start_span)res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });[span_106](end_span)
           }
       } else if (action === 'status') {
           [span_107](start_span)res.json(PythonRunner.getStatus());[span_107](end_span)
       } else if (action === 'schedule' && interval) {
           [span_108](start_span)const success = PythonRunner.scheduleUpdate(interval);[span_108](end_span)
           if (success) {
               res.json({ 
                   success: true, 
                   message: `Aggiornamento automatico impostato ogni ${interval}` 
               [span_109](start_span)});[span_109](end_span)
           } else {
               [span_110](start_span)res.status(500).json({ success: false, message: PythonRunner.getStatus().lastError });[span_110](end_span)
           }
       } else if (action === 'stopSchedule') {
           [span_111](start_span)const stopped = PythonRunner.stopScheduledUpdates();[span_111](end_span)
           res.json({ 
               success: true, 
               message: stopped ? 'Aggiornamento automatico fermato' : 'Nessun aggiornamento pianificato da fermar' 
           [span_112](start_span)});[span_112](end_span)
       } else {
           [span_113](start_span)res.status(400).json({ success: false, message: 'Azione non valida' });[span_113](end_span)
       }
   } catch (error) {
       [span_114](start_span)console.error('Errore API Python:', error);[span_114](end_span)
       res.status(500).json({ success: false, message: error.message });
   }
});
async function startAddon() {
  [span_115](start_span)cleanupTempFolder();[span_115](end_span)
  try {
      const port = process.env.PORT || [span_116](start_span)10000;[span_116](end_span)
      app.listen(port, () => {
         console.log('=============================\n');
         console.log('OMG ADDON Avviato con successo');
         console.log('Visita la pagina web per generare la configurazione del manifest e installarla su stremio');
         console.log('Link alla pagina di configurazione:', `http://localhost:${port}`);
         console.log('=============================\n');
       [span_117](start_span)});[span_117](end_span)
   } catch (error) {
      console.error('Failed to start addon:', error);
      process.exit(1);
  }
}

startAddon();