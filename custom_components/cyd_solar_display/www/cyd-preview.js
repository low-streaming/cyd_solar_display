import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class CYDPreview extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      panel: { type: Object },
      page: { type: Number },
      activeTab: { type: String },
      editConfig: { type: Object }
    };
  }

  constructor() {
    super();
    this.page = 1;
    this.activeTab = 'overview';
    this.editConfig = {};
  }

  firstUpdated() {
    this.loadConfig();
  }

  async loadConfig() {
    if (!this.panel || !this.panel.config || !this.panel.config.entry_id) return;
    const entryId = this.panel.config.entry_id;
    try {
      const res = await fetch(`/api/cyd_solar_display/config/${entryId}`, {
        headers: { 'Authorization': `Bearer ${this.hass?.auth?.token?.access_token || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.editConfig = data.options || {};
        this.requestUpdate();
      }
    } catch (e) { console.error("Failed to load config", e); }
  }

  async saveConfig() {
    if (!this.panel || !this.panel.config || !this.panel.config.entry_id) return;
    const entryId = this.panel.config.entry_id;
    try {
      const res = await fetch(`/api/cyd_solar_display/config/${entryId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hass?.auth?.token?.access_token || ''}`
        },
        body: JSON.stringify(this.editConfig)
      });
      if (res.ok) {
        alert("✅ Einstellungen wurden erfolgreich gespeichert!");
      } else {
        alert("❌ Fehler beim Speichern der Einstellungen.");
      }
    } catch (e) { console.error(e); alert("❌ Verbindungsfehler beim Speichern."); }
  }

  getEntitiesByDomain(domainPrefix) {
    if (!this.hass) return [];
    const prefixes = Array.isArray(domainPrefix) ? domainPrefix : [domainPrefix];
    return Object.keys(this.hass.states)
      .filter(entityId => prefixes.some(prefix => entityId.startsWith(prefix + '.')))
      .sort()
      .map(entityId => {
        const stateObj = this.hass.states[entityId];
        return {
          id: entityId,
          name: stateObj.attributes.friendly_name ? `${stateObj.attributes.friendly_name} (${entityId})` : entityId
        };
      });
  }

  handleFormInput(e) {
    const { name, value, type, checked } = e.target;
    this.editConfig = { ...this.editConfig, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) };
    this.requestUpdate();
  }

  getLiveValue(entityId, defaultVal) {
    if (!this.hass || !entityId || !this.hass.states[entityId]) return defaultVal;
    const state = this.hass.states[entityId].state;
    if (state === 'unavailable' || state === 'unknown') return defaultVal;
    const parsed = parseFloat(state);
    return isNaN(parsed) ? defaultVal : parsed;
  }

  render() {
    return html`
      <div class="main-wrapper">
          <div class="header-main">
            <h1>☀️ CYD Solar Display ✨</h1>
            <p class="subtitle">Live Preview & ESP32 Konfiguration</p>
          </div>

          <div class="tabs">
            <div class="tab ${this.activeTab === 'overview' ? 'active' : ''}" @click="${() => this.activeTab = 'overview'}">Dashboard</div>
            <div class="tab ${this.activeTab === 'settings' ? 'active' : ''}" @click="${() => this.activeTab = 'settings'}">Einstellungen</div>
            <div class="tab ${this.activeTab === 'info' ? 'active' : ''}" @click="${() => this.activeTab = 'info'}">Hilfe & Info</div>
          </div>

          <div class="content">
            ${this.activeTab === 'overview' ? this.renderOverview() : ''}
            ${this.activeTab === 'settings' ? this.renderSettings() : ''}
            ${this.activeTab === 'info' ? this.renderInfo() : ''}
          </div>
      </div>
    `;
  }

  renderOverview() {
    const solar_w = this.getLiveValue(this.editConfig.solar_entity, 4500);
    const grid_w = this.getLiveValue(this.editConfig.grid_entity, -1200);
    const house_w = this.getLiveValue(this.editConfig.house_entity, 2800);
    const battery_w = this.getLiveValue(this.editConfig.battery_entity, 500);
    const battery_soc = this.getLiveValue(this.editConfig.battery_soc_entity, 85);

    const yield_today = this.getLiveValue(this.editConfig.yield_today_entity, 12.4);
    const grid_in = this.getLiveValue(this.editConfig.grid_import_entity, 2.1);
    const grid_out = this.getLiveValue(this.editConfig.grid_export_entity, 5.8);

    const isNegative = grid_w < 0;

    return html`
      <div class="card">
          <div class="cyd-info">
            <h3>CYD Display Live Preview</h3>
            <p>1:1 Simulation mit den Livedaten deines Home Assistants.</p>
          </div>
          
          <div class="cyd-container">
            <div class="cyd-frame">
              <div class="cyd-screen">
                <div class="header">
                  <span class="title">Solar Monitor</span>
                  <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                ${this.page === 1 ? html`
                  <div class="page page1">
                    <div class="flow-layout">
                      <div class="box solar">
                        <div class="icon">☀️</div>
                        <div class="value">${solar_w}<span>W</span></div>
                      </div>

                      <div class="middle-row">
                          <div class="box battery">
                              <div class="soc-ring" style="--perc: ${battery_soc}%">
                                  <div class="inner">${battery_soc}%</div>
                              </div>
                              <div class="value small">${battery_w}W</div>
                          </div>
                          <div class="flow-center">
                              <div class="arrow ${isNegative ? 'out' : 'in'}"></div>
                          </div>
                          <div class="box house">
                              <div class="icon">🏠</div>
                              <div class="value">${house_w}<span>W</span></div>
                          </div>
                      </div>

                      <div class="box grid ${isNegative ? 'export' : 'import'}">
                        <div class="icon">⚡</div>
                        <div class="value">${Math.abs(grid_w)}<span>W</span></div>
                        <div class="label">${isNegative ? 'Einspeisung' : 'Netzbezug'}</div>
                      </div>
                    </div>
                  </div>
                ` : html`
                  <div class="page page2">
                    <div class="stats-grid">
                      <div class="stat-item">
                          <div class="label">Ertrag Heute</div>
                          <div class="value">${yield_today} <span>kWh</span></div>
                      </div>
                      <div class="stat-item">
                          <div class="label">Netzbezug</div>
                          <div class="value">${grid_in} <span>kWh</span></div>
                      </div>
                      <div class="stat-item">
                          <div class="label">Einspeisung</div>
                          <div class="value">${grid_out} <span>kWh</span></div>
                      </div>
                      <div class="stat-item">
                          <div class="label">Autarkie</div>
                          <div class="value">94 <span>%</span></div>
                      </div>
                    </div>
                  </div>
                `}

                <div class="footer">
                  <div class="dots">
                    <div class="dot ${this.page === 1 ? 'active' : ''}"></div>
                    <div class="dot ${this.page === 2 ? 'active' : ''}"></div>
                  </div>
                </div>
              </div>
              <div class="cyd-controls">
                <button @click="${() => this.page = 1}">P1</button>
                <button @click="${() => this.page = 2}">P2</button>
              </div>
            </div>
          </div>
      </div>
    `;
  }

  renderSettings() {
    const sensorOptions = this.getEntitiesByDomain('sensor');

    return html`
      <div class="card edit-card">
        <h2>🛠️ Sensoren & Konfiguration</h2>
        <p style="color:#aaa; font-size:14px; margin-bottom: 25px;">Verknüpfe hier deine Home Assistant Sensoren, die auf dem ESP32 Display angezeigt werden sollen.</p>
        
        <div class="tech-box">
            <h3 style="color: #fdd835; margin-top: 0;">⚡ Kern-Sensoren (Live in Watt)</h3>
            <div class="form-row">
                <div class="form-group flex-1">
                  <label>Solar Leistung (W)</label>
                  <select name="solar_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.solar_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.solar_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Netz Leistung (W) [Einspeisung = negativ]</label>
                  <select name="grid_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.grid_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.grid_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group flex-1">
                  <label>Hausverbrauch (W)</label>
                  <select name="house_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.house_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.house_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Batterie Leistung (W)</label>
                  <select name="battery_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.battery_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.battery_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
            </div>

            <div class="form-group" style="width: 50%;">
                <label>Batterie Füllstand (%)</label>
                <select name="battery_soc_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.battery_soc_entity}">-- Sensor wählen --</option>
                ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.battery_soc_entity === opt.id}">${opt.name}</option>`)}
                </select>
            </div>
        </div>

        <div class="tech-box" style="margin-top: 20px; border-color: rgba(52, 152, 219, 0.4);">
            <h3 style="color: #3498db; margin-top: 0;">📊 Statistik-Sensoren (kWh) - Für Seite 2</h3>
            <div class="form-row">
                <div class="form-group flex-1">
                  <label>Ertrag Heute (kWh)</label>
                  <select name="yield_today_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.yield_today_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.yield_today_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Netzbezug Heute (kWh)</label>
                  <select name="grid_import_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.grid_import_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.grid_import_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
                 <div class="form-group flex-1">
                  <label>Einspeisung Heute (kWh)</label>
                  <select name="grid_export_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.grid_export_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.grid_export_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
            </div>
        </div>
        
        <div class="tech-box" style="margin-top: 20px; border-color: rgba(155, 89, 182, 0.4);">
            <h3 style="color: #9b59b6; margin-top: 0;">⚙️ Allgemeine Eigenschaften</h3>
            
            <div class="form-row">
                <div class="form-group flex-1">
                  <label>Update Intervall (Sekunden)</label>
                  <input type="number" name="update_interval" min="1" .value="${this.editConfig.update_interval || 5}" @input="${this.handleFormInput}">
                  <small>Wie oft sollen Daten zum ESP32 gesendet werden?</small>
                </div>
                 <div class="form-group flex-1" style="display: flex; flex-direction: column; justify-content: center;">
                  <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 16px;">
                      <input type="checkbox" name="auto_page_switch" .checked="${this.editConfig.auto_page_switch}" @change="${this.handleFormInput}" style="width: 20px; height: 20px; accent-color: #9b59b6;">
                      Automatischer Seitenwechsel
                  </label>
                  <small style="margin-top: 8px;">Wechselt auf dem Display zwischen den Seiten.</small>
                </div>
                <div class="form-group flex-1">
                  <label>Seitenwechsel Intervall (Sekunden)</label>
                  <input type="number" name="page_interval" min="5" .value="${this.editConfig.page_interval || 10}" @input="${this.handleFormInput}">
                  <small>Erst aktiv, sobald der Haken gesetzt ist.</small>
                </div>
            </div>
        </div>

        <div class="form-actions" style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: right;">
            <button class="btn-save" @click="${this.saveConfig}">💾 Konfiguration Speichern & Anwenden</button>
        </div>
      </div>
    `;
  }

  renderInfo() {
    return html`
      <div class="card">
        <h2>ℹ️ Informationen & Ersteinrichtung</h2>
        <p>Willkommen beim <strong>CYD Solar Display</strong> Panel.</p>
        
        <div class="tech-box">
          <h3 style="margin-top:0; color:#F7931A;">☀️ Was ist das CYD Solar Display?</h3>
          <p style="color:#bbb; line-height:1.6; margin-top: 5px;">Dieses Projekt verbindet deinen Home Assistant mit einem <strong>ESP32 Cheap Yellow Display (CYD) 2432S028</strong>, um deine Solar-, Batterie- und Netzwerte hochauflösend und in Echtzeit in deinem Wohnraum zu visualisieren.</p>
        </div>

        <div class="tech-box" style="margin-top: 15px;">
          <h3 style="margin-top:0; color:#4fc3f7;">🚀 Flashing & Einrichtung</h3>
          <ul style="color:#bbb; line-height:1.6; padding-left:20px;">
            <li><strong style="color:#ddd;">1. Hardware:</strong> Du benötigst das ESP32 CYD (Modell 2432S028).</li>
            <li><strong style="color:#ddd;">2. ESPHome Code:</strong> Verwende die ESPHome YAML des CYD_Solar_Displays und flashe deinen ESP32.</li>
            <li><strong style="color:#ddd;">3. Konfiguration:</strong> Sobald der ESP32 geflasht und per ESPHome in HA als Gerät "cyd_solar_display" (Standard) registriert ist, verknüpfe unter "Einstellungen" (in diesem Panel) deine Sensoren.</li>
            <li><strong style="color:#ddd;">4. Los gehts:</strong> Die Sensoren werden nun im gewählten Intervall an das Display gepusht! Viel Spaß.</li>
          </ul>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        color: #e1e1e1;
        font-family: 'Roboto', 'Inter', sans-serif;
        background: #111111;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .main-wrapper {
        max-width: 900px;
        margin: 0 auto;
      }

      .header-main {
        text-align: center;
        margin-bottom: 30px;
      }
      .header-main h1 {
        margin: 0;
        font-size: 2.5em;
        color: #fff;
        text-shadow: 0 0 20px rgba(253, 216, 53, 0.4);
      }
      .header-main .subtitle {
        color: #888;
        font-size: 1.1em;
        margin: 5px 0 0;
      }

      /* TABS */
      .tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
      }
      .tab {
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        background: #222;
        color: #aaa;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
      }
      .tab:hover {
        background: #333;
        color: #fff;
      }
      .tab.active {
        background: #fdd835;
        color: #000;
        box-shadow: 0 4px 15px rgba(253, 216, 53, 0.3);
      }

      /* CONTENT CARDS */
      .card {
        background: #1a1a1c;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        border: 1px solid #333;
      }
      
      .card h2 {
          margin-top: 0;
          color: #fff;
      }

      /* CYD PREVIEW LAYOUT */
      .cyd-container {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
      .cyd-frame {
        width: 340px;
        height: 260px;
        background: #2b2b2b;
        border-radius: 12px;
        padding: 10px;
        position: relative;
        box-shadow: inset 0 0 10px rgba(0,0,0,1), 0 10px 30px rgba(0,0,0,0.5);
        border: 2px solid #444;
      }
      .cyd-screen {
        width: 320px;
        height: 240px;
        background: #000;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .header {
        display: flex;
        justify-content: space-between;
        padding: 5px 10px;
        font-size: 10px;
        background: #222;
        color: #aaa;
      }
      .footer {
        position: absolute;
        bottom: 5px;
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .dots { display: flex; gap: 5px; }
      .dot { width: 4px; height: 4px; border-radius: 50%; background: #555; }
      .dot.active { background: #fdd835; }

      .page { flex: 1; padding: 10px; display: flex; flex-direction: column; }
      
      .box {
        background: #111;
        border-radius: 6px;
        padding: 8px;
        text-align: center;
        border: 1px solid #333;
      }
      .solar { color: #fdd835; box-shadow: inset 0 0 15px rgba(253,216,53,0.1); }
      .house { color: #4fc3f7; box-shadow: inset 0 0 15px rgba(79,195,247,0.1); }
      .grid.export { color: #66bb6a; box-shadow: inset 0 0 15px rgba(102,187,106,0.1); }
      .grid.import { color: #ef5350; box-shadow: inset 0 0 15px rgba(239,83,80,0.1); }
      
      .value { font-size: 24px; font-weight: bold; }
      .value span { font-size: 12px; margin-left: 2px; }
      .value.small { font-size: 14px; }

      .middle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
      }

      .soc-ring {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: conic-gradient(#4caf50 var(--perc), #333 0);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 5px;
      }
      .soc-ring .inner {
          width: 32px;
          height: 32px;
          background: #111;
          border-radius: 50%;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
      }

      .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          height: 100%;
      }
      .stat-item {
          background: #111;
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #333;
      }
      .stat-item .label { font-size: 10px; color: #888; text-transform: uppercase; }
      
      .cyd-controls {
          position: absolute;
          right: -55px;
          top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
      }
      .cyd-controls button {
          background: #444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
      }
      .cyd-controls button:hover { background: #555; }
      
      .cyd-info { margin-bottom: 25px; text-align: center; color: #aaa; }
      .cyd-info h3 { margin: 0; color: #4fc3f7; font-size: 16px; }
      .cyd-info p { margin: 5px 0 0; font-size: 12px; }

      /* FORMS & SETTINGS */
      .tech-box {
          background: rgba(0,0,0,0.3);
          border: 1px solid #333;
          border-radius: 10px;
          padding: 20px;
      }
      .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
      }
      .flex-1 { flex: 1; }
      
      .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
      }
      .form-group label {
          font-size: 0.9em;
          color: #bbb;
          margin-bottom: 6px;
          font-weight: 500;
      }
      .form-group select, .form-group input[type="text"], .form-group input[type="number"] {
          background: #111;
          color: #fff;
          border: 1px solid #444;
          padding: 10px;
          border-radius: 6px;
          font-size: 1em;
          outline: none;
          width: 100%;
          box-sizing: border-box;
      }
      .form-group select:focus, .form-group input:focus {
          border-color: #fdd835;
      }
      .form-group small {
          color: #aaa;
          margin-top: 5px;
          font-size: 0.85em;
      }

      .btn-save {
          background: #4caf50;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 1.1em;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      }
      .btn-save:hover {
          background: #43a047;
      }
    `;
  }
}

customElements.define("cyd-preview", CYDPreview);
