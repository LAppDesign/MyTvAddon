const fs = require('fs');
const path = require('path');
const { getViewScripts } = require('./views-scripts');

const renderConfigPage = (protocol, host, query, manifest) => {
  const configPath = path.join(__dirname, 'addon-config.json');
  const showConfigFields = process.env.SHOW_CONFIG_FIELDS === 'true'; 

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${manifest.name}</title>
      <style>
        /* ... mantém os estilos existentes sem alterações ... */
        body {
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow-y: auto;
          font-family: Arial, sans-serif;
          color: #fff;
          background: purple;
        }
        .content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 50px 20px;
        }
        /* ... restantes estilos ... */
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
              <input type="url" name="m3u" value="${query.m3u || ''}" required>
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
                  <input type="checkbox" name="force_proxy" ${query.force_proxy === 'true' ? 'checked' : ''}>
                  Forçar Proxy
                </label>
                <label>Sufixo do ID:</label>
                <input type="text" name="id_suffix" value="${query.id_suffix || ''}">
                <label>URL do ficheiro de remapeamento:</label>
                <input type="text" name="remapper_path" value="${query.remapper_path || ''}">
                <label>Intervalo de Atualização da Lista:</label>
                <input type="text" name="update_interval" value="${query.update_interval || '12:00'}">
              </div>
            </div>
            <input type="hidden" name="python_script_url" value="${query.python_script_url || ''}">
            <input type="hidden" name="python_update_interval" value="${query.python_update_interval || ''}">
            <input type="hidden" name="resolver_update_interval" value="${query.resolver_update_interval || ''}">
            <input type="submit" value="Gerar Configuração">
          </form>
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
              <button onclick="cancelInstallation()">Voltar</button>
              <button onclick="proceedInstallation()">Prosseguir</button>
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
  `;
};

module.exports = {
  renderConfigPage
};
