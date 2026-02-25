/**
 * CYD Solar Display - Preview Component
 * Simulates a 320x240 ESP32 Display
 */

import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

  class CYDPreview extends LitElement {
    static get properties() {
      return {
        hass: { type: Object },
        config: { type: Object },
        page: { type: Number },
        data: { type: Object }
      };
    }

    constructor() {
      super();
      this.page = 1;
      this.data = {
        solar_w: 4500,
        grid_w: -1200,
        house_w: 2800,
        battery_w: 500,
        battery_soc: 85,
        yield_today_kwh: 12.4,
        grid_import_kwh: 2.1,
        grid_export_kwh: 5.8
      };
    }

    render() {
      const isNegative = this.data.grid_w < 0;

      return html`
        <div class="cyd-container">
          <div class="cyd-frame">
            <div class="cyd-screen">
              <div class="header">
                <span class="title">Solar Monitor</span>
                <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              ${this.page === 1 ? this.renderPage1() : this.renderPage2()}

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
          <div class="cyd-info">
            <h3>CYD Display Live Preview</h3>
            <p>This is a 1:1 simulation of your ESP32 Display.</p>
          </div>
        </div>
      `;
    }

    renderPage1() {
      return html`
        <div class="page page1">
          <div class="flow-layout">
            <!-- Solar -->
            <div class="box solar">
              <div class="icon">☀️</div>
              <div class="value">${this.data.solar_w}<span>W</span></div>
            </div>

            <div class="middle-row">
                <!-- Battery -->
                <div class="box battery">
                    <div class="soc-ring" style="--perc: ${this.data.battery_soc}%">
                        <div class="inner">${this.data.battery_soc}%</div>
                    </div>
                    <div class="value small">${this.data.battery_w}W</div>
                </div>

                <!-- Center Flow (Visualized Arrows would be here) -->
                <div class="flow-center">
                    <div class="arrow ${this.data.grid_w < 0 ? 'out' : 'in'}"></div>
                </div>

                <!-- House -->
                <div class="box house">
                    <div class="icon">🏠</div>
                    <div class="value">${this.data.house_w}<span>W</span></div>
                </div>
            </div>

            <!-- Grid -->
            <div class="box grid ${this.data.grid_w < 0 ? 'export' : 'import'}">
              <div class="icon">⚡</div>
              <div class="value">${Math.abs(this.data.grid_w)}<span>W</span></div>
              <div class="label">${this.data.grid_w < 0 ? 'Feed-in' : 'Grid'}</div>
            </div>
          </div>
        </div>
      `;
    }

    renderPage2() {
      return html`
        <div class="page page2">
          <div class="stats-grid">
            <div class="stat-item">
                <div class="label">Yield Today</div>
                <div class="value">${this.data.yield_today_kwh} <span>kWh</span></div>
            </div>
            <div class="stat-item">
                <div class="label">Grid Import</div>
                <div class="value">${this.data.grid_import_kwh} <span>kWh</span></div>
            </div>
            <div class="stat-item">
                <div class="label">Grid Export</div>
                <div class="value">${this.data.grid_export_kwh} <span>kWh</span></div>
            </div>
            <div class="stat-item">
                <div class="label">Efficiency</div>
                <div class="value">94 <span>%</span></div>
            </div>
          </div>
        </div>
      `;
    }

    static get styles() {
      return css`
        :host {
          display: block;
          color: white;
          font-family: 'Roboto', sans-serif;
        }
        .cyd-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #1a1a1b;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .cyd-frame {
          width: 340px;
          height: 260px;
          background: #333;
          border-radius: 10px;
          padding: 10px;
          position: relative;
          box-shadow: inset 0 0 10px rgba(0,0,0,1);
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
        
        /* Layout elements */
        .box {
          background: #111;
          border-radius: 6px;
          padding: 8px;
          text-align: center;
          border: 1px solid #222;
        }
        .solar { color: #fdd835; }
        .house { color: #4fc3f7; }
        .grid.export { color: #66bb6a; }
        .grid.import { color: #ef5350; }
        
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
            background: conic-gradient(#4caf50 var(--perc), #222 0);
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
        }
        .stat-item .label { font-size: 10px; color: #888; text-transform: uppercase; }
        
        .cyd-controls {
            position: absolute;
            right: -50px;
            top: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        button {
            background: #444;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover { background: #555; }
        
        .cyd-info { margin-top: 15px; text-align: center; color: #888; }
        .cyd-info h3 { margin: 0; color: #eee; font-size: 14px; }
        .cyd-info p { margin: 5px 0 0; font-size: 12px; }
      `;
    }
  }

  customElements.define("cyd-preview", CYDPreview);
