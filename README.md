# CYD Solar Display for Home Assistant

Custom Home Assistant integration for the **Cheap Yellow Display (CYD)** ESP32. It provides a live solar dashboard with real-time values from your home energy system.

## 🚀 Features
- **Live Updates**: Pushes power flow data (Solar, Grid, Battery, House) to the display every few seconds.
- **Dual Pages**: Support for 2 pages (Live Flow & Daily Stats).
- **Auto-Switch**: Automatically toggle between pages.
- **Frontend Preview**: Visualise your display layout directly in Home Assistant.

## 🛠️ Installation
1. Copy the `cyd_solar_display` folder into your `custom_components` directory.
2. Restart Home Assistant.
3. Go to **Settings > Devices & Services > Add Integration** and search for `CYD Solar Display`.
4. Enter the IP of your CYD device.

## 🖥️ ESP32 (CYD) API Specification
The integration sends a JSON payload via HTTP POST to `http://<device_ip>/state`.

### Example Payload
```json
{
  "solar_w": 4500.5,
  "grid_w": -1200.0,
  "house_w": 3300.5,
  "battery_w": 0.0,
  "battery_soc": 85.0,
  "yield_today_kwh": 12.4,
  "grid_import_kwh": 2.1,
  "grid_export_kwh": 5.8,
  "page": 1,
  "timestamp": "2024-05-21T14:30:00"
}
```

### ESP32 Example (Arduino/ESP-IDF)
Your ESP32 should run a web server that listens for `POST /state`.
```cpp
// Pseudocode
server.on("/state", HTTP_POST, [](AsyncWebServerRequest *request) {
  // Handle JSON and update TFT display
  request->send(200, "application/json", "{\"status\":\"ok\"}");
});
```

## 🎨 Preview
Once configured, you can view the live preview in the Integration Options.
_Note: Ensure the frontend modules are loaded by checking the developer console for `cyd-preview.js`._

---
**Developed with ♥ for the HA Community.**
