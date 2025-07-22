const fs = require('fs');
const path = require('path');
const { getViewScripts } = require('./views-scripts');

const renderConfigPage = (protocol, host, query, manifest) => {
 // Verifica se o ficheiro addon-config.json existe (já existe)
 const configPath = path.join(__dirname, 'addon-config.json');

 // --- ALTERAÇÃO AQUI (Lógica para ocultar a URL do Manifest) ---
 // Tenta ler a variável de ambiente SHOW_CONFIG_FIELDS
 // Se não estiver definida ou for 'false', assume que os campos devem ser escondidos.
 const showConfigFields = process.env.SHOW_CONFIG_FIELDS === 'true'; [span_0](start_span)//[span_0](end_span)

 // Esta URL é construída para ser usada pelo botão "INSTALAR NO STREMIO"
 // e internamente pelo código, mas não será visível se showConfigFields for false.
 const manifestUrl = `${protocol}://${host}/manifest.json?${new URLSearchParams(query)}`;

 return `
     <!DOCTYPE html>
     <html>
     <head>
         <meta charset="utf-8">
         <title>${manifest.name}</title>
         <style>

:root {
  --bg-color: #202020; [span_1](start_span)/*[span_1](end_span) */
  --panel-bg-color: #333333; [span_2](start_span)/*[span_2](end_span) */
  --shadow-dark: #1a1a1a; [span_3](start_span)/*[span_3](end_span) */
  --shadow-light: #444444; [span_4](start_span)/*[span_4](end_span) */
}

body {
  background-color: var(--bg-color); [span_5](start_span)/*[span_5](end_span) */
  margin: 0; [span_6](start_span)/*[span_6](end_span) */
  padding: 0; [span_7](start_span)/*[span_7](end_span) */
  height: 100vh; [span_8](start_span)/*[span_8](end_span) */
  overflow-y: auto; [span_9](start_span)/*[span_9](end_span) */
  font-family: Arial, sans-serif; [span_10](start_span)/*[span_10](end_span) */
  color: #fff; [span_11](start_span)/*[span_11](end_span) */
  background: purple; [span_12](start_span)/*[span_12](end_span) */
}

.content, .config-form, .advanced-settings, #confirmModal > div, #pythonStatus, #generatedM3uUrl, #resolverStatus {
  background-color: var(--panel-bg-color) !important; [span_13](start_span)/*[span_13](end_span) */
  box-shadow: 10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light); [span_14](start_span)/*[span_14](end_span) */
  border-radius: 12px !important; [span_15](start_span)/*[span_15](end_span) */
}

             #background-video {
                 position: fixed; [span_16](start_span)/*[span_16](end_span) */
                 right: 0; [span_17](start_span)/*[span_17](end_span) */
                 bottom: 0; [span_18](start_span)/*[span_18](end_span) */
                 min-width: 100%; [span_19](start_span)/*[span_19](end_span) */
                 min-height: 100%; [span_20](start_span)/*[span_20](end_span) */
                 width: auto; [span_21](start_span)/*[span_21](end_span) */
                 height: auto; [span_22](start_span)/*[span_22](end_span) */
                 z-index: -1000; [span_23](start_span)/*[span_23](end_span) */
                 background: black; [span_24](start_span)/*[span_24](end_span) */
                 object-fit: cover; [span_25](start_span)/*[span_25](end_span) */
                 filter: blur(5px) brightness(0.5); [span_26](start_span)/*[span_26](end_span) */
             }
             .content {
                 position: relative; [span_27](start_span)/*[span_27](end_span) */
                 z-index: 1; [span_28](start_span)/*[span_28](end_span) */
                 max-width: 800px; [span_29](start_span)/*[span_29](end_span) */
                 margin: 0 auto; [span_30](start_span)/*[span_30](end_span) */
                 text-align: center; [span_31](start_span)/*[span_31](end_span) */
                 padding: 50px 20px; [span_32](start_span)/*[span_32](end_span) */
                 background: rgba(0,0,0,0.6); [span_33](start_span)/*[span_33](end_span) */
                 min-height: 100vh; [span_34](start_span)/*[span_34](end_span) */
                 display: flex; [span_35](start_span)/*[span_35](end_span) */
                 flex-direction: column; [span_36](start_span)/*[span_36](end_span) */
                 justify-content: flex-start; [span_37](start_span)/*[span_37](end_span) */
                 overflow-y: visible; [span_38](start_span)/*[span_38](end_span) */
             }

             .logo {
                 width: 150px; [span_39](start_span)/*[span_39](end_span) */
                 margin: 0 auto 20px; [span_40](start_span)/*[span_40](end_span) */
                 display: block; [span_41](start_span)/*[span_41](end_span) */
             }
             .manifest-url {
                 background: rgba(255,255,255,0.1); [span_42](start_span)/*[span_42](end_span) */
                 padding: 10px; [span_43](start_span)/*[span_43](end_span) */
                 border-radius: 4px; [span_44](start_span)/*[span_44](end_span) */
                 word-break: break-all; [span_45](start_span)/*[span_45](end_span) */
                 margin: 20px 0; [span_46](start_span)/*[span_46](end_span) */
                 font-size: 12px; [span_47](start_span)/*[span_47](end_span) */
             }

             .loader-overlay {
                 position: fixed; [span_48](start_span)/*[span_48](end_span) */
                 top: 0; [span_49](start_span)/*[span_49](end_span) */
                 left: 0; [span_50](start_span)/*[span_50](end_span) */
                 width: 100%; [span_51](start_span)/*[span_51](end_span) */
                 height: 100%; [span_52](start_span)/*[span_52](end_span) */
                 background: rgba(0,0,0,0.8); [span_53](start_span)/*[span_53](end_span) */
                 display: none; [span_54](start_span)/*[span_54](end_span) */
                 justify-content: center; [span_55](start_span)/*[span_55](end_span) */
                 align-items: center; [span_56](start_span)/*[span_56](end_span) */
                 z-index: 2000; [span_57](start_span)/*[span_57](end_span) */
                 flex-direction: column; [span_58](start_span)/*[span_58](end_span) */
             }
             
             .loader {
                 border: 6px solid #3d2a56; [span_59](start_span)/*[span_59](end_span) */
                 border-radius: 50%; [span_60](start_span)/*[span_60](end_span) */
                 border-top: 6px solid #8A5AAB; [span_61](start_span)/*[span_61](end_span) */
                 width: 50px; [span_62](start_span)/*[span_62](end_span) */
                 height: 50px; [span_63](start_span)/*[span_63](end_span) */
                 animation: spin 1s linear infinite; [span_64](start_span)/*[span_64](end_span) */
                 margin-bottom: 20px; [span_65](start_span)/*[span_65](end_span) */
             }
             
             .loader-message {
                 color: white; [span_66](start_span)/*[span_66](end_span) */
                 font-size: 18px; [span_67](start_span)/*[span_67](end_span) */
                 text-align: center; [span_68](start_span)/*[span_68](end_span) */
                 max-width: 80%; [span_69](start_span)/*[span_69](end_span) */
             }
             
             @keyframes spin {
                 0% { transform: rotate(0deg); [span_70](start_span)/*[span_70](end_span) */ }
                 100% { transform: rotate(360deg); [span_71](start_span)/*[span_71](end_span) */ }
             }
             
             .config-form {
                 text-align: left; [span_72](start_span)/*[span_72](end_span) */
                 background: rgba(255,255,255,0.1); [span_73](start_span)/*[span_73](end_span) */
                 padding: 20px; [span_74](start_span)/*[span_74](end_span) */
                 border-radius: 4px; [span_75](start_span)/*[span_75](end_span) */
                 margin-top: 30px; [span_76](start_span)/*[span_76](end_span) */
             }
             .config-form label {
                 display: block; [span_77](start_span)/*[span_77](end_span) */
                 margin: 10px 0 5px; [span_78](start_span)/*[span_78](end_span) */
                 color: #fff; [span_79](start_span)/*[span_79](end_span) */
             }
             .config-form input[type="text"],
             .config-form input[type="url"],
             .config-form input[type="password"],
             .config-form input[type="file"] {
                 width: 100%; [span_80](start_span)/*[span_80](end_span) */
                 padding: 8px; [span_81](start_span)/*[span_81](end_span) */
                 margin-bottom: 10px; [span_82](start_span)/*[span_82](end_span) */
                 border-radius: 4px; [span_83](start_span)/*[span_83](end_span) */
                 border: 1px solid #666; [span_84](start_span)/*[span_84](end_span) */
                 background: #333; [span_85](start_span)/*[span_85](end_span) */
                 color: white; [span_86](start_span)/*[span_86](end_span) */
             }
             .buttons {
                 margin: 30px 0; [span_87](start_span)/*[span_87](end_span) */
                 display: flex; [span_88](start_span)/*[span_88](end_span) */
                 justify-content: center; [span_89](start_span)/*[span_89](end_span) */
                 gap: 20px; [span_90](start_span)/*[span_90](end_span) */
             }
             button {
                 background: #8A5AAB; [span_91](start_span)/*[span_91](end_span) */
                 color: white; [span_92](start_span)/*[span_92](end_span) */
                 border: none; [span_93](start_span)/*[span_93](end_span) */
                 padding: 12px 24px; [span_94](start_span)/*[span_94](end_span) */
                 border-radius: 4px; [span_95](start_span)/*[span_95](end_span) */
                 cursor: pointer; [span_96](start_span)/*[span_96](end_span) */
                 font-size: 16px; [span_97](start_span)/*[span_97](end_span) */
             }
             .bottom-buttons {
                 margin-top: 20px; [span_98](start_span)/*[span_98](end_span) */
                 display: flex; [span_99](start_span)/*[span_99](end_span) */
                 justify-content: center; [span_100](start_span)/*[span_100](end_span) */
                 gap: 20px; [span_101](start_span)/*[span_101](end_span) */
             }
             .toast {
                 position: fixed; [span_102](start_span)/*[span_102](end_span) */
                 top: 20px; [span_103](start_span)/*[span_103](end_span) */
                 right: 20px; [span_104](start_span)/*[span_104](end_span) */
                 background: #4CAF50; [span_105](start_span)/*[span_105](end_span) */
                 color: white; [span_106](start_span)/*[span_106](end_span) */
                 padding: 15px 30px; [span_107](start_span)/*[span_107](end_span) */
                 border-radius: 4px; [span_108](start_span)/*[span_108](end_span) */
                 display: none; [span_109](start_span)/*[span_109](end_span) */
             }
             input[type="submit"] {
                 background: #8A5AAB; [span_110](start_span)/*[span_110](end_span) */
                 color: white; [span_111](start_span)/*[span_111](end_span) */
                 border: none; [span_112](start_span)/*[span_112](end_span) */
                 padding: 12px 24px; [span_113](start_span)/*[span_113](end_span) */
                 border-radius: 4px; [span_114](start_span)/*[span_114](end_span) */
                 cursor: pointer; [span_115](start_span)/*[span_115](end_span) */
                 font-size: 16px; [span_116](start_span)/*[span_116](end_span) */
                 width: 100%; [span_117](start_span)/*[span_117](end_span) */
                 margin-top: 20px; [span_118](start_span)/*[span_118](end_span) */
             }
             .advanced-settings {
                 background: rgba(255,255,255,0.05); [span_119](start_span)/*[span_119](end_span) */
                 border: 1px solid #666; [span_120](start_span)/*[span_120](end_span) */
                 border-radius: 4px; [span_121](start_span)/*[span_121](end_span) */
                 padding: 10px; [span_122](start_span)/*[span_122](end_span) */
                 margin-top: 10px; [span_123](start_span)/*[span_123](end_span) */
             }
             .advanced-settings-header {
                 cursor: pointer; [span_124](start_span)/*[span_124](end_span) */
                 display: flex; [span_125](start_span)/*[span_125](end_span) */
                 justify-content: space-between; [span_126](start_span)/*[span_126](end_span) */
                 align-items: center; [span_127](start_span)/*[span_127](end_span) */
                 color: #fff; [span_128](start_span)/*[span_128](end_span) */
             }
             .advanced-settings-content {
                 display: none; [span_129](start_span)/*[span_129](end_span) */
                 padding-top: 10px; [span_130](start_span)/*[span_130](end_span) */
             }
             .advanced-settings-content.show {
                 display: block; [span_131](start_span)/*[span_131](end_span) */
             }
             #confirmModal {
                 display: none; [span_132](start_span)/*[span_132](end_span) */
                 position: fixed; [span_133](start_span)/*[span_133](end_span) */
                 top: 0; [span_134](start_span)/*[span_134](end_span) */
                 left: 0; [span_135](start_span)/*[span_135](end_span) */
                 width: 100%; [span_136](start_span)/*[span_136](end_span) */
                 height: 100%; [span_137](start_span)/*[span_137](end_span) */
                 background: rgba(0,0,0,0.8); [span_138](start_span)/*[span_138](end_span) */
                 z-index: 1000; [span_139](start_span)/*[span_139](end_span) */
                 justify-content: center; [span_140](start_span)/*[span_140](end_span) */
                 align-items: center; [span_141](start_span)/*[span_141](end_span) */
             }
             #confirmModal > div {
                 background: #333; [span_142](start_span)/*[span_142](end_span) */
                 padding: 30px; [span_143](start_span)/*[span_143](end_span) */
                 border-radius: 10px; [span_144](start_span)/*[span_144](end_span) */
                 text-align: center; [span_145](start_span)/*[span_145](end_span) */
                 color: white; [span_146](start_span)/*[span_146](end_span) */
             }
             #confirmModal button {
                 margin: 0 10px; [span_147](start_span)/*[span_147](end_span) */
             }
             a {
                 color: #8A5AAB; [span_148](start_span)/*[span_148](end_span) */
                 text-decoration: none; [span_149](start_span)/*[span_149](end_span) */
             }
             a:hover {
                 text-decoration: underline; [span_150](start_span)/*[span_150](end_span) */
             }

             /* --- NOVO CSS PARA OCULTAR A SEÇÃO DA URL DO MANIFEST --- */
             .manifest-display-section {
                 display: ${showConfigFields ? 'block' : 'none'};
             }
             /* --- FIM DO NOVO CSS --- */

         </style>
     </head>
     <body>
         

         <div class="content">
             <img class="logo" src="${manifest.logo}" alt="logo">
             <h1>${manifest.name} <span style="font-size: 16px; color: #aaa;">v${manifest.version}</span></h1>

             <div class="manifest-display-section">
                 <div class="manifest-url">
                     <strong>URL Manifest:</strong><br>
                     ${protocol}://${host}/manifest.json?${new URLSearchParams(query)}
                 </div>

                 <div class="buttons">
                     <button onclick="copyManifestUrl()">COPIAR URL DO MANIFESTO</button>
                 </div>
             </div>
             <div class="buttons">
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
          
                         <div class="advanced-settings-content" id="advanced-settings-content">
                             <label>URL do Proxy:</label>
                             <input type="url" name="proxy" value="${query.proxy || ''}">
                             
                             <label>Palavra-passe do Proxy:</label>
                             <input type="password" name="proxy_pwd" value="${query.proxy_pwd || ''}">
                             
                             <label>
                                 <input type="checkbox" name="force_proxy" 
                                 ${query.force_proxy === 'true' ? 'checked' : ''}>
                                 Forçar Proxy
                        
                             </label>

                             <label>Sufixo do ID:</label>
                             <input type="text" name="id_suffix" value="${query.id_suffix || ''}" placeholder="Esempio: it">

                             <label>URL do ficheiro de remapeamento:</label>
                             <input type="text" name="remapper_path" value="${query.remapper_path || ''}" placeholder="Esempio: https://raw.githubusercontent.com/...">

                             <label>Intervalo de Atualização da Lista:</label>
                             <input type="text" name="update_interval" value="${query.update_interval || '12:00'}" placeholder="HH:MM (predefinito 12:00)">
                             <small style="color: #999;">Formato HH:MM (es. 1:00 o 01:00), predefinito 12:00</small>
                             
                           <label>URL do Script Resolver em Python:</label>
                             <input type="url" name="resolver_script" value="${query.resolver_script || ''}">
                             
                             <label>
                                 <input type="checkbox" name="resolver_enabled" 
                                 ${query.resolver_enabled === 'true' ? 'checked' : ''}>
                                 Ativar Resolver Python
                          
                             </label>
                        
                         </div>
                     </div>
                     <input type="hidden" name="python_script_url" id="hidden_python_script_url" value="${query.python_script_url || ''}">
                     <input type="hidden" name="python_update_interval" id="hidden_python_update_interval" value="${query.python_update_interval || ''}">
                     <input type="hidden" name="resolver_update_interval" id="hidden_resolver_update_interval" value="${query.resolver_update_interval || ''}">
                     <input type="submit" value="Gerar Configuração">
                 </form>

                 <div class="bottom-buttons">
                     <button onclick="backupConfig()">CÓPIA DE SEGURANÇA DA CONFIGURAÇÃO</button>
          <input type="file" id="restoreFile" accept=".json" style="display:none;" onchange="restoreConfig(event)">
                     <button onclick="document.getElementById('restoreFile').click()">REPOR CONFIGURAÇÃO</button>
                 </div>
                 <div style="margin-top: 15px; background: rgba(255,255,255,0.1); padding: 1px; border-radius: 4px;">
                     <ul style="text-align: center; margin-top: 10px;">
                         <p>Lembra-te de gerar a configuração antes de fazer a cópia de segurança</p>
                     </ul>
                 </div>
             </div>
       
             <div class="config-form" style="margin-top: 30px;">
                 <div class="advanced-settings">
                     <div class="advanced-settings-header" onclick="togglePythonSection()">
                         <strong>Gerar Lista com Script Python</strong>
      
                         <span id="python-section-toggle">▼</span>
                     </div>
                     <div class="advanced-settings-content" id="python-section-content">
                 
               <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">
                             <p><strong>Esta funcionalidade permite:</strong></p>
                             <ul style="text-align: left;">
                                 <li>Transferir um script Python de um URL</li>
                                 <li>Executá-lo dentro do contentor Docker</li>
                                 <li>Usar o ficheiro M3U gerado como fonte</li>
          
                         </ul>
                             <p><strong>Nota:</strong> L'URL deve puntare a uno script Python che genera un file M3U.</p>
                         </div>
       
                         <div id="pythonForm">
                             <label>URL do Script Python:</label>
                             <input type="url" id="pythonScriptUrl" placeholder="https://example.com/script.py">
 
                           <div style="display: flex; gap: 10px; margin-top: 15px;">
                                 <button onclick="downloadPythonScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>
                                 <button onclick="executePythonScript()" style="flex: 1;">EXECUTAR SCRIPT</button>
                 
                               <button onclick="checkPythonStatus()" style="flex: 1;">VERIFICAR ESTADO</button>
                             </div>
              
                   <div style="margin-top: 15px;">
                                 <h4>Atualização Automática</h4>
                                 <div style="display: flex; gap: 10px; align-items: center;">
                                     <input type="text" id="updateInterval" placeholder="HH:MM (es. 12:00)" style="flex: 2;">
                                     <button onclick="scheduleUpdates()" style="flex: 1;">AGENDAR</button>
          
                                   <button onclick="stopScheduledUpdates()" style="flex: 1;">PARAR</button>
                                 </div>
                              
                              <small style="color: #999; display: block; margin-top: 5px;">
                                     Formato: HH:MM (ex: 12:00 para 12 horas, 1:00 para 1 hora, 0:30 para 30 minutos)
                                 </small>
 
                         </div>
              
                             <div id="pythonStatus" style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: none;">
                                 <h3>Estado do Script Python</h3>
                                 <div id="pythonStatusContent"></div>
                 
                               </div>
              
                             <div id="generatedM3uUrl" style="margin-top: 15px; background: rgba(0,255,0,0.1); padding: 10px; border-radius: 4px; display: none;">
                                 <h3>URL da Lista Gerada</h3>
                                 <div id="m3uUrlContent"></div>
                 
                               <button onclick="useGeneratedM3u()" style="width: 100%; margin-top: 10px;">USAR ESTA LISTA</button>
                             </div>
                         </div>
                     </div>
              
               </div>
             </div>

             <div class="config-form" style="margin-top: 30px;">
                 <div class="advanced-settings">
                    
              <div class="advanced-settings-header" onclick="toggleResolverSection()">
                         <strong>Resolver Python para Stream</strong>
                         <span id="resolver-section-toggle">▼</span>
                     </div>
            
                     <div class="advanced-settings-content" id="resolver-section-content">
                         <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">
                             <p><strong>O que é o Resolver Python?</strong></p>
                             <p>O Resolver Python permite-te:</p>
                     
                           <ul style="text-align: left;">
                                 <li>Risolvere dinamicamente gli URL di streaming</li>
                               <li>Aggiungere token di autenticazione agli stream</li>
        
                                 <li>Gestire API protette per i provider de conteúdo</li>
                                 <li>Personalizar as requisições com header específicos</li>
   
                           </ul>
                             <p><strong>Nota: É necessário um script Python que implemente a função <code>resolve_link</code>.</p>
      
                         </div>
                     
                         <div id="resolverForm">
                     
                           <div style="display: flex; gap: 10px; margin-top: 15px;">
                                 <button onclick="downloadResolverScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>
                                 <button onclick="createResolverTemplate()" style="flex: 1;">CRIAR MODELO</button>
                 
                               <button onclick="checkResolverHealth()" style="flex: 1;">VERIFICAR SCRIPT</button>
                             </div>
                     
                           <div style="margin-top: 15px;">
                                 <h4>Gestão de Cache e Atualizações</h4>
                                 <div style="display: flex; gap: 10px; align-items: center;">
                                     <input type="text" id="resolverUpdateInterval" placeholder="HH:MM (es. 12:00)" style="flex: 2;">
                                     <button onclick="scheduleResolverUpdates()" style="flex: 1;">AGENDAR</button>
          
                                   <button onclick="stopResolverUpdates()" style="flex: 1;">PARAR</button>
                                     <button onclick="clearResolverCache()" style="flex: 1;">LIMPAR CACHE</button>
                      
                               </div>
                                 <small style="color: #999; display: block; margin-top: 5px;">
                                     Formato: HH:MM (ex: 12:00 para 12 horas, 1:00 para 1 hora, 0:30 para 30 minutos)
                                 </small>
       
                           </div>
                     
                             <div id="resolverStatus" style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: none;">
                                 <h3>Estado do Resolver Python</h3>
                                 <div id="resolverStatusContent"></div>
                 
                               </div>
                         </div>
                     </div>
                 </div>
      
               </div>

  
             <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #ccc;">
                 <p>Addon criado com paixão por McCoy88f - <a href="https://github.com/mccoy88f/OMG-Premium-TV" target="_blank">GitHub Repository</a></p>
                 
                 <h3 style="margin-top: 20px;">Apoia este projeto!</h3>
                 
        <div style="margin-top: 15px;">
                     <a href="https://www.buymeacoffee.com/mccoy88f" target="_blank">
                         <img src="https://img.buymeacoffee.com/button-api/?text=Oferece-me uma cerveja&emoji=🍺&slug=mccoy88f&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" style="max-width: 300px; margin: 0 auto;"/>
                     </a>
                 </div>
                 
                 <p style="margin-top: 15px;">
              
                 <a href="https://paypal.me/mccoy88f?country.x=IT&locale.x=it_IT" target="_blank">Podes também oferecer-me uma cerveja via PayPal 🍻</a>
                 </p>
                 
                 <div style="margin-top: 30px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px;">
                     <strong>ATENÇÃO!</strong>
                     <ul style="text-align: center; margin-top: 10px;">
                         <p>Não sou responsável pelo uso indevido do addon.</p>
                         <p>Verifica e respeita a legislação vigente no teu país!</p>
                     </ul>
     
               </div>
             </div>
             
             <div id="confirmModal">
                 <div>
                     
                   <h2>Confirmar Instalação</h2>
                     <p>Já geraste a configuração?</p>
                     <div style="margin-top: 20px;">
                         <button onclick="cancelInstallation()" style="background: #666;">Voltar</button>
 
                         <button onclick="proceedInstallation()" style="background: #8A5AAB;">Prosseguir</button>
                     </div>
                 </div>
             </div>
 
             <div id="toast" class="toast">URL Copiado!</div>
             
             <script>
                 ${getViewScripts(protocol, host)}
             </script>
         </div>
         <div id="loaderOverlay" class="loader-overlay">
             <div class="loader"></div>
             <div id="loaderMessage" class="loader-message">Operazione in corso...</div>
         </div>
     </body>
     </html>
 `;
};

module.exports = {
  renderConfigPage
};