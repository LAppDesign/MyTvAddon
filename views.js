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
  -[span_7](start_span)-bg-color: #202020;[span_7](end_span)
  -[span_8](start_span)-panel-bg-color: #333333;[span_8](end_span)
  -[span_9](start_span)-shadow-dark: #1a1a1a;[span_9](end_span)
  -[span_10](start_span)-shadow-light: #444444;[span_10](end_span)
}

body {
  [span_11](start_span)background-color: var(--bg-color);[span_11](end_span)
}

.content, .config-form, .advanced-settings, #confirmModal > div, #pythonStatus, #generatedM3uUrl, #resolverStatus {
  [span_12](start_span)background-color: var(--panel-bg-color) !important;[span_12](end_span)
[span_13](start_span)box-shadow: 10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light);[span_13](end_span)
  [span_14](start_span)border-radius: 12px !important;[span_14](end_span)
}


            body {
                [span_15](start_span)margin: 0;[span_15](end_span)
[span_16](start_span)padding: 0;[span_16](end_span)
                [span_17](start_span)height: 100vh;[span_17](end_span)
                [span_18](start_span)overflow-y: auto;[span_18](end_span)
                [span_19](start_span)font-family: Arial, sans-serif;[span_19](end_span)
                [span_20](start_span)color: #fff;[span_20](end_span)
                [span_21](start_span)background: purple;[span_21](end_span)
}
            #background-video {
                [span_22](start_span)position: fixed;[span_22](end_span)
[span_23](start_span)right: 0;[span_23](end_span)
                [span_24](start_span)bottom: 0;[span_24](end_span)
                [span_25](start_span)min-width: 100%;[span_25](end_span)
                [span_26](start_span)min-height: 100%;[span_26](end_span)
                [span_27](start_span)width: auto;[span_27](end_span)
                [span_28](start_span)height: auto;[span_28](end_span)
                [span_29](start_span)z-index: -1000;[span_29](end_span)
                [span_30](start_span)background: black;[span_30](end_span)
                [span_31](start_span)object-fit: cover;[span_31](end_span)
[span_32](start_span)filter: blur(5px) brightness(0.5);[span_32](end_span)
            }
            .content {
                [span_33](start_span)position: relative;[span_33](end_span)
[span_34](start_span)z-index: 1;[span_34](end_span)
                [span_35](start_span)max-width: 800px;[span_35](end_span)
                [span_36](start_span)margin: 0 auto;[span_36](end_span)
                [span_37](start_span)text-align: center;[span_37](end_span)
                [span_38](start_span)padding: 50px 20px;[span_38](end_span)
                [span_39](start_span)background: rgba(0,0,0,0.6);[span_39](end_span)
                [span_40](start_span)min-height: 100vh;[span_40](end_span)
                [span_41](start_span)display: flex;[span_41](end_span)
                [span_42](start_span)flex-direction: column;[span_42](end_span)
[span_43](start_span)justify-content: flex-start;[span_43](end_span)
                [span_44](start_span)overflow-y: visible;[span_44](end_span)
            }

            .logo {
                [span_45](start_span)width: 150px;[span_45](end_span)
[span_46](start_span)margin: 0 auto 20px;[span_46](end_span)
                [span_47](start_span)display: block;[span_47](end_span)
            }
            .manifest-url {
                [span_48](start_span)background: rgba(255,255,255,0.1);[span_48](end_span)
[span_49](start_span)padding: 10px;[span_49](end_span)
                [span_50](start_span)border-radius: 4px;[span_50](end_span)
                [span_51](start_span)word-break: break-all;[span_51](end_span)
                [span_52](start_span)margin: 20px 0;[span_52](end_span)
                [span_53](start_span)font-size: 12px;[span_53](end_span)
}

            .loader-overlay {
                [span_54](start_span)position: fixed;[span_54](end_span)
[span_55](start_span)top: 0;[span_55](end_span)
                [span_56](start_span)left: 0;[span_56](end_span)
                [span_57](start_span)width: 100%;[span_57](end_span)
                [span_58](start_span)height: 100%;[span_58](end_span)
                [span_59](start_span)background: rgba(0,0,0,0.8);[span_59](end_span)
                [span_60](start_span)display: none;[span_60](end_span)
                [span_61](start_span)justify-content: center;[span_61](end_span)
                [span_62](start_span)align-items: center;[span_62](end_span)
                [span_63](start_span)z-index: 2000;[span_63](end_span)
                [span_64](start_span)flex-direction: column;[span_64](end_span)
}

            .loader {
                [span_65](start_span)border: 6px solid #3d2a56;[span_65](end_span)
[span_66](start_span)border-radius: 50%;[span_66](end_span)
                [span_67](start_span)border-top: 6px solid #8A5AAB;[span_67](end_span)
                [span_68](start_span)width: 50px;[span_68](end_span)
                [span_69](start_span)height: 50px;[span_69](end_span)
                [span_70](start_span)animation: spin 1s linear infinite;[span_70](end_span)
                [span_71](start_span)margin-bottom: 20px;[span_71](end_span)
}

            .loader-message {
                [span_72](start_span)color: white;[span_72](end_span)
[span_73](start_span)font-size: 18px;[span_73](end_span)
                [span_74](start_span)text-align: center;[span_74](end_span)
                [span_75](start_span)max-width: 80%;[span_75](end_span)
            }

            @keyframes spin {
                [span_76](start_span)0% { transform: rotate(0deg);[span_76](end_span)
}
                [span_77](start_span)100% { transform: rotate(360deg);[span_77](end_span)
}
            }

            .config-form {
                [span_78](start_span)text-align: left;[span_78](end_span)
[span_79](start_span)background: rgba(255,255,255,0.1);[span_79](end_span)
                [span_80](start_span)padding: 20px;[span_80](end_span)
                [span_81](start_span)border-radius: 4px;[span_81](end_span)
                [span_82](start_span)margin-top: 30px;[span_82](end_span)
            }
            .config-form label {
                [span_83](start_span)display: block;[span_83](end_span)
[span_84](start_span)margin: 10px 0 5px;[span_84](end_span)
                [span_85](start_span)color: #fff;[span_85](end_span)
            }
            .config-form input[type="text"],
            .config-form input[type="url"],
            .config-form input[type="password"],
            .config-form input[type="file"] {
                [span_86](start_span)width: 100%;[span_86](end_span)
[span_87](start_span)padding: 8px;[span_87](end_span)
                [span_88](start_span)margin-bottom: 10px;[span_88](end_span)
                [span_89](start_span)border-radius: 4px;[span_89](end_span)
                [span_90](start_span)border: 1px solid #666;[span_90](end_span)
                [span_91](start_span)background: #333;[span_91](end_span)
                [span_92](start_span)color: white;[span_92](end_span)
}
            .buttons {
                [span_93](start_span)margin: 30px 0;[span_93](end_span)
[span_94](start_span)display: flex;[span_94](end_span)
                [span_95](start_span)justify-content: center;[span_95](end_span)
                [span_96](start_span)gap: 20px;[span_96](end_span)
            }
            button {
                [span_97](start_span)background: #8A5AAB;[span_97](end_span)
[span_98](start_span)color: white;[span_98](end_span)
                [span_99](start_span)border: none;[span_99](end_span)
                [span_100](start_span)padding: 12px 24px;[span_100](end_span)
                [span_101](start_span)border-radius: 4px;[span_101](end_span)
                [span_102](start_span)cursor: pointer;[span_102](end_span)
                [span_103](start_span)font-size: 16px;[span_103](end_span)
}
            /* NOVO: Classe para esconder seções */
            .hidden-section {
                [span_104](start_span)display: none;[span_104](end_span)
}
            .toast {
                [span_105](start_span)position: fixed;[span_105](end_span)
[span_106](start_span)top: 20px;[span_106](end_span)
                [span_107](start_span)right: 20px;[span_107](end_span)
                [span_108](start_span)background: #4CAF50;[span_108](end_span)
                [span_109](start_span)color: white;[span_109](end_span)
                [span_110](start_span)padding: 15px 30px;[span_110](end_span)
                [span_111](start_span)border-radius: 4px;[span_111](end_span)
                [span_112](start_span)display: none;[span_112](end_span)
}
            input[type="submit"] {
                [span_113](start_span)background: #8A5AAB;[span_113](end_span)
[span_114](start_span)color: white;[span_114](end_span)
                [span_115](start_span)border: none;[span_115](end_span)
                [span_116](start_span)padding: 12px 24px;[span_116](end_span)
                [span_117](start_span)border-radius: 4px;[span_117](end_span)
                [span_118](start_span)cursor: pointer;[span_118](end_span)
                [span_119](start_span)font-size: 16px;[span_119](end_span)
                [span_120](start_span)width: 100%;[span_120](end_span)
                [span_121](start_span)margin-top: 20px;[span_121](end_span)
}
            .advanced-settings {
                [span_122](start_span)background: rgba(255,255,255,0.05);[span_122](end_span)
[span_123](start_span)border: 1px solid #666;[span_123](end_span)
                [span_124](start_span)border-radius: 4px;[span_124](end_span)
                [span_125](start_span)padding: 10px;[span_125](end_span)
                [span_126](start_span)margin-top: 10px;[span_126](end_span)
}
            .advanced-settings-header {
                [span_127](start_span)cursor: pointer;[span_127](end_span)
[span_128](start_span)display: flex;[span_128](end_span)
                [span_129](start_span)justify-content: space-between;[span_129](end_span)
                [span_130](start_span)align-items: center;[span_130](end_span)
                [span_131](start_span)color: #fff;[span_131](end_span)
            }
            .advanced-settings-content {
                [span_132](start_span)display: none;[span_132](end_span)
[span_133](start_span)padding-top: 10px;[span_133](end_span)
            }
            .advanced-settings-content.show {
                [span_134](start_span)display: block;[span_134](end_span)
}
            #confirmModal {
                [span_135](start_span)display: none;[span_135](end_span)
[span_136](start_span)position: fixed;[span_136](end_span)
                [span_137](start_span)top: 0;[span_137](end_span)
                [span_138](start_span)left: 0;[span_138](end_span)
                [span_139](start_span)width: 100%;[span_139](end_span)
                [span_140](start_span)height: 100%;[span_140](end_span)
                [span_141](start_span)background: rgba(0,0,0,0.8);[span_141](end_span)
                [span_142](start_span)z-index: 1000;[span_142](end_span)
                [span_143](start_span)justify-content: center;[span_143](end_span)
                [span_144](start_span)align-items: center;[span_144](end_span)
}
            #confirmModal > div {
                [span_145](start_span)background: #333;[span_145](end_span)
[span_146](start_span)padding: 30px;[span_146](end_span)
                [span_147](start_span)border-radius: 10px;[span_147](end_span)
                [span_148](start_span)text-align: center;[span_148](end_span)
                [span_149](start_span)color: white;[span_149](end_span)
            }
            #confirmModal button {
                [span_150](start_span)margin: 0 10px;[span_150](end_span)
}
            a {
                [span_151](start_span)color: #8A5AAB;[span_151](end_span)
[span_152](start_span)text-decoration: none;[span_152](end_span)
            }
            a:hover {
                [span_153](start_span)text-decoration: underline;[span_153](end_span)
}
        </style>
    </head>
    <body>


        <div class="content">
            <img class="logo" src="${manifest.logo}" alt="logo">
            <h1>${manifest.name} <span style="font-size: 16px; color: #aaa;">v${manifest.version}</span></h1>

           ${showConfigFields ? `
            <div class="manifest-url">
                <strong>URL Manifest:</strong><br>
                ${protocol}://${host}/manifest.json?${new URLSearchParams(query)}
            </div>

            <div class="buttons">
                <button onclick="copyManifestUrl()">COPIAR URL DO MANIFESTO</button>
                <button onclick="installAddon()">INSTALAR NO STREMIO</button>
            </div>
            ` : ``}

            <div class="config-form">
                <h2>Gerar Configuração</h2>
                <form id="configForm" onsubmit="updateConfig(event)">

                ${showConfigFields ?
`
                    <label>URL:</label>
                    <input type="url" name="m3u"
                           value="${query.m3u || ''}"

                            required>

                    <label>URL do EPG:</label>
                    <input type="url" name="epg" value="${query.epg || ''}">

                    <label>
                        <input type="checkbox" name="epg_enabled" ${query.epg_enabled === 'true' ?
'checked' : ''}>
                         Ativar EPG
                     </label>
                 ` : `
                     [span_154](start_span)<p>A configuração da lista M3U e EPG está desativada no momento.</p>[span_154](end_span)
                     [span_155](start_span)<p>Entre em contato com o administrador para obter o URL de instalação.</p>[span_155](end_span)
                 `}
                 <div class="advanced-settings">
                         <div
[span_156](start_span)class="advanced-settings-header" onclick="toggleAdvancedSettings()">[span_156](end_span)
                             <strong>Definições Avançadas</strong>
                             <span id="advanced-settings-toggle">▼</span>
                         </div>

                         <div class="advanced-settings-content" id="advanced-settings-content">\n                               <label>URL do Proxy:</label>\n                            
  <input type="url" name="proxy" value="${query.proxy || ''}">\n                               \n                               <label>Palavra-passe do Proxy:</label>\n                            
  <input type="password" name="proxy_pwd" value="${query.proxy_pwd || ''}">\n                               \n                               <label>\n                              
     <input type="checkbox" name="force_proxy" \n                                   ${query.force_proxy === 'true' ? 'checked' : ''}>\n                                   Forçar Proxy\n               
                </label>\n\n                               <label>Sufixo do ID:</label>\n                               <input type="text" name="id_suffix" value="${query.id_suffix ||
''}" placeholder="Esempio: it">\n\n                               <label>URL do ficheiro de remapeamento:</label>\n                               <input type="text" name="remapper_path" value="${query.remapper_path ||
''}" placeholder="Esempio: https://raw.githubusercontent.com/...">\n\n                               <label>Intervalo de Atualização da Lista:</label>\n                               <input type="text" name="update_interval" value="${query.update_interval ||
'12:00'}" placeholder="HH:MM (predefinito 12:00)">\n                               <small style="color: #999;">Formato HH:MM (es. 1:00 o 01:00), predefinito 12:00</small>\n                               \n                          
     <label>URL do Script Resolver em Python:</label>\n                               <input type="url" name="resolver_script" value="${query.resolver_script ||
''}">\n                               \n                               <label>\n                                   <input type="checkbox" name="resolver_enabled" 
\n                                   ${query.resolver_enabled === 'true' ? 'checked' : ''}>\n                                   Ativar Resolver Python\n                      
         </label>\n                          \n                           </div>\n                       </div>\n               
        <input type="hidden" name="python_script_url" id="hidden_python_script_url" value="${query.python_script_url ||
''}">\n                       <input type="hidden" name="python_update_interval" id="hidden_python_update_interval" value="${query.python_update_interval ||
''}">\n                       <input type="hidden" name="resolver_update_interval" id="hidden_resolver_update_interval" value="${query.resolver_update_interval ||
''}">\n                       <input type="submit" value="Gerar Configuração">\n                   </form>\n\n\n               </div>\n            \n\n               <div class="config-form hidden-section"> \n          
         <div class="advanced-settings">\n                       <div class="advanced-settings-header" onclick="togglePythonSection()">\n                           <strong>Gerar Lista com Script Python</strong>\n                           <span id="python-section-toggle">▼</span>\n      
                 </div>\n                       <div class="advanced-settings-content" id="python-section-content">\n                   
                          [span_157](start_span)<div style="background: rgba(255,255,255,0.1);[span_157](end_span)
padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">\n                               <p><strong>Esta funcionalidade permite:</strong></p>\n                               <ul style="text-align: left;">\n                           
        <li>Transferir um script Python de um URL</li>\n                                   <li>Executá-lo dentro do contentor Docker</li>\n                                   <li>Usar o ficheiro M3U gerado como fonte</li>\n      
      \n                               </ul>\n                               <p><strong>Nota:</strong> L'URL deve puntare a uno script Python che genera un file M3U.</p>\n                    
       </div>\n           \n                           <div id="pythonForm">\n                               <label>URL do Script Python:</label>\n                    
           [span_158](start_span)<input type="url" id="pythonScriptUrl" placeholder="https://example.com/script.py">\n   \n                               <div style="display: flex;[span_158](end_span)
gap: 10px; margin-top: 15px;">\n                                   <button onclick="downloadPythonScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>\n                                   <button onclick="executePythonScript()" style="flex: 1;">EXECUTAR SCRIPT</button>\n                   
\n                                   <button onclick="checkPythonStatus()" style="flex: 1;">VERIFICAR ESTADO</button>\n                               </div>\n                \n              
                 [span_159](start_span)<div style="margin-top: 15px;">\n                                   <h4>Atualização Automática</h4>\n                                   <div style="display: flex;[span_159](end_span)
gap: 10px; align-items: center;">\n                                       <input type="text" id="updateInterval" placeholder="HH:MM (es. 12:00)" style="flex: 2;">\n                                       <button onclick="scheduleUpdates()" style="flex: 1;">AGENDAR</button>\n         
                               <button onclick="stopScheduledUpdates()" style="flex: 1;">PARAR</button>\n                                   </div>\n                                
[span_160](start_span)\n                                   <small style="color: #999;[span_160](end_span)
display: block; margin-top: 5px;">\n                                       Formato: HH:MM (ex: 12:00 para 12 horas, 1:00 para 1 hora, 0:30 para 30 minutos)\n                                   </small>\n   \n      
                         [span_161](start_span)</div>\n                \n                               <div id="pythonStatus" style="margin-top: 15px;[span_161](end_span)
background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: none;">\n                                   <h3>Estado do Script Python</h3>\n                                   <div id="pythonStatusContent"></div>\n                   
[span_162](start_span)\n                               </div>\n                \n                               <div id="generatedM3uUrl" style="margin-top: 15px;[span_162](end_span)
background: rgba(0,255,0,0.1); padding: 10px; border-radius: 4px; display: none;">\n                                   <h3>URL da Lista Gerada</h3>\n                                   <div id="m3uUrlContent"></div>\n                   
[span_163](start_span)\n                                   <button onclick="useGeneratedM3u()" style="width: 100%;[span_163](end_span)
margin-top: 10px;">USAR ESTA LISTA</button>\n                               </div>\n                           </div>\n                       </div>\n                
\n                   </div>\n               </div>\n\n               <div class="config-form hidden-section"> \n                   <div class="advanced-settings">\n                      \n      
                 <div class="advanced-settings-header" onclick="toggleResolverSection()">\n                           <strong>Resolver Python para Stream</strong>\n                           <span id="resolver-section-toggle">▼</span>\n                       
[span_164](start_span)</div>\n                \n                       <div class="advanced-settings-content" id="resolver-section-content">\n                           <div style="background: rgba(255,255,255,0.1);[span_164](end_span)
padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">\n                               <p><strong>O que é o Resolver Python?</strong></p>\n                               <p>O Resolver Python permite-te:</p>\n                       
\n                               <ul style="text-align: left;">\n                                   <li>Risolvere dinamicamente gli URL di streaming</li>\n                           
        <li>Aggiungere token di autenticação agli stream</li>\n          \n                                   <li>Gestir API protette per i provider de conteúdo</li>\n                                   
<li>Personalizar as requisições com header específicos</li>\n                            \n                               </ul>\n                               <p><strong>Nota: É necessário um script 
Python que implemente a função <code>resolve_link</code>.</p>\n                           </div>\n                       \n                           <div id="resolverForm">\n                 
      [span_165](start_span)\n                               <div style="display: flex;[span_165](end_span)
gap: 10px; margin-top: 15px;">\n                                   <button onclick="downloadResolverScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>\n                                   <button onclick="createResolverTemplate()" style="flex: 1;">CRIAR MODELO</button>\n                   
\n                                   <button onclick="checkResolverHealth()" style="flex: 1;">VERIFICAR SCRIPT</button>\n                               </div>\n                       \n       
                        <div style="margin-top: 15px;">\n                                   <h4>Gestão de Cache e Atualizações</h4>\n                                   
<div style="display: flex; gap: 10px; align-items: center;">\n                                       <input type="text" id="resolverUpdateInterval" placeholder="HH:MM (es. 12:00)" style="flex: 2;">\n                                       <button onclick="scheduleResolverUpdates()" style="flex: 1;">AGENDAR</button>\n      
                                 <button onclick="stopResolverUpdates()" style="flex: 1;">PARAR</button>\n                                       <button onclick="clearResolverCache()" style="flex: 1;">LIMPAR CACHE</button>\n                     
   [span_166](start_span)\n                                   </div>\n                                   <small style="color: #999;[span_166](end_span)
display: block; margin-top: 5px;">\n                                       Formato: HH:MM (ex: 12:00 para 12 horas, 1:00 para 1 hora, 0:30 para 30 minutos)\n                                   </small>\n         
[span_167](start_span)\n                               </div>\n                       \n                               <div id="resolverStatus" style="margin-top: 15px;[span_167](end_span)
background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; display: none;">\n                                   <h3>Estado do Resolver Python</h3>\n                                   <div id="resolverStatusContent"></div>\n                   
\n                               </div>\n                           </div>\n                       </div>\n                   
[span_168](start_span)</div>\n               </div>\n\n    \n               <div style="margin-top: 30px;[span_168](end_span)
text-align: center; font-size: 14px; color: #ccc;">\n                   <p>Addon criado com paixão por McCoy88f - <a href="https://github.com/mccoy88f/OMG-Premium-TV" target="_blank">GitHub Repository</a></p>\n                   \n                   <h3 style="margin-top: 20px;">Apoia este projeto!</h3>\n                   \n     
              [span_169](start_span)<div style="margin-top: 15px;">\n                       <a href="https://www.buymeacoffee.com/mccoy88f" target="_blank">\n                           <img src="https://img.buymeacoffee.com/button-api/?text=Oferece-me uma cerveja&emoji=🍺&slug=mccoy88f&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me a Coffee" style="max-width: 300px;[span_169](end_span)
margin: 0 auto;"/>\n                       </a>\n                   </div>\n                   \n                   <p style="margin-top: 15px;">\n                
[span_170](start_span)\n                       <a href="https://paypal.me/mccoy88f?country.x=IT&locale.x=it_IT" target="_blank">Podes também oferecer-me uma cerveja via PayPal 🍻</a>\n                   </p>\n                   \n                   <div style="margin-top: 30px;[span_170](end_span)
[span_171](start_span)background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px;">\n                       <strong>ATENÇÃO!</strong>\n                       <ul style="text-align: center;[span_171](end_span)
margin-top: 10px;">\n                           <p>Não sou responsável pelo uso indevido do addon.</p>\n                           <p>Verifica e respeita a legislação vigente no teu país!</p>\n                       </ul>\n       
\n                   </div>\n               </div>\n               \n               <div id="confirmModal">\n                   <div>\n                
\n                       <h2>Confirmar Instalação</h2>\n                       <p>Já geraste a configuração?</p>\n                       <div style="margin-top: 20px;">\n                  
         <button onclick="cancelInstallation()" style="background: #666;">Voltar</button>\n                  \n                           <button onclick="proceedInstallation()" style="background: #8A5AAB;">Prosseguir</button>\n                       </div>\n                 
  </div>\n               </div>\n               \n               <div id="toast" class="toast">URL Copiado!</div>\n               \n               <script>\n                   ${getViewScripts(protocol, 
host)}\n               </script>\n           </div>\n           <div id="loaderOverlay" class="loader-overlay">\n               <div class="loader"></div>\n               <div id="loaderMessage" class="loader-message">Operazione in corso...</div>\n           </div>\n       </body>\n       </html>\n 
  `;
};

module.exports = {
  renderConfigPage
};