const fs = require('fs');
const path = require('path');
const { getViewScripts } = require('./views-scripts');

const renderConfigPage = (protocol, host, query, manifest) => {
 const configPath = path.join(__dirname, 'addon-config.json');
 const m3uDefaultUrl = 'https://github.com/LAppDesign/MyTvAddon/blob/main/tv.png?raw=true';
 const showConfigFields = process.env.SHOW_CONFIG_FIELDS === 'true';

 return `
     <!DOCTYPE html>
     <html>
     <head>
         <meta charset="utf-8">
         <title>${manifest.name}</title>
         <style>

:root {
   --bg-color: #202020;
   --panel-bg-color: #333333;
   --shadow-dark: #1a1a1a;
   --shadow-light: #444444;
}

body {
   background-color: var(--bg-color);
}

.content, .config-form, .advanced-settings, #confirmModal > div, #pythonStatus, #generatedM3uUrl, #resolverStatus {
   background-color: var(--panel-bg-color) !important;
   box-shadow: 10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light);
   border-radius: 12px !important;
}


             body {
                 margin: 0;
                 padding: 0;
                 height: 100vh;
                 overflow-y: auto;
                 font-family: Arial, sans-serif;
                 color: #fff;
                 background: purple;
             }
             #background-video {
                 position: fixed;
                 right: 0;
                 bottom: 0;
                 min-width: 100%;
                 min-height: 100%;
                 width: auto;
                 height: auto;
                 z-index: -1000;
                 background: black;
                 object-fit: cover;
                 filter: blur(5px) brightness(0.5);
             }
             .content {
                 position: relative;
                 z-index: 1;
                 max-width: 800px;
                 margin: 0 auto;
                 text-align: center;
                 padding: 50px 20px;
                 background: rgba(0,0,0,0.6);
                 min-height: 100vh;
                 display: flex;
                 flex-direction: column;
                 justify-content: flex-start;
                 overflow-y: visible;
             }

             .logo {
                 width: 150px;
                 margin: 0 auto 20px;
                 display: block;
             }
             .manifest-url {
                 background: rgba(255,255,255,0.1);
                 padding: 10px;
                 border-radius: 4px;
                 word-break: break-all;
                 margin: 20px 0;
                 font-size: 12px;
             }

             .loader-overlay {
                 position: fixed;
                 top: 0;
                 left: 0;
                 width: 100%;
                 height: 100%;
                 background: rgba(0,0,0,0.8);
                 display: none;
                 justify-content: center;
                 align-items: center;
                 z-index: 2000;
                 flex-direction: column;
             }
             
             .loader {
                 border: 6px solid #3d2a56;
                 border-radius: 50%;
                 border-top: 6px solid #8A5AAB;
                 width: 50px;
                 height: 50px;
                 animation: spin 1s linear infinite;
                 margin-bottom: 20px;
             }
             
             .loader-message {
                 color: white;
                 font-size: 18px;
                 text-align: center;
                 max-width: 80%;
             }
             
             @keyframes spin {
                 0% { transform: rotate(0deg); }
                 100% { transform: rotate(360deg); }
             }
             
             .config-form {
                 text-align: left;
                 background: rgba(255,255,255,0.1);
                 padding: 20px;
                 border-radius: 4px;
                 margin-top: 30px;
             }
             .config-form label {
                 display: block;
                 margin: 10px 0 5px;
                 color: #fff;
             }
             .config-form input[type="text"],
             .config-form input[type="url"],
             .config-form input[type="password"],
             .config-form input[type="file"] {
                 width: 100%;
                 padding: 8px;
                 margin-bottom: 10px;
                 border-radius: 4px;
                 border: 1px solid #666;
                 background: #333;
                 color: white;
             }
             .buttons {
                 margin: 30px 0;
                 display: flex;
                 justify-content: center;
                 gap: 20px;
             }
             button {
                 background: #8A5AAB;
                 color: white;
                 border: none;
                 padding: 12px 24px;
                 border-radius: 4px;
                 cursor: pointer;
                 font-size: 16px;
             }
             /* NOVO: Classe para esconder seções */
             .hidden-section {
                 display: none;
             }
             .toast {
                 position: fixed;
                 top: 20px;
                 right: 20px;
                 background: #4CAF50;
                 color: white;
                 padding: 15px 30px;
                 border-radius: 4px;
                 display: none;
             }
             input[type="submit"] {
                 background: #8A5AAB;
                 color: white;
                 border: none;
                 padding: 12px 24px;
                 border-radius: 4px;
                 cursor: pointer;
                 font-size: 16px;
                 width: 100%;
                 margin-top: 20px;
             }
             .advanced-settings {
                 background: rgba(255,255,255,0.05);
                 border: 1px solid #666;
                 border-radius: 4px;
                 padding: 10px;
                 margin-top: 10px;
             }
             .advanced-settings-header {
                 cursor: pointer;
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 color: #fff;
             }
             .advanced-settings-content {
                 display: none;
                 padding-top: 10px;
             }
             .advanced-settings-content.show {
                 display: block;
             }
             #confirmModal {
                 display: none;
                 position: fixed;
                 top: 0;
                 left: 0;
                 width: 100%;
                 height: 100%;
                 background: rgba(0,0,0,0.8);
                 z-index: 1000;
                 justify-content: center;
                 align-items: center;
             }
             #confirmModal > div {
                 background: #333;
                 padding: 30px;
                 border-radius: 10px;
                 text-align: center;
                 color: white;
             }
             #confirmModal button {
                 margin: 0 10px;
             }
             a {
                 color: #8A5AAB;
                 text-decoration: none;
             }
             a:hover {
                 text-decoration: underline;
             }
         </style>
     </head>
     <body>
         

         <div class="content">
             <img class="logo" src="${manifest.logo}" alt="logo">
             <h1>${manifest.name} <span style="font-size: 16px; color: #aaa;">v${manifest.version}</span></h1>

            
             <div class="manifest-url">
                 <strong>URL Manifest:</strong><br>
                 ${protocol}://${host}/manifest.json?${new URLSearchParams(query)}
             </div>

             <div class="buttons">
                 <button onclick="copyManifestUrl()">COPIAR URL DO MANIFESTO</button>
                 <button onclick="installAddon()">INSTALAR NO STREMIO</button>
             </div>
             
             <div class="config-form">
                 <h2>Gerar Configuração</h2>
                 <form id="configForm" onsubmit="updateConfig(event)">

                 ${showConfigFields ? `
                     <label>URL:</label>
                     <input type="url" name="m3u" 
                            value="${query.m3u || ''}" 
                            required>
                     
                     <label>URL do EPG:</label>
                     <input type="url" name="epg" value="${query.epg || ''}">
                     
                     <label>
                         <input type="checkbox" name="epg_enabled" ${query.epg_enabled === 'true' ? 'checked' : ''}>
                          Ativar EPG
                      </label>
                  ` : `
                      <p>A configuração da lista M3U e EPG está desativada no momento.</p>
                      <p>Entre em contato com o administrador para obter o URL de instalação.</p>
                  `}
                  <div class="advanced-settings">
                          <div class="advanced-settings-header" onclick="toggleAdvancedSettings()">
                              <strong>Definições Avançadas</strong>
                              <span id="advanced-settings-toggle">▼</span>
                          </div>
                      
                          <div class="advanced-settings-content" id="advanced-settings-content">\n                               <label>URL do Proxy:</label>\n                               <input type="url" name="proxy" value="${query.proxy || ''}">\n                               \n                               <label>Palavra-passe do Proxy:</label>\n                               <input type="password" name="proxy_pwd" value="${query.proxy_pwd || ''}">\n                               \n                               <label>\n                                   <input type="checkbox" name="force_proxy" \n                                   ${query.force_proxy === 'true' ? 'checked' : ''}>\n                                   Forçar Proxy\n                               </label>\n\n                               <label>Sufixo do ID:</label>\n                               <input type="text" name="id_suffix" value="${query.id_suffix || ''}" placeholder="Esempio: it">\n\n                               <label>URL do ficheiro de remapeamento:</label>\n                               <input type="text" name="remapper_path" value="${query.remapper_path || ''}" placeholder="Esempio: https://raw.githubusercontent.com/...">\n\n                               <label>Intervalo de Atualização da Lista:</label>\n                               <input type="text" name="update_interval" value="${query.update_interval || '12:00'}" placeholder="HH:MM (predefinito 12:00)">\n                               <small style="color: #999;">Formato HH:MM (es. 1:00 o 01:00), predefinito 12:00</small>\n                               \n                               <label>URL do Script Resolver em Python:</label>\n                               <input type="url" name="resolver_script" value="${query.resolver_script || ''}">\n                               \n                               <label>\n                                   <input type="checkbox" name="resolver_enabled" \n                                   ${query.resolver_enabled === 'true' ? 'checked' : ''}>\n                                   Ativar Resolver Python\n                               </label>\n                          \n                           </div>\n                       </div>\n                       <input type="hidden" name="python_script_url" id="hidden_python_script_url" value="${query.python_script_url || ''}">\n                       <input type="hidden" name="python_update_interval" id="hidden_python_update_interval" value="${query.python_update_interval || ''}">\n                       <input type="hidden" name="resolver_update_interval" id="hidden_resolver_update_interval" value="${query.resolver_update_interval || ''}">\n                       <input type="submit" value="Gerar Configuração">\n                   </form>\n\n\n               </div>\n            \n\n               <div class="config-form hidden-section"> \n                   <div class="advanced-settings">\n                       <div class="advanced-settings-header" onclick="togglePythonSection()">\n                           <strong>Gerar Lista com Script Python</strong>\n                           <span id="python-section-toggle">▼</span>\n                       </div>\n                       <div class="advanced-settings-content" id="python-section-content">\n                   \n                           <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">\n                               <p><strong>Esta funcionalidade permite:</strong></p>\n                               <ul style="text-align: left;">\n                                   <li>Transferir um script Python de um URL</li>\n                                   <li>Executá-lo dentro do contentor Docker</li>\n                                   <li>Usar o ficheiro M3U gerado como fonte</li>\n            \n                               </ul>\n                               <p><strong>Nota:</strong> L'URL deve puntare a uno script Python che genera un file M3U.</p>\n                           </div>\n           \n                           <div id="pythonForm">\n                               <label>URL do Script Python:</label>\n                               <input type="url" id="pythonScriptUrl" placeholder="https://example.com/script.py">\n   \n                               <div style="display: flex; gap: 10px; margin-top: 15px;">\n                                   <button onclick="downloadPythonScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>\n                                   <button onclick="executePythonScript()" style="flex: 1;">EXECUTAR SCRIPT</button>\n                   \n                                   <button onclick="checkPythonStatus()" style="flex: 1;">VERIFICAR ESTADO</button>\n                               </div>\n                \n                               <div style="margin-top: 15px;">\n                                   <h4>Atualização Automática</h4>\n                                   <div style="display: flex; gap: 10px; align-items: center;">\n                                       <input type="text" id="updateInterval" placeholder="HH:MM (es. 12:00)" style="flex: 2;">\n                                       <button onclick="scheduleUpdates()" style="flex: 1;">AGENDAR</button>\n                                       <button onclick="stopScheduledUpdates()" style="flex: 1;">PARAR</button>\n                                   </div>\n                                \n                                   <small style="color: #999; display: block; margin-top: 5px;">\n                                       Formato: HH:MM (ex: 12:00 para 12 horas, 1:00 para 1 hora, 0:30 para 30 minutos)\n                                   </small>\n   \n                               </div>\n                \n                               <div id="pythonStatus" style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: none;">\n                                   <h3>Estado do Script Python</h3>\n                                   <div id="pythonStatusContent"></div>\n                   \n                               </div>\n                \n                               <div id="generatedM3uUrl" style="margin-top: 15px; background: rgba(0,255,0,0.1); padding: 10px; border-radius: 4px; display: none;">\n                                   <h3>URL da Lista Gerada</h3>\n                                   <div id="m3uUrlContent"></div>\n                   \n                                   <button onclick="useGeneratedM3u()" style="width: 100%; margin-top: 10px;">USAR ESTA LISTA</button>\n                               </div>\n                           </div>\n                       </div>\n                \n                   </div>\n               </div>\n\n               <div class="config-form hidden-section"> \n                   <div class="advanced-settings">\n                      \n                       <div class="advanced-settings-header" onclick="toggleResolverSection()">\n                           <strong>Resolver Python para Stream</strong>\n                           <span id="resolver-section-toggle">▼</span>\n                       </div>\n                \n                       <div class="advanced-settings-content" id="resolver-section-content">\n                           <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">\n                               <p><strong>O que é o Resolver Python?</strong></p>\n                               <p>O Resolver Python permite-te:</p>\n                       \n                               <ul style="text-align: left;">\n                                   <li>Risolvere dinamicamente gli URL di streaming</li>\n                                   <li>Aggiungere token di autenticação agli stream</li>\n          \n                                   <li>Gestire API protette per i provider de conteúdo</li>\n                                   <li>Personalizar as requisições com header específicos</li>\n                            \n                               </ul>\n                               <p><strong>Nota: É necessário um script Python que implemente a função <code>resolve_link</code>.</p>\n                           </div>\n                       \n                           <div id="resolverForm">\n                       \n                               <div style="display: flex; gap: 10px; margin-top: 15px;">\n                                   <button onclick="downloadResolverScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>\n                                   <button onclick="createResolverTemplate()" style="flex: 1;">CRIAR MODELO</button>\n                   \n                                   <button onclick="checkResolverHealth()" style="flex: 1;">VERIFICAR SCRIPT</button>\n                               </div>\n                       \n                               <div style="margin-top: 15px;">\n                                   <h4>Gestão de Cache e Atualizações</h4>\n                                   <div style="display: flex; gap: 10px; align-items: center;">\n                                       <input type="text" id="resolverUpdateInterval" placeholder="HH:MM (es. 12:00)" style="flex: 2;">\n                                       <button onclick="scheduleResolverUpdates()" style="flex: 1;">AGENDAR</button>\n                                       <button onclick="stopResolverUpdates()" style="flex: 1;">PARAR</button>\n                                       <button onclick="clearResolverCache()" style="flex: 1;">LIMPAR CACHE</button>\n                        \n                                   </div>\n                                   <small style="color: #999; display: block; margin-top: 5px;">\n                                       Formato: HH:MM (ex: 12:00 para 12 horas, 1:00 para 1 hora, 0:30 para 30 minutos)\n                                   </small>\n         \n                               </div>\n                       \n                               <div id="resolverStatus" style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: none;">\n                                   <h3>Estado do Resolver Python</h3>\n                                   <div id="resolverStatusContent"></div>\n                   \n                               </div>\n                           </div>\n                       </div>\n                   </div>\n               </div>\n\n    \n               <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #ccc;">\n                   <p>Addon criado com paixão por McCoy88f - <a href="https://github.com/mccoy88f/OMG-Premium-TV" target="_blank">GitHub Repository</a></p>\n                   \n                   <h3 style="margin-top: 20px;">Apoia este projeto!</h3>\n                   \n                   <div style="margin-top: 15px;">\n                       <a href="https://www.buymeacoffee.com/mccoy88f" target="_blank">\n                           <img src="https://img.buymeacoffee.com/button-api/?text=Oferece-me uma cerveja&emoji=🍺&slug=mccoy88f&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" style="max-width: 300px; margin: 0 auto;"/>\n                       </a>\n                   </div>\n                   \n                   <p style="margin-top: 15px;">\n                \n                       <a href="https://paypal.me/mccoy88f?country.x=IT&locale.x=it_IT" target="_blank">Podes também oferecer-me uma cerveja via PayPal 🍻</a>\n                   </p>\n                   \n                   <div style="margin-top: 30px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px;">\n                       <strong>ATENÇÃO!</strong>\n                       <ul style="text-align: center; margin-top: 10px;">\n                           <p>Não sou responsável pelo uso indevido do addon.</p>\n                           <p>Verifica e respeita a legislação vigente no teu país!</p>\n                       </ul>\n       \n                   </div>\n               </div>\n               \n               <div id="confirmModal">\n                   <div>\n                       \n                       <h2>Confirmar Instalação</h2>\n                       <p>Já geraste a configuração?</p>\n                       <div style="margin-top: 20px;">\n                           <button onclick="cancelInstallation()" style="background: #666;">Voltar</button>\n                  \n                           <button onclick="proceedInstallation()" style="background: #8A5AAB;">Prosseguir</button>\n                       </div>\n                   </div>\n               </div>\n               \n               <div id="toast" class="toast">URL Copiado!</div>\n               \n               <script>\n                   ${getViewScripts(protocol, host)}\n               </script>\n           </div>\n           <div id="loaderOverlay" class="loader-overlay">\n               <div class="loader"></div>\n               <div id="loaderMessage" class="loader-message">Operazione in corso...</div>\n           </div>\n       </body>\n       </html>\n   `;
};

module.exports = {
   renderConfigPage
};