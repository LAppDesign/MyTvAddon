<!DOCTYPE html>
<html>
<head>
   <meta charset="utf-8">
   <title>${manifest.name}</title>
   <style>
       body {
           margin: 0;
           padding: 0;
           height: 100vh;
           overflow-y: auto;
           font-family: Arial, sans-serif;
           color: #fff;
           /* Gradiente de cinzas estilo WordPress */
           background: linear-gradient(to bottom, #ececec, #dcdcdc); /* Cores cinzas mais claras para o topo */
           color: #333; /* Cor do texto mais escura para contrastar com o fundo claro */
       }
       /* Remover o vídeo de fundo */
       #background-video {
           display: none;
       }
       .content {
           position: relative;
           z-index: 1;
           max-width: 800px;
           margin: 0 auto;
           text-align: center;
           padding: 50px 20px;
           background: rgba(0,0,0,0.6); /* Manter o fundo escuro para o conteúdo para legibilidade */
           min-height: 100vh;
           display: flex;
           flex-direction: column;
           justify-content: flex-start;
           overflow-y: visible;
           color: #fff; /* Garantir que o texto dentro do conteúdo seja branco */
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
       .bottom-buttons {
           margin-top: 20px;
           display: flex;
           justify-content: center;
           gap: 20px;
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
       <img class="logo" src="https://i.postimg.cc/1t3ktkBL/tv.png" alt="logo">
       <h1>${manifest.name} <span style="font-size: 16px; color: #aaa;">v${manifest.version}</span></h1>

       <div class="manifest-url">
           <strong>URL do Manifest:</strong><br>
           ${protocol}://${host}/manifest.json?${new URLSearchParams(query)}
       </div>

       <div class="buttons">
           <button onclick="copyManifestUrl()">COPIAR URL DO MANIFEST</button>
           <button onclick="installAddon()">INSTALAR NO STREMIO</button>
       </div>
       
       <div class="config-form">
           <h2>Gerar Configuração</h2>
           <form id="configForm" onsubmit="updateConfig(event)">
               <label>URL M3U:</label>
               <input type="url" name="m3u" 
                      value="${m3uIsDisabled ? m3uDefaultUrl : (query.m3u || '')}" 
                      ${m3uIsDisabled ? 'readonly' : ''} 
                      required>
               
               <label>URL EPG:</label>
               <input type="url" name="epg" value="${query.epg || ''}">
               
               <label>
                   <input type="checkbox" name="epg_enabled" ${query.epg_enabled === 'true' ? 'checked' : ''}>
                   Ativar EPG
               </label>

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
                           <input type="checkbox" name="force_proxy" ${query.force_proxy === 'true' ? 'checked' : ''}>
                           Forçar Proxy
                       </label>

                       <label>Sufixo do ID:</label>
                       <input type="text" name="id_suffix" value="${query.id_suffix || ''}" placeholder="Exemplo: pt">

                       <label>Caminho do ficheiro remapper:</label>
                       <input type="text" name="remapper_path" value="${query.remapper_path || ''}" placeholder="Exemplo: https://raw.githubusercontent.com/...">

                       <label>Intervalo de Atualização da Playlist:</label>
                       <input type="text" name="update_interval" value="${query.update_interval || '12:00'}" placeholder="HH:MM (predefinido 12:00)">
                       <small style="color: #999;">Formato HH:MM (ex: 1:00 ou 01:00), predefinido 12:00</small>
                       
                       <label>URL do Script Python do Resolver:</label>
                       <input type="url" name="resolver_script" value="${query.resolver_script || ''}">
                       
                       <label>
                           <input type="checkbox" name="resolver_enabled" ${query.resolver_enabled === 'true' ? 'checked' : ''}>
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
               <button onclick="backupConfig()">FAZER BACKUP DA CONFIGURAÇÃO</button>
               <input type="file" id="restoreFile" accept=".json" style="display:none;" onchange="restoreConfig(event)">
               <button onclick="document.getElementById('restoreFile').click()">RESTAURAR CONFIGURAÇÃO</button>
           </div>
           <div style="margin-top: 15px; background: rgba(255,255,255,0.1); padding: 1px; border-radius: 4px;">
               <ul style="text-align: center; margin-top: 10px;">
                   <p>Lembre-se de gerar a configuração antes de fazer o backup</p>
               </ul>
           </div>
       </div>
       
       <div class="config-form" style="margin-top: 30px;">
           <div class="advanced-settings">
               <div class="advanced-settings-header" onclick="togglePythonSection()">
                   <strong>Gerar Playlist com Script Python</strong>
                   <span id="python-section-toggle">▼</span>
               </div>
               <div class="advanced-settings-content" id="python-section-content">
                   <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">
                       <p><strong>Esta função permite:</strong></p>
                       <ul style="text-align: left;">
                           <li>Descarregar um script Python de um URL</li>
                           <li>Executá-lo dentro do contentor Docker</li>
                           <li>Utilizar o ficheiro M3U gerado como origem</li>
                       </ul>
                       <p><strong>Nota:</strong> O URL deve apontar para um script Python que gera um ficheiro M3U.</p>
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
                               <input type="text" id="updateInterval" placeholder="HH:MM (ex: 12:00)" style="flex: 2;">
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
                           <h3>URL da Playlist Gerada</h3>
                           <div id="m3uUrlContent"></div>
                           <button onclick="useGeneratedM3u()" style="width: 100%; margin-top: 10px;">USAR ESTA PLAYLIST</button>
                       </div>
                   </div>
               </div>
           </div>
       </div>

       <div class="config-form" style="margin-top: 30px;">
           <div class="advanced-settings">
               <div class="advanced-settings-header" onclick="toggleResolverSection()">
                   <strong>Resolver Python para Streams</strong>
                   <span id="resolver-section-toggle">▼</span>
               </div>
               <div class="advanced-settings-content" id="resolver-section-content">
                   <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px; margin-bottom: 20px; margin-top: 15px;">
                       <p><strong>O que é o Resolver Python?</strong></p>
                       <p>O Resolver Python permite-lhe:</p>
                       <ul style="text-align: left;">
                           <li>Resolver dinamicamente os URLs de streaming</li>
                           <li>Adicionar tokens de autenticação aos streams</li>
                           <li>Gerir APIs protegidas para os fornecedores de conteúdo</li>
                           <li>Personalizar os pedidos com cabeçalhos específicos</li>
                       </ul>
                       <p><strong>Nota:</strong> É necessário um script Python que implemente a função <code>resolve_link</code>.</p>
                   </div>
                   
                   <div id="resolverForm">
                       <div style="display: flex; gap: 10px; margin-top: 15px;">
                           <button onclick="downloadResolverScript()" style="flex: 1;">DESCARREGAR SCRIPT</button>
                           <button onclick="createResolverTemplate()" style="flex: 1;">CRIAR TEMPLATE</button>
                           <button onclick="checkResolverHealth()" style="flex: 1;">VERIFICAR SCRIPT</button>
                       </div>
                       
                       <div style="margin-top: 15px;">
                           <h4>Gestão de Cache e Atualizações</h4>
                           <div style="display: flex; gap: 10px; align-items: center;">
                               <input type="text" id="resolverUpdateInterval" placeholder="HH:MM (ex: 12:00)" style="flex: 2;">
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
           <p>Addon criado com paixão por McCoy88f - <a href="https://github.com/mccoy88f/OMG-Premium-TV" target="_blank">Repositório GitHub</a></p>
           
           <h3 style="margin-top: 20px;">Apoie este projeto!</h3>
           
           <div style="margin-top: 15px;">
               <a href="https://www.buymeacoffee.com/mccoy88f" target="_blank">
                   <img src="https://img.buymeacoffee.com/button-api/?text=Ofereça-me uma cerveja&emoji=🍺&slug=mccoy88f&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff" alt="Ofereça-me um café" style="max-width: 300px; margin: 0 auto;"/>
               </a>
           </div>
           
           <p style="margin-top: 15px;">
               <a href="https://paypal.me/mccoy88f?country.x=IT&locale.x=it_IT" target="_blank">Também pode oferecer-me uma cerveja com o PayPal 🍻</a>
           </p>
           
           <div style="margin-top: 30px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 4px;">
               <strong>ATENÇÃO!</strong>
               <ul style="text-align: center; margin-top: 10px;">
                   <p>Não sou responsável pelo uso ilícito do addon.</p>
                   <p>Verifique e respeite a legislação em vigor no seu país!</p>
               </ul>
           </div>
       </div>
       
       <div id="confirmModal">
           <div>
               <h2>Confirmar Instalação</h2>
               <p>Já gerou a configuração?</p>
               <div style="margin-top: 20px;">
                   <button onclick="cancelInstallation()" style="background: #666;">Voltar</button>
                   <button onclick="proceedInstallation()" style="background: #8A5AAB;">Continuar</button>
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
       <div id="loaderMessage" class="loader-message">Operação em curso...</div>
   </div>
</body>
</html>

Alguns pontos a notar:
* Cor do corpo (body): Mudei o background para linear-gradient(to bottom, #ececec, #dcdcdc). #ececec é um cinza muito claro e #dcdcdc é um cinza um pouco mais escuro, o que deve dar o efeito "cinza WordPress". O color do body foi alterado para #333 (um cinza escuro) para garantir bom contraste com o fundo claro.
* Vídeo de fundo: A tag <video> foi removida e o CSS #background-video agora tem display: none; para garantir que não apareça.
* Conteúdo (.content): Mantive o background: rgba(0,0,0,0.6); para o .content e adicionei color: #fff; para que o texto dentro dessa área continue branco e legível sobre o fundo escuro transparente.
* m3uDefaultUrl: O valor https://github.com/mccoy88f/OMG-Premium-TV/blob/main/tv.png?raw=true permanece, pois este é um URL de placeholder dentro do código para o M3U padrão, não o logo. O logo que me deste foi aplicado na tag <img>.
Se tiveres mais alguma coisa, é só dizer!