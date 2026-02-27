# CYD Solar Display - OpenKairo Edition für Home Assistant

![Version](https://img.shields.io/github/v/release/low-streaming/cyd_solar_display?style=for-the-badge&color=fdd835) ![OpenKairo Logo](https://img.shields.io/badge/OpenKairo-Cyberpunk_Design-00f3ff?style=for-the-badge) ![HACS](https://img.shields.io/badge/HACS-Custom_Integration-orange?style=for-the-badge)

Eine maßgeschneiderte Home Assistant Integration für das **Cheap Yellow Display (CYD)** (ESP32 2432S028). Sie liefert ein atemberaubendes Live-Solar-Dashboard im neon-durchfluteten **OpenKairo Cyberpunk Design** – alles komplett lokal und in Echtzeit aus deinem Hausenergiesystem direkt auf den Schreibtisch gestreamt.

---

## 🚀 Kern-Features

- **⚡ Live Energiefluss-Dashboard (Seite 1):** Solarerzeugung, Batteriestand, Hausverbrauch und den exakten Netzaustausch (Bezug/Einspeisung) in dynamischen Cyberpunk-Graphen.
- **🔢 kW / Watt Umschaltung:** Jederzeit zwischen Watt und Kilowatt wechseln.
- **📊 Ertrags-Statistiken (Seite 2):** Tages-, Monats-, Jahres- und Gesamt-PV-Erträge sauber visualisiert.
- **🔮 Eigene Sensoren (Seite 3 & 4):** Bis zu 8 frei belegbare Sensoren aus Home Assistant (Temperaturen, Luftfeuchte, Growbox-Werte, etc.).
- **⛏️ Mining Sensoren (Seite 5):** Spezielle Seite im auffälligen Orange-Theme für bis zu 4 Mining-Variablen (Hashrate, Temperatur, Ertrag, Verbrauch).
- **🎛️ Smarte Seitenverwaltung:** Alle Seiten einzeln aktivierbar/deaktivierbar. Das Display überspringt deaktivierte Seiten nahtlos.
- **🖥️ Integriertes Dashboard-Panel:** Voll animiertes, interaktives „CYD Monitor" Sidebar-Panel mit **1:1 Live-Simulation** und durchsuchbarem Sensor-Picker.

---

## 🛒 Hardware & Voraussetzungen

| # | Was | Details |
|---|-----|---------|
| 1 | **ESP32 CYD Hardware** | Modell **2432S028** (Cheap Yellow Display) |
| 2 | **Home Assistant** | 2023.4 oder neuer |
| 3 | **ESPHome Add-on** | Für die Native API Verbindung |

> 🛒 Die Hardware gibt es **fertig geflasht (Plug & Play)** bei: [solarmodule-gladbeck.de/produkt/ok_display/](https://solarmodule-gladbeck.de/produkt/ok_display/)

---

## 🛠️ Installation

### Methode 1: HACS (Empfohlen)
1. Öffne HACS in Home Assistant.
2. Gehe auf **Integrationen** → **Benutzerdefinierte Repositories**.
3. Füge die URL dieses Repositories als „Integration" hinzu.
4. Klicke auf **Herunterladen** und starte Home Assistant neu.

### Methode 2: Manuelle Installation
1. Lade dir dieses Repository herunter.
2. Kopiere den Ordner `custom_components/cyd_solar_display` in das `custom_components`-Verzeichnis deiner Home Assistant Installation.
3. Starte Home Assistant neu.

---

## ⚙️ Einrichtung

1. Gehe zu **Einstellungen → Geräte & Dienste**.
2. Klicke auf **Integration hinzufügen** und suche nach `CYD Solar Display`.
3. Gib die IP-Adresse oder den mDNS-Hostnamen deines ESP32 ein.
4. Öffne das **CYD Monitor** Sidebar-Panel und verknüpfe deine Sensoren im Tab „Einstellungen".

---

## 📡 Funktionsweise (ESPHome Native API)

Diese Integration nutzt die **ESPHome Native API** über direkten C++ Funktionsaufruf – kein MQTT, kein HTTP-Polling. Die HA-Integration sendet Sensordaten mit einem einstellbaren Intervall (Standard: 5 Sekunden) aktiv an das ESP32. Das Display rendert alle Layouts autark als Lambda-Code.

---

## 🗺️ Roadmap

> **Hinweis:** Die Display-Firmware (ESPHome YAML / C++ Lambda-Code) ist als **abgeschlossen und eingefroren** zu betrachten. Hardware-seitige Änderungen sind nicht mehr geplant.  
> Neue Features betreffen ausschließlich die **Home Assistant Integration** (Python-Backend & das Web-Panel).

### ✅ Abgeschlossen
- [x] Live Energiefluss-Dashboard (Seite 1)
- [x] Ertrags-Statistiken (Seite 2)
- [x] Eigene Sensoren Seite 3 & 4 (8 Slots)
- [x] Mining Sensoren (Seite 5)
- [x] Seiten einzeln aktivierbar/deaktivierbar
- [x] kW / Watt Umschaltung
- [x] Interaktives Sidebar-Panel (CYD Monitor) mit 1:1 Live Preview
- [x] Durchsuchbarer Sensor-Picker im Panel (Autocomplete)
- [x] Schöne Entity-Chips mit Friendly Name + Entity-ID Anzeige

### 🔧 In Arbeit / Kurzfristig
- [ ] **Stabilisierung:** Optimierung der Laufzeitstabilität und Speichernutzung im Backend-Coordinator
- [ ] **Fehlerbehandlung:** Bessere Anzeige wenn ein Sensor nicht verfügbar ist (`unavailable` / `unknown`)
- [ ] **HACS-Listing:** Offizielles Listing im HACS Default-Store anstreben

### 💡 Geplant / Mittelfristig
- [ ] **Konfigurations-Export/Import:** Sensor-Zuordnungen als JSON exportieren und auf anderen HA-Instanzen importieren
- [ ] **Mehrere Displays:** Unterstützung für mehrere CYD-Instanzen gleichzeitig in einer HA-Instanz
- [ ] **Benachrichtigungen:** Optionale Push-Benachrichtigungen bei Über-/Unterschreitung von Schwellwerten

### 🌟 Ideen / Langfristig
- [ ] **Themes:** Auswahl zwischen verschiedenen Farbthemen im Panel (Cyberpunk, Classic, Minimal)
- [ ] **Wetter-Integration:** Optionale Anzeige von Wetterdaten und PV-Prognose auf einer Zusatzseite

---

## ☕ Support & Spenden

Dir gefällt das Projekt? Ich freue mich über jeden Beitrag für die nächste Tasse Kaffee!

[![Spenden via PayPal](https://img.shields.io/badge/PayPal-Spenden-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=info@low-streaming.de&currency_code=EUR)

📧 **Kontakt:** `info@low-streaming.de`

---

**Powered by [OpenKairo](https://openkairo.de) · Developed with ♥ for the HA Community**
