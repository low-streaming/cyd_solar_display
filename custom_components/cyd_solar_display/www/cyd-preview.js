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
      const data = await this.hass.callApi('GET', `cyd_solar_display/config/${entryId}`);
      this.editConfig = data.options || {};
      this.requestUpdate();
    } catch (e) { console.error("Failed to load config", e); }
  }

  async saveConfig() {
    if (!this.panel || !this.panel.config || !this.panel.config.entry_id) return;
    const entryId = this.panel.config.entry_id;
    try {
      await this.hass.callApi('POST', `cyd_solar_display/config/${entryId}`, this.editConfig);
      alert("✅ Einstellungen wurden erfolgreich gespeichert!");
    } catch (e) {
      console.error(e);
      alert("❌ Fehler beim Speichern der Einstellungen.");
    }
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
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            powered by <a href="https://openkairo.de" target="_blank" style="color: #9b59b6; text-decoration: none; font-weight: bold;">openkairo</a>
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
    const yield_month = this.getLiveValue(this.editConfig.yield_month_entity, 114.2);
    const yield_year = this.getLiveValue(this.editConfig.yield_year_entity, 1054.8);
    const yield_total = this.getLiveValue(this.editConfig.yield_total_entity, 3450.5);

    const c1_n = this.editConfig.custom1_name || "Custom 1";
    const c1_v = this.getLiveValue(this.editConfig.custom1_entity, 21.5) + " °C";
    const c2_n = this.editConfig.custom2_name || "Custom 2";
    const c2_v = this.getLiveValue(this.editConfig.custom2_entity, 48.0) + " %";
    const c3_n = this.editConfig.custom3_name || "Custom 3";
    const c3_v = this.getLiveValue(this.editConfig.custom3_entity, 1120.0) + " kWh";
    const c4_n = this.editConfig.custom4_name || "Custom 4";
    const c4_v = this.getLiveValue(this.editConfig.custom4_entity, 1.0) + " bar";

    const c5_n = this.editConfig.custom5_name || "Custom 5";
    const c5_v = this.getLiveValue(this.editConfig.custom5_entity, 21.5) + " °C";
    const c6_n = this.editConfig.custom6_name || "Custom 6";
    const c6_v = this.getLiveValue(this.editConfig.custom6_entity, 48.0) + " %";
    const c7_n = this.editConfig.custom7_name || "Custom 7";
    const c7_v = this.getLiveValue(this.editConfig.custom7_entity, 1120.0) + " kWh";
    const c8_n = this.editConfig.custom8_name || "Custom 8";
    const c8_v = this.getLiveValue(this.editConfig.custom8_entity, 1.0) + " bar";

    const m1_n = this.editConfig.mining1_name || "Mining 1";
    const m1_v = this.getLiveValue(this.editConfig.mining1_entity, 120.0) + " TH/s";
    const m2_n = this.editConfig.mining2_name || "Mining 2";
    const m2_v = this.getLiveValue(this.editConfig.mining2_entity, 65.0) + " °C";
    const m3_n = this.editConfig.mining3_name || "Mining 3";
    const m3_v = this.getLiveValue(this.editConfig.mining3_entity, 3500.0) + " W";
    const m4_n = this.editConfig.mining4_name || "Mining 4";
    const m4_v = this.getLiveValue(this.editConfig.mining4_entity, 1.0) + " BTC";

    const hasPage1 = this.editConfig.enable_page1 !== false;
    const hasPage2 = this.editConfig.enable_page2 !== false;
    const hasPage3 = this.editConfig.enable_page3 !== false;
    const hasPage4 = this.editConfig.enable_page4 !== false;
    const hasPage5 = this.editConfig.enable_page5 !== false;

    const isNegative = grid_w < 0;
    const pVal = (w) => this.editConfig.show_kw ? (w / 1000).toFixed(2) : Math.round(w);
    const pUnit = this.editConfig.show_kw ? "kW" : "W";

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
                      <div class="box solar" style="margin: 0 auto; width: 120px;">
                        <div class="icon">☀️</div>
                        <div class="value">${pVal(solar_w)}<span>${pUnit}</span></div>
                      </div>

                      <div class="middle-row">
                          <div class="box battery" style="width: 70px;">
                              <div class="soc-ring" style="--perc: ${battery_soc}%">
                                  <div class="inner">${battery_soc}%</div>
                              </div>
                              <div class="value small">${pVal(battery_w)}${pUnit}</div>
                          </div>
                          <div class="box house" style="width: 70px;">
                              <div class="icon">🏠</div>
                              <div class="value">${pVal(house_w)}<span>${pUnit}</span></div>
                          </div>
                      </div>

                      <div class="box grid ${isNegative ? 'export' : 'import'}" style="margin: 0 auto; width: 120px;">
                        <div class="icon">⚡</div>
                        <div class="value">${pVal(Math.abs(grid_w))}<span>${pUnit}</span></div>
                        <div class="label" style="font-size: 10px;">${isNegative ? 'Einspeisung' : 'Netzbezug'}</div>
                      </div>
                    </div>
                  </div>
                ` : this.page === 2 ? html`
                  <div class="page page2">
                    <div class="stats-grid">
                      <div class="stat-item" style="border-left: 4px solid #fdd835;">
                          <div class="label" style="color: #fdd835;">Ertrag Tag</div>
                          <div class="value">${yield_today} <span>kWh</span></div>
                      </div>
                      <div class="stat-item" style="border-left: 4px solid #fdd835;">
                          <div class="label" style="color: #fdd835;">Ertrag Monat</div>
                          <div class="value">${yield_month} <span>kWh</span></div>
                      </div>
                      <div class="stat-item" style="border-left: 4px solid #fdd835;">
                          <div class="label" style="color: #fdd835;">Ertrag Jahr</div>
                          <div class="value">${yield_year} <span>kWh</span></div>
                      </div>
                      <div class="stat-item" style="border-left: 4px solid #fdd835;">
                          <div class="label" style="color: #fdd835;">Gesamtertrag</div>
                          <div class="value">${yield_total} <span>kWh</span></div>
                      </div>
                    </div>
                  </div>
                ` : this.page === 3 ? html`
                  <div class="page page3">
                    <div class="stats-grid">
                      ${this.editConfig.custom1_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #00f3ff;">
                          <div class="label" style="color: #00f3ff;">${c1_n}</div>
                          <div class="value">${c1_v}</div>
                      </div>` : ''}
                      ${this.editConfig.custom2_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #00ff73;">
                          <div class="label" style="color: #00ff73;">${c2_n}</div>
                          <div class="value">${c2_v}</div>
                      </div>` : ''}
                      ${this.editConfig.custom3_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #b026ff;">
                          <div class="label" style="color: #b026ff;">${c3_n}</div>
                          <div class="value">${c3_v}</div>
                      </div>` : ''}
                      ${this.editConfig.custom4_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #ff003c;">
                          <div class="label" style="color: #ff003c;">${c4_n}</div>
                          <div class="value">${c4_v}</div>
                      </div>` : ''}
                    </div>
                  </div>
                ` : this.page === 4 ? html`
                  <div class="page page4">
                    <div class="stats-grid">
                      ${this.editConfig.custom5_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #00f3ff;">
                          <div class="label" style="color: #00f3ff;">${c5_n}</div>
                          <div class="value">${c5_v}</div>
                      </div>` : ''}
                      ${this.editConfig.custom6_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #00ff73;">
                          <div class="label" style="color: #00ff73;">${c6_n}</div>
                          <div class="value">${c6_v}</div>
                      </div>` : ''}
                      ${this.editConfig.custom7_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #b026ff;">
                          <div class="label" style="color: #b026ff;">${c7_n}</div>
                          <div class="value">${c7_v}</div>
                      </div>` : ''}
                      ${this.editConfig.custom8_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #ff003c;">
                          <div class="label" style="color: #ff003c;">${c8_n}</div>
                          <div class="value">${c8_v}</div>
                      </div>` : ''}
                    </div>
                  </div>
                ` : html`
                  <div class="page page5">
                    <div class="stats-grid">
                      ${this.editConfig.mining1_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #ff9800;">
                          <div class="label" style="color: #ff9800;">${m1_n}</div>
                          <div class="value">${m1_v}</div>
                      </div>` : ''}
                      ${this.editConfig.mining2_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #ff9800;">
                          <div class="label" style="color: #ff9800;">${m2_n}</div>
                          <div class="value">${m2_v}</div>
                      </div>` : ''}
                      ${this.editConfig.mining3_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #ff9800;">
                          <div class="label" style="color: #ff9800;">${m3_n}</div>
                          <div class="value">${m3_v}</div>
                      </div>` : ''}
                      ${this.editConfig.mining4_entity ? html`
                      <div class="stat-item" style="border-left: 4px solid #ff9800;">
                          <div class="label" style="color: #ff9800;">${m4_n}</div>
                          <div class="value">${m4_v}</div>
                      </div>` : ''}
                    </div>
                  </div>
                `}

                <div class="footer">
                  <div class="dots">
                    ${hasPage1 ? html`<div class="dot ${this.page === 1 ? 'active' : ''}"></div>` : ''}
                    ${hasPage2 ? html`<div class="dot ${this.page === 2 ? 'active' : ''}"></div>` : ''}
                    ${hasPage3 ? html`<div class="dot ${this.page === 3 ? 'active' : ''}"></div>` : ''}
                    ${hasPage4 ? html`<div class="dot ${this.page === 4 ? 'active' : ''}"></div>` : ''}
                    ${hasPage5 ? html`<div class="dot ${this.page === 5 ? 'active' : ''}"></div>` : ''}
                  </div>
                </div>
              </div>
              <div class="cyd-controls">
                ${hasPage1 ? html`<button @click="${() => this.page = 1}">P1</button>` : ''}
                ${hasPage2 ? html`<button @click="${() => this.page = 2}">P2</button>` : ''}
                ${hasPage3 ? html`<button @click="${() => this.page = 3}">P3</button>` : ''}
                ${hasPage4 ? html`<button @click="${() => this.page = 4}">P4</button>` : ''}
                ${hasPage5 ? html`<button @click="${() => this.page = 5}">P5</button>` : ''}
              </div>
            </div>
          </div>
      </div>
    `;
  }

  renderSettings() {
    const sensorOptions = this.getEntitiesByDomain('sensor');

    return html`
  < div class="card edit-card" >
        <h2>🛠️ Sensoren & Konfiguration</h2>
        <p style="color:#aaa; font-size:14px; margin-bottom: 25px;">Verknüpfe hier deine Home Assistant Sensoren, die auf dem ESP32 Display angezeigt werden sollen.</p>
        
        <div class="tech-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #fdd835; margin-top: 0;">⚡ Kern-Sensoren (Live) - Seite 1</h3>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #fff;">
                    <input type="checkbox" name="enable_page1" .checked="${this.editConfig.enable_page1 !== false}" @change="${this.handleFormInput}" style="width: 18px; height: 18px; accent-color: #fdd835;">
                    Aktivieren
                </label>
            </div>
            
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #fff; margin-bottom: 15px; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 4px; width: fit-content;">
                <input type="checkbox" name="show_kw" .checked="${this.editConfig.show_kw === true}" @change="${this.handleFormInput}" style="width: 16px; height: 16px; accent-color: #fdd835;">
                Leistung in Kilowatt (kW) anzeigen anstatt in Watt (W)
            </label>

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
                  </select >
                </div >
            </div >

  <div class="form-row">
    <div class="form-group flex-1">
      <label>Hausverbrauch (W)</label>
      <select name="house_entity" @change="${this.handleFormInput}">
      <option value="" ?selected="${!this.editConfig.house_entity}">-- Sensor wählen --</option>
    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.house_entity === opt.id}">${opt.name}</option>`)}
  </select>
                </div >
  <div class="form-group flex-1">
    <label>Batterie Leistung (W)</label>
    <select name="battery_entity" @change="${this.handleFormInput}">
    <option value="" ?selected="${!this.editConfig.battery_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.battery_entity === opt.id}">${opt.name}</option>`)}
                  </select >
                </div >
            </div >

  <div class="form-group" style="width: 50%;">
    <label>Batterie Füllstand (%)</label>
    <select name="battery_soc_entity" @change="${this.handleFormInput}">
    <option value="" ?selected="${!this.editConfig.battery_soc_entity}">-- Sensor wählen --</option>
                ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.battery_soc_entity === opt.id}">${opt.name}</option>`)}
                </select >
            </div >
        </div >

        <div class="tech-box" style="margin-top: 20px; border-color: rgba(52, 152, 219, 0.4);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #3498db; margin-top: 0;">📊 Statistik-Sensoren (kWh) - Seite 2</h3>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #fff;">
                    <input type="checkbox" name="enable_page2" .checked="${this.editConfig.enable_page2 !== false}" @change="${this.handleFormInput}" style="width: 18px; height: 18px; accent-color: #3498db;">
                    Aktivieren
                </label>
            </div>
            <div class="form-row">
                <div class="form-group flex-1">
                  <label>Ertrag Heute (kWh)</label>
                  <select name="yield_today_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.yield_today_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.yield_today_entity === opt.id}">${opt.name}</option>`)}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Ertrag Laufender Monat (kWh)</label>
                  <select name="yield_month_entity" @change="${this.handleFormInput}">
                    <option value="" ?selected="${!this.editConfig.yield_month_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.yield_month_entity === opt.id}">${opt.name}</option>`)}
                  </select >
                </div >
            </div >
  <div class="form-row">
    <div class="form-group flex-1">
      <label>Ertrag Laufendes Jahr (kWh)</label>
      <select name="yield_year_entity" @change="${this.handleFormInput}">
      <option value="" ?selected="${!this.editConfig.yield_year_entity}">-- Sensor wählen --</option>
    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.yield_year_entity === opt.id}">${opt.name}</option>`)}
  </select>
                </div >
  <div class="form-group flex-1">
    <label>Gesamtertrag (Lifelime) (kWh)</label>
    <select name="yield_total_entity" @change="${this.handleFormInput}">
    <option value="" ?selected="${!this.editConfig.yield_total_entity}">-- Sensor wählen --</option>
                    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.yield_total_entity === opt.id}">${opt.name}</option>`)}
                  </select >
                </div >
            </div >
        </div >

  <div class="tech-box" style="margin-top: 20px; border-color: #00f3ff;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="color: #00f3ff; margin-top: 0;">🔮 Eigene Sensoren (Seite 3)</h3>
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #fff;">
          <input type="checkbox" name="enable_page3" .checked="${this.editConfig.enable_page3 !== false}" @change="${this.handleFormInput}" style="width: 18px; height: 18px; accent-color: #00f3ff;">
          Aktivieren
      </label>
    </div>
    
    ${this.editConfig.enable_page3 !== false ? html`
    <p style="color:#aaa; font-size: 12px; margin-top:-10px; margin-bottom: 15px;">Füge bis zu 4 eigene Sensoren hinzu, welche auf der dritten Seite angezeigt werden.</p>

    <div class="form-row">
      <div class="form-group flex-1">
        <label>Name 1 (z.B. Temperatur)</label>
        <input type="text" name="custom1_name" .value="${this.editConfig.custom1_name || ''}" @input="${this.handleFormInput}">
      </div>
      <div class="form-group flex-1">
        <label>Sensor 1</label>
        <select name="custom1_entity" @change="${this.handleFormInput}">
        <option value="" ?selected="${!this.editConfig.custom1_entity}">-- Sensor wählen --</option>
      ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom1_entity === opt.id}">${opt.name}</option>`)}
    </select>
  </div>
            </div>

  <div class="form-row">
    <div class="form-group flex-1">
      <label>Name 2 (z.B. Luftfeuchte)</label>
      <input type="text" name="custom2_name" .value="${this.editConfig.custom2_name || ''}" @input="${this.handleFormInput}">
    </div>
    <div class="form-group flex-1">
      <label>Sensor 2</label>
      <select name="custom2_entity" @change="${this.handleFormInput}">
      <option value="" ?selected="${!this.editConfig.custom2_entity}">-- Sensor wählen --</option>
    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom2_entity === opt.id}">${opt.name}</option>`)}
  </select>
                </div>
            </div>

  <div class="form-row">
    <div class="form-group flex-1">
      <label>Name 3</label>
      <input type="text" name="custom3_name" .value="${this.editConfig.custom3_name || ''}" @input="${this.handleFormInput}">
    </div>
    <div class="form-group flex-1">
      <label>Sensor 3</label>
      <select name="custom3_entity" @change="${this.handleFormInput}">
      <option value="" ?selected="${!this.editConfig.custom3_entity}">-- Sensor wählen --</option>
    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom3_entity === opt.id}">${opt.name}</option>`)}
  </select>
                </div>
            </div>

  <div class="form-row">
    <div class="form-group flex-1">
      <label>Name 4</label>
      <input type="text" name="custom4_name" .value="${this.editConfig.custom4_name || ''}" @input="${this.handleFormInput}">
    </div>
    <div class="form-group flex-1">
      <label>Sensor 4</label>
      <select name="custom4_entity" @change="${this.handleFormInput}">
      <option value="" ?selected="${!this.editConfig.custom4_entity}">-- Sensor wählen --</option>
    ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom4_entity === opt.id}">${opt.name}</option>`)}
  </select>
                </div>
            </div>
            ` : ''}
        </div>

        <div class="tech-box" style="margin-top: 20px; border-color: #fdd835;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="color: #fdd835; margin-top: 0;">🔮 Eigene Sensoren (Seite 4)</h3>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #fff;">
                  <input type="checkbox" name="enable_page4" .checked="${this.editConfig.enable_page4 !== false}" @change="${this.handleFormInput}" style="width: 18px; height: 18px; accent-color: #fdd835;">
                  Aktivieren
              </label>
            </div>
            
            ${this.editConfig.enable_page4 !== false ? html`
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 5</label>
                <input type="text" name="custom5_name" .value="${this.editConfig.custom5_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 5</label>
                <select name="custom5_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.custom5_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom5_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 6</label>
                <input type="text" name="custom6_name" .value="${this.editConfig.custom6_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 6</label>
                <select name="custom6_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.custom6_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom6_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 7</label>
                <input type="text" name="custom7_name" .value="${this.editConfig.custom7_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 7</label>
                <select name="custom7_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.custom7_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom7_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 8</label>
                <input type="text" name="custom8_name" .value="${this.editConfig.custom8_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 8</label>
                <select name="custom8_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.custom8_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.custom8_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>
            ` : ''}
        </div>
        
        <div class="tech-box" style="margin-top: 20px; border-color: #ff9800;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="color: #ff9800; margin-top: 0;">⛏️ Mining Sensoren (Seite 5)</h3>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: #fff;">
                  <input type="checkbox" name="enable_page5" .checked="${this.editConfig.enable_page5 !== false}" @change="${this.handleFormInput}" style="width: 18px; height: 18px; accent-color: #ff9800;">
                  Aktivieren
              </label>
            </div>
            
            ${this.editConfig.enable_page5 !== false ? html`
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 1 (z.B. Hashrate)</label>
                <input type="text" name="mining1_name" .value="${this.editConfig.mining1_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 1</label>
                <select name="mining1_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.mining1_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.mining1_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 2 (z.B. Temp)</label>
                <input type="text" name="mining2_name" .value="${this.editConfig.mining2_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 2</label>
                <select name="mining2_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.mining2_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.mining2_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 3</label>
                <input type="text" name="mining3_name" .value="${this.editConfig.mining3_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 3</label>
                <select name="mining3_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.mining3_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.mining3_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Name 4</label>
                <input type="text" name="mining4_name" .value="${this.editConfig.mining4_name || ''}" @input="${this.handleFormInput}">
              </div>
              <div class="form-group flex-1">
                <label>Sensor 4</label>
                <select name="mining4_entity" @change="${this.handleFormInput}">
                <option value="" ?selected="${!this.editConfig.mining4_entity}">-- Sensor wählen --</option>
              ${sensorOptions.map(opt => html`<option value="${opt.id}" ?selected="${this.editConfig.mining4_entity === opt.id}">${opt.name}</option>`)}
            </select>
              </div>
            </div>
            ` : ''}
        </div>

        <div class="tech-box" style="margin-top: 20px; border-color: rgba(155, 89, 182, 0.4);">
            <h3 style="color: #9b59b6; margin-top: 0;">⚙️ Allgemeine Eigenschaften</h3>
            
            <div class="form-row">
                <div class="form-group flex-1">
                  <label>Update Intervall (Sekunden)</label>
                  <input type="number" name="update_interval" min="1" .value="${this.editConfig.update_interval || 5}" @input="${this.handleFormInput}">
                  <small>Wie oft sollen Daten zum ESP32 gesendet werden?</small>
                </div>
                <div class="form-group flex-1">
                  <label>Seitenwechsel Intervall (Sekunden)</label>
                  <input type="number" name="page_interval" min="5" .value="${this.editConfig.page_interval || 10}" @input="${this.handleFormInput}">
                  <small>Wie lange eine Seite auf dem LCD angezeigt wird.</small>
                </div>
            </div>
        </div>

        <div class="form-actions" style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: right;">
            <button class="btn-save" @click="${this.saveConfig}">💾 Konfiguration Speichern & Anwenden</button>
        </div >
      </div >
  `;
  }

  renderInfo() {
    return html`
  < div class="card" >
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
      </div >
  `;
  }

  static get styles() {
    return css`
      :host {
  display: block;
  color: #e1e1e1;
  font - family: 'Roboto', 'Inter', sans - serif;
  background: #111111;
  min - height: 100vh;
  padding: 20px;
  box - sizing: border - box;
}
      
      .main - wrapper {
  max - width: 900px;
  margin: 0 auto;
}

      .header - main {
  text - align: center;
  margin - bottom: 30px;
}
      .header - main h1 {
  margin: 0;
  font - size: 2.5em;
  color: #fff;
  text - shadow: 0 0 20px rgba(253, 216, 53, 0.4);
}
      .header - main.subtitle {
  color: #888;
  font - size: 1.1em;
  margin: 5px 0 0;
}

      /* TABS */
      .tabs {
  display: flex;
  gap: 10px;
  margin - bottom: 20px;
  border - bottom: 2px solid #333;
  padding - bottom: 10px;
}
      .tab {
  padding: 10px 20px;
  border - radius: 8px;
  cursor: pointer;
  background: #222;
  color: #aaa;
  font - weight: 600;
  transition: all 0.2s ease -in -out;
}
      .tab:hover {
  background: #333;
  color: #fff;
}
      .tab.active {
  background: #fdd835;
  color: #000;
  box - shadow: 0 4px 15px rgba(253, 216, 53, 0.3);
}

      /* CONTENT CARDS */
      .card {
  background: #1a1a1c;
  border - radius: 12px;
  padding: 25px;
  box - shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
}
      
      .card h2 {
  margin - top: 0;
  color: #fff;
}

      /* CYD PREVIEW LAYOUT */
      .cyd - container {
  display: flex;
  justify - content: center;
  margin - top: 20px;
}
      .cyd - frame {
  width: 340px;
  height: 260px;
  background: #2b2b2b;
  border - radius: 12px;
  padding: 10px;
  position: relative;
  box - shadow: inset 0 0 10px rgba(0, 0, 0, 1), 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 2px solid #444;
}
      .cyd - screen {
  width: 320px;
  height: 240px;
  background: #000;
  overflow: hidden;
  position: relative;
  display: flex;
  flex - direction: column;
}
      .header {
  display: flex;
  justify - content: space - between;
  padding: 5px 10px;
  font - size: 10px;
  background: #222;
  color: #aaa;
}
      .footer {
  position: absolute;
  bottom: 5px;
  width: 100 %;
  display: flex;
  justify - content: center;
}
      .dots { display: flex; gap: 5px; }
      .dot { width: 4px; height: 4px; border - radius: 50 %; background: #555; }
      .dot.active { background: #fdd835; }

      .page { flex: 1; padding: 10px; display: flex; flex - direction: column; }
      
      .flow - layout {
  display: flex;
  flex - direction: column;
  justify - content: space - between;
  height: 185px;
}
      
      .box {
  background: #111;
  border - radius: 6px;
  padding: 4px;
  text - align: center;
  border: 1px solid #333;
}
      .solar { color: #fdd835; box - shadow: inset 0 0 15px rgba(253, 216, 53, 0.1); }
      .house { color: #4fc3f7; box - shadow: inset 0 0 15px rgba(79, 195, 247, 0.1); }
      .grid.export { color: #66bb6a; box - shadow: inset 0 0 15px rgba(102, 187, 106, 0.1); }
      .grid.import { color: #ef5350; box - shadow: inset 0 0 15px rgba(239, 83, 80, 0.1); }
      
      .value { font - size: 20px; font - weight: bold; line - height: 1.2; }
      .value span { font - size: 10px; margin - left: 2px; }
      .value.small { font - size: 12px; }

      .middle - row {
  display: flex;
  justify - content: space - between;
  align - items: center;
  margin: 0;
}

      .soc - ring {
  width: 34px;
  height: 34px;
  border - radius: 50 %;
  background: conic - gradient(#4caf50 var(--perc), #333 0);
  display: flex;
  align - items: center;
  justify - content: center;
  margin: 0 auto 3px;
}
      .soc - ring.inner {
  width: 26px;
  height: 26px;
  background: #111;
  border - radius: 50 %;
  font - size: 9px;
  display: flex;
  align - items: center;
  justify - content: center;
}

      .stats - grid {
  display: grid;
  grid - template - columns: 1fr 1fr;
  gap: 10px;
  height: 100 %;
}
      .stat - item {
  background: #111;
  border - radius: 8px;
  padding: 10px;
  display: flex;
  flex - direction: column;
  justify - content: center;
  border: 1px solid #333;
}
      .stat - item.label { font - size: 10px; color: #888; text - transform: uppercase; }
      
      .cyd - controls {
  position: absolute;
  right: -55px;
  top: 20px;
  display: flex;
  flex - direction: column;
  gap: 10px;
}
      .cyd - controls button {
  background: #444;
  color: white;
  border: none;
  padding: 6px 12px;
  border - radius: 6px;
  cursor: pointer;
  font - weight: bold;
}
      .cyd - controls button:hover { background: #555; }
      
      .cyd - info { margin - bottom: 25px; text - align: center; color: #aaa; }
      .cyd - info h3 { margin: 0; color: #4fc3f7; font - size: 16px; }
      .cyd - info p { margin: 5px 0 0; font - size: 12px; }

      /* FORMS & SETTINGS */
      .tech - box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border - radius: 10px;
  padding: 20px;
}
      .form - row {
  display: flex;
  gap: 15px;
  margin - bottom: 15px;
}
      .flex - 1 { flex: 1; }
      
      .form - group {
  display: flex;
  flex - direction: column;
  margin - bottom: 15px;
}
      .form - group label {
  font - size: 0.9em;
  color: #bbb;
  margin - bottom: 6px;
  font - weight: 500;
}
      .form - group select, .form - group input[type = "text"], .form - group input[type = "number"] {
  background: #111;
  color: #fff;
  border: 1px solid #444;
  padding: 10px;
  border - radius: 6px;
  font - size: 1em;
  outline: none;
  width: 100 %;
  box - sizing: border - box;
}
      .form - group select: focus, .form - group input:focus {
  border - color: #fdd835;
}
      .form - group small {
  color: #aaa;
  margin - top: 5px;
  font - size: 0.85em;
}

      .btn - save {
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 30px;
  border - radius: 8px;
  font - size: 1.1em;
  font - weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  box - shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}
      .btn - save:hover {
  background: #43a047;
}
`;
  }
}

customElements.define("cyd-preview", CYDPreview);
