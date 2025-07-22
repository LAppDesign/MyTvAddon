[span_0](start_span)const fs = require('fs');[span_0](end_span)
[span_1](start_span)const path = require('path');[span_1](end_span)
[span_2](start_span)const { getViewScripts } = require('./views-scripts');[span_2](end_span)

[span_3](start_span)const renderConfigPage = (protocol, host, query, manifest) => {[span_3](end_span)
  [span_4](start_span)const configPath = path.join(__dirname, 'addon-config.json');[span_4](end_span)
  [span_5](start_span)const m3uDefaultUrl = 'https://github.com/LAppDesign/MyTvAddon/blob/main/tv.png?raw=true';[span_5](end_span)

  [span_6](start_span)const showConfigFields = process.env.SHOW_CONFIG_FIELDS === 'true';[span_6](end_span)

  return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>${manifest.name}</title>
          <style>

:root {
   --bg-color: #202020;
  -[span_7](start_span)-panel-bg-color: #333333;[span_7](end_span)
  -[span_8](start_span)-shadow-dark: #1a1a1a;[span_8](end_span)
  -[span_9](start_span)-shadow-light: #444444;[span_9](end_span)
}

body {
  [span_10](start_span)background-color: var(--bg-color);[span_10](end_span)
}

.content, .config-form, .advanced-settings, #confirmModal > div, #pythonStatus, #generatedM3uUrl, #resolverStatus {
  [span_11](start_span)background-color: var(--panel-bg-color) !important;[span_11](end_span)
  [span_12](start_span)box-shadow: 10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light);[span_12](end_span)
  [span_13](start_span)border-radius: 12px !important;[span_13](end_span)
}


             body {
                 [span_14](start_span)margin: 0;[span_14](end_span)
                 [span_15](start_span)padding: 0;[span_15](end_span)
                 [span_16](start_span)height: 100vh;[span_16](end_span)
                 [span_17](start_span)overflow-y: auto;[span_17](end_span)
                 [span_18](start_span)font-family: Arial, sans-serif;[span_18](end_span)
                 [span_19](start_span)color: #fff;[span_19](end_span)
                 [span_20](start_span)background: purple;[span_20](end_span)
             }
             #background-video {
                 [span_21](start_span)position: fixed;[span_21](end_span)
                 [span_22](start_span)right: 0;[span_22](end_span)
                 [span_23](start_span)bottom: 0;[span_23](end_span)
                 [span_24](start_span)min-width: 100%;[span_24](end_span)
                 [span_25](start_span)min-height: 100%;[span_25](end_span)
                 [span_26](start_span)width: auto;[span_26](end_span)
                 [span_27](start_span)height: auto;[span_27](end_span)
                 [span_28](start_span)z-index: -1000;[span_28](end_span)
                 [span_29](start_span)background: black;[span_29](end_span)
                 [span_30](start_span)object-fit: cover;[span_30](end_span)
                 [span_31](start_span)filter: blur(5px) brightness(0.5);[span_31](end_span)
             }
             .content {
                 [span_32](start_span)position: relative;[span_32](end_span)
                 [span_33](start_span)z-index: 1;[span_33](end_span)
                 [span_34](start_span)max-width: 800px;[span_34](end_span)
                 [span_35](start_span)margin: 0 auto;[span_35](end_span)
                 [span_36](start_span)text-align: center;[span_36](end_span)
                 [span_37](start_span)padding: 50px 20px;[span_37](end_span)
                 [span_38](start_span)background: rgba(0,0,0,0.6);[span_38](end_span)
                 [span_39](start_span)min-height: 100vh;[span_39](end_span)
                 [span_40](start_span)display: flex;[span_40](end_span)
                 [span_41](start_span)flex-direction: column;[span_41](end_span)
                 [span_42](start_span)justify-content: flex-start;[span_42](end_span)
                 [span_43](start_span)overflow-y: visible;[span_43](end_span)
             }

             .logo {
                 [span_44](start_span)width: 150px;[span_44](end_span)
                 [span_45](start_span)margin: 0 auto 20px;[span_45](end_span)
                 [span_46](start_span)display: block;[span_46](end_span)
             }
             .manifest-url {
                 [span_47](start_span)background: rgba(255,255,255,0.1);[span_47](end_span)
                 [span_48](start_span)padding: 10px;[span_48](end_span)
                 [span_49](start_span)border-radius: 4px;[span_49](end_span)
                 [span_50](start_span)word-break: break-all;[span_50](end_span)
                 [span_51](start_span)margin: 20px 0;[span_51](end_span)
                 [span_52](start_span)font-size: 12px;[span_52](end_span)
             }

             .loader-overlay {
                 [span_53](start_span)position: fixed;[span_53](end_span)
                 [span_54](start_span)top: 0;[span_54](end_span)
                 [span_55](start_span)left: 0;[span_55](end_span)
                 [span_56](start_span)width: 100%;[span_56](end_span)
                 [span_57](start_span)height: 100%;[span_57](end_span)
                 [span_58](start_span)background: rgba(0,0,0,0.8);[span_58](end_span)
                 [span_59](start_span)display: none;[span_59](end_span)
                 [span_60](start_span)justify-content: center;[span_60](end_span)
                 [span_61](start_span)align-items: center;[span_61](end_span)
                 [span_62](start_span)z-index: 2000;[span_62](end_span)
                 [span_63](start_span)flex-direction: column;[span_63](end_span)
             }
             
             .loader {
                 [span_64](start_span)border: 6px solid #3d2a56;[span_64](end_span)
                 [span_65](start_span)border-radius: 50%;[span_65](end_span)
                 [span_66](start_span)border-top: 6px solid #8A5AAB;[span_66](end_span)
                 [span_67](start_span)width: 50px;[span_67](end_span)
                 [span_68](start_span)height: 50px;[span_68](end_span)
                 [span_69](start_span)animation: spin 1s linear infinite;[span_69](end_span)
                 [span_70](start_span)margin-bottom: 20px;[span_70](end_span)
             }
             
             .loader-message {
                 [span_71](start_span)color: white;[span_71](end_span)
                 [span_72](start_span)font-size: 18px;[span_72](end_span)
                 [span_73](start_span)text-align: center;[span_73](end_span)
                 [span_74](start_span)max-width: 80%;[span_74](end_span)
             }
             
             @keyframes spin {
                 [span_75](start_span)0% { transform: rotate(0deg);[span_75](end_span)
}
                 [span_76](start_span)100% { transform: rotate(360deg);[span_76](end_span)
}
             }
             
             .config-form {
                 [span_77](start_span)text-align: left;[span_77](end_span)
                 [span_78](start_span)background: rgba(255,255,255,0.1);[span_78](end_span)
                 [span_79](start_span)padding: 20px;[span_79](end_span)
                 [span_80](start_span)border-radius: 4px;[span_80](end_span)
                 [span_81](start_span)margin-top: 30px;[span_81](end_span)
             }
             .config-form label {
                 [span_82](start_span)display: block;[span_82](end_span)
                 [span_83](start_span)margin: 10px 0 5px;[span_83](end_span)
                 [span_84](start_span)color: #fff;[span_84](end_span)
             }
             .config-form input[type="text"],
             .config-form input[type="url"],
             .config-form input[type="password"],
             .config-form input[type="file"] {
                 [span_85](start_span)width: 100%;[span_85](end_span)
                 [span_86](start_span)padding: 8px;[span_86](end_span)
                 [span_87](start_span)margin-bottom: 10px;[span_87](end_span)
                 [span_88](start_span)border-radius: 4px;[span_88](end_span)
                 [span_89](start_span)border: 1px solid #666;[span_89](end_span)
                 [span_90](start_span)background: #333;[span_90](end_span)
                 [span_91](start_span)color: white;[span_91](end_span)
             }
             .buttons {
                 [span_92](start_span)margin: 30px 0;[span_92](end_span)
                 [span_93](start_span)display: flex;[span_93](end_span)
                 [span_94](start_span)justify-content: center;[span_94](end_span)
                 [span_95](start_span)gap: 20px;[span_95](end_span)
             }
             button {
                 [span_96](start_span)background: #8A5AAB;[span_96](end_span)
                 [span_97](start_span)color: white;[span_97](end_span)
                 [span_98](start_span)border: none;[span_98](end_span)
                 [span_99](start_span)padding: 12px 24px;[span_99](end_span)
                 [span_100](start_span)border-radius: 4px;[span_100](end_span)
                 [span_101](start_span)cursor: pointer;[span_101](end_span)
                 [span_102](start_span)font-size: 16px;[span_102](end_span)
             }
             .bottom-buttons {
                 [span_103](start_span)margin-top: 20px;[span_103](end_span)
                 [span_104](start_span)display: flex;[span_104](end_span)
                 [span_105](start_span)justify-content: center;[span_105](end_span)
                 [span_106](start_span)gap: 20px;[span_106](end_span)
             }
             .toast {
                 [span_107](start_span)position: fixed;[span_107](end_span)
                 [span_108](start_span)top: 20px;[span_108](end_span)
                 [span_109](start_span)right: 20px;[span_109](end_span)
                 [span_110](start_span)background: #4CAF50;[span_110](end_span)
                 [span_111](start_span)color: white;[span_111](end_span)
                 [span_112](start_span)padding: 15px 30px;[span_112](end_span)
                 [span_113](start_span)border-radius: 4px;[span_113](end_span)
                 [span_114](start_span)display: none;[span_114](end_span)
             }
             input[type="submit"] {
                 [span_115](start_span)background: #8A5AAB;[span_115](end_span)
                 [span_116](start_span)color: white;[span_116](end_span)
                 [span_117](start_span)border: none;[span_117](end_span)
                 [span_118](start_span)padding: 12px 24px;[span_118](end_span)
                 [span_119](start_span)border-radius: 4px;[span_119](end_span)
                 [span_120](start_span)cursor: pointer;[span_120](end_span)
                 [span_121](start_span)font-size: 16px;[span_121](end_span)
                 [span_122](start_span)width: 100%;[span_122](end_span)
                 [span_123](start_span)margin-top: 20px;[span_123](end_span)
             }
             .advanced-settings {
                 [span_124](start_span)background: rgba(255,255,255,0.05);[span_124](end_span)
                 [span_125](start_span)border: 1px solid #666;[span_125](end_span)
                 [span_126](start_span)border-radius: 4px;[span_126](end_span)
                 [span_127](start_span)padding: 10px;[span_127](end_span)
                 [span_128](start_span)margin-top: 10px;[span_128](end_span)
             }
             .advanced-settings-header {
                 [span_129](start_span)cursor: pointer;[span_129](end_span)
                 [span_130](start_span)display: flex;[span_130](end_span)
                 [span_131](start_span)justify-content: space-between;[span_131](end_span)
                 [span_132](start_span)align-items: center;[span_132](end_span)
                 [span_133](start_span)color: #fff;[span_133](end_span)
             }
             .advanced-settings-content {
                 [span_134](start_span)display: none;[span_134](end_span)
                 [span_135](start_span)padding-top: 10px;[span_135](end_span)
             }
             .advanced-settings-content.show {
                 [span_136](start_span)display: block;[span_136](end_span)
             }
             #confirmModal {
                 [span_137](start_span)display: none;[span_137](end_span)
                 [span_138](start_span)position: fixed;[span_138](end_span)
                 [span_139](start_span)top: 0;[span_139](end_span)
                 [span_140](start_span)left: 0;[span_140](end_span)
                 [span_141](start_span)width: 100%;[span_141](end_span)
                 [span_142](start_span)height: 100%;[span_142](end_span)
                 [span_143](start_span)background: rgba(0,0,0,0.8);[span_143](end_span)
                 [span_144](start_span)z-index: 1000;[span_144](end_span)
                 [span_145](start_span)justify-content: center;[span_145](end_span)
                 [span_146](start_span)align-items: center;[span_146](end_span)
             }
             #confirmModal > div {
                 [span_147](start_span)background: #333;[span_147](end_span)
                 [span_148](start_span)padding: 30px;[span_148](end_span)
                 [span_149](start_span)border-radius: 10px;[span_149](end_span)
                 [span_150](start_span)text-align: center;[span_150](end_span)
                 [span_151](start_span)color: white;[span_151](end_span)
             }
             #confirmModal button {
                 [span_152](start_span)margin: 0 10px;[span_152](end_span)
             }
             a {
                 [span_153](start_span)color: #8A5AAB;[span_153](end_span)
                 [span_154](start_span)text-decoration: none;[span_154](end_span)
             }
             a:hover {
                 [span_155](start_span)text-decoration: underline;[span_155](end_span)
             }
         </style>
     </head>
     <body>
         

         <div class="content">
             <img class="logo" src="${manifest.logo}" alt="logo">
             <h1>${manifest.name} <span style="font-size: 16px; color: #aaa;">v${manifest.version}</span></h1>

            
             [span_156](start_span)<div class="manifest-url">[span_156](end_span)
                 <strong>URL Manifest:</strong><br>
                 ${protocol}://${host}/manifest.json?${new URLSearchParams(query)}
             </div>

             <div class="buttons">
                 <button onclick="copyManifestUrl()">COPIAR URL DO MANIFESTO</button>
                 [span_157](start_span)<button onclick="installAddon()">INSTALAR NO STREMIO</button>[span_157](end_span)
             </div>
             
             <div class="config-form">
                 <h2>Gerar Configuração</h2>
                 <form id="configForm" onsubmit="updateConfig(event)">

                 ${showConfigFields ? [span_158](start_span)`
                     <label>URL:</label>[span_158](end_span)
                     <input type="url" name="m3u" 
                            value="${query.m3u || ''}" 
                            [span_159](start_span)required>[span_159](end_span)
                     
                     [span_160](start_span)<label>URL do EPG:</label>[span_160](end_span)
                     [span_161](start_span)<input type="url" name="epg" value="${query.epg || ''}">[span_161](end_span)
                  
                     [span_162](start_span)<label>[span_162](end_span)
                         <input type="checkbox" name="epg_enabled" ${query.epg_enabled === 'true' ? [span_163](start_span)'checked' : ''}>[span_163](end_span)
                         Ativar EPG
                     </label>
                 ` : `
                     [span_164](start_span)<p>A configuração da lista M3U e EPG está desativada no momento.</p>[span_164](end_span)
                     [span_165](start_span)<p>Entre em contato com o administrador para obter o URL de instalação.</p>[span_165](end_span)
                 `}
                 <div class="advanced-settings">
                         [span_166](start_span)<div class="advanced-settings-header" onclick="toggleAdvancedSettings()">[span_166](end_span)
                             [span_167](start_span)<strong>Definições Avançadas</strong>[span_167](end_span)
                             [span_168](start_span)<span id="advanced-settings-toggle">▼</span>[span_168](end_span)
                         </div>
          
                         [span_169](start_span)<div class="advanced-settings-content" id="advanced-settings-content">[span_169](end_span)
                             [span_170](start_span)<label>URL do Proxy:</label>[span_170](end_span)
                             [span_171](start_span)<input type="url" name="proxy" value="${query.proxy || ''}">[span_171](end_span)
                             
                             [span_172](start_span)<label>Palavra-passe do Proxy:</label>[span_172](end_span)
                             [span_173](start_span)<input type="password" name="proxy_pwd" value="${query.proxy_pwd || ''}">[span_173](end_span)
                             
                             [span_174](start_span)<label>[span_174](end_span)
                                 <input type="checkbox" name="force_proxy" 
                                 ${query.force_proxy === 'true' ? [span_175](start_span)'checked' : ''}>[span_175](end_span)
                                 Forçar Proxy
                             [span_176](start_span)</label>[span_176](end_span)

                             [span_177](start_span)<label>Sufixo do ID:</label>[span_177](end_span)
                             [span_178](start_span)<input type="text" name="id_suffix" value="${query.id_suffix || ''}" placeholder="Esempio: it">[span_178](end_span)

                             [span_179](start_span)<label>URL do ficheiro de remapeamento:</label>[span_179](end_span)
                             [span_180](start_span)<input type="text" name="remapper_path" value="${query.remapper_path || ''}" placeholder="Esempio: https://raw.githubusercontent.com/...">[span_180](end_span)

                             [span_181](start_span)<label>Intervalo de Atualização da Lista:</label>[span_181](end_span)
                             [span_182](start_span)<input type="text" name="update_interval" value="${query.update_interval || '12:00'}" placeholder="HH:MM (predefinito 12:00)">[span_182](end_span)
                             [span_183](start_span)<small style="color: #999;">Formato HH:MM (es. 1:00 o 01:00), predefinito 12:00</small>[span_183](end_span)
                             
                             [span_184](start_span)<label>URL do Script Resolver em Python:</label>[span_184](end_span)
                             [span_185](start_span)<input type="url" name="resolver_script" value="${query.resolver_script || ''}">[span_185](end_span)
                             
                             [span_186](start_span)<label>[span_186](end_span)
                                 <input type="checkbox" name="resolver_enabled" 
                                 ${query.resolver_enabled === 'true' ? [span_187](start_span)'checked' : ''}>[span_187](end_span)
                                 Ativar Resolver Python
                          [span_188](start_span)</label>[span_188](end_span)
                        
                         </div>
                     </div>
                     [span_189](start_span)<input type="hidden" name="python_script_url" id="hidden_python_script_url" value="${query.python_script_url || ''}">[span_189](end_span)
                     [span_190](start_span)<input type="hidden" name="python_update_interval" id="hidden_python_update_interval" value="${query.python_update_interval || ''}">[span_190](end_span)
                     [span_191](start_span)<input type="hidden" name="resolver_update_interval" id="hidden_resolver_update_interval" value="${query.resolver_update_interval || ''}">[span_191](end_span)
                     [span_192](start_span)<input type="submit" value="Gerar Configuração">[span_192](end_span)
                 </form>


              </div>
           


                  [span_193](start_span)<div style="margin-top: 30px; text-align: center; font-size: 14px; color: #ccc;">[span_193](end_span)
                      [span_194](start_span)<p>Addon criado com paixão por McCoy88f - <a href="https://github.com/mccoy88f/OMG-Premium-TV" target="_blank">GitHub Repository</a></p>[span_194](end_span)
                      
                      [span_195](start_span)<h3 style="margin-top: 20px;">Apoia este projeto!</h3>[span_195](end_span)
                      
                      [span_196](start_span)<div style="margin-top: 15px;">[span_196](end_span)
                          [span_197](start_span)<a href="https://www.buymeacoffee.com/mccoy88f" target="_blank">[span_197](end_span)
                              [span_198](start_span)<img src="https://img.buymeacoffee.com/button-api/?text=Oferece-me uma cerveja&emoji=🍺&slug=mccoy88f&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" style="max-width: 300px; margin: 0 auto;"/>[span_198](end_span)
                          </a>
                      </div>
                      
                      [span_199](start_span)<p style="margin-top: 15px;">[span_199](end_span)
               
                      [span_200](start_span)<a href="https://paypal.me/mccoy88f?country.x=IT&locale.x=it_IT" target="_blank">Podes também oferecer-me uma cerveja via PayPal 🍻</a>[span_200](end_span)
                  </p>
                  
                  [span_201](start_span)<div style="margin-top: 30px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px;">[span_201](end_span)
                      [span_202](start_span)<strong>ATENÇÃO!</strong>[span_202](end_span)
                      [span_203](start_span)<ul style="text-align: center; margin-top: 10px;">[span_203](end_span)
                          [span_204](start_span)<p>Não sou responsável pelo uso indevido do addon.</p>[span_204](end_span)
                          [span_205](start_span)<p>Verifica e respeita a legislação vigente no teu país!</p>[span_205](end_span)
                      </ul>
      
                  </div>
              </div>
              
              [span_206](start_span)<div id="confirmModal">[span_206](end_span)
                  <div>
                      
                      [span_207](start_span)<h2>Confirmar Instalação</h2>[span_207](end_span)
                      [span_208](start_span)<p>Já geraste a configuração?</p>[span_208](end_span)
                      [span_209](start_span)<div style="margin-top: 20px;">[span_209](end_span)
                          [span_210](start_span)<button onclick="cancelInstallation()" style="background: #666;">Voltar</button>[span_210](end_span)
                 
                          [span_211](start_span)<button onclick="proceedInstallation()" style="background: #8A5AAB;">Prosseguir</button>[span_211](end_span)
                      </div>
                  </div>
              </div>
              
              [span_212](start_span)<div id="toast" class="toast">URL Copiado!</div>[span_212](end_span)
              
              <script>
                  ${getViewScripts(protocol, host)}
              </script>
          [span_213](start_span)</div>[span_213](end_span)
          <div id="loaderOverlay" class="loader-overlay">
              <div class="loader"></div>
              <div id="loaderMessage" class="loader-message">Operazione in corso...</div>
          </div>
      </body>
      </html>
  [span_214](start_span)`;[span_214](end_span)
[span_215](start_span)};[span_215](end_span)

module.exports = {
   [span_216](start_span)renderConfigPage[span_216](end_span)
};