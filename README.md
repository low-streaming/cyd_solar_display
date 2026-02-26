# CYD Solar Display - OpenKairo Edition für Home Assistant

![OpenKairo Logo](https://img.shields.io/badge/OpenKairo-Cyberpunk_Design-00f3ff?style=for-the-badge) ![HACS](https://img.shields.io/badge/HACS-Custom_Integration-orange?style=for-the-badge)

Eine maßgeschneiderte Home Assistant Integration für das **Cheap Yellow Display (CYD)** (ESP32). Sie liefert ein atemberaubendes Live-Solar-Dashboard im neon-durchfluteten **OpenKairo Cyberpunk Design** – alles komplett lokal und in Echtzeit aus deinem Hausenergiesystem direkt auf den Schreibtisch gestreamt.

## 🚀 Kern-Features
- **Live Energiefluss-Dashboard (Seite 1):** Zeigt Solarerzeugung, Batteriestand, Hausverbrauch und den exakten Netzaustausch (Bezug/Einspeisung) mithilfe von dynamischen Cyberpunk-Graphen.
- **kW / Watt Umschaltung:** Über das Dashboard kann jederzeit eingestellt werden, ob Werte in Watt oder Kilowatt angezeigt werden.
- **Ertrags-Statistiken (Seite 2):** Tages-, Monats-, Jahres- und Gesamt-PV-Erträge werden sauber und aufgeräumt visualisiert.
- **Vollständig anpassbare Sensoren (Seite 3 & 4):** Definiere selbst bis zu 8 komplett freie Sensoren (wie Temperaturen, Luftfeuchtigkeit, Growbox-Werte) direkt aus Home Assistant.
- **Mining Sensoren (Seite 5):** Spezielle Seite im auffälligen Orange-Theme für bis zu 4 eigene Variablen (z.B. Hashrate, Temperatur, Ertrag, Verbrauch).
- **Smarte Seitenverwaltung:** Alle Seiten (1, 2, 3/4, 5) lassen sich in den Einstellungen einzeln aktivieren oder deaktivieren. Das Display überspringt deaktivierte Seiten beim automatischen Durchblättern nahtlos. 
- **Integriertes Dashboard-Panel:** Richte die Integration komfortabel über ein voll animiertes, interaktives "CYD Monitor" Sidebar-Panel in Home Assistant ein, welches das Layout deines ESP32 1:1 im Browser live rendert.

## 🛒 Hardware & Voraussetzungen

1. **Hardware:** Du benötigst das ESP32 CYD (Modell 2432S028).
   - 🛒 Die Hardware verkaufen wir **fertig geflasht (Plug & Play)** hier: [solarmodule-gladbeck.de/produkt/ok_display/](https://solarmodule-gladbeck.de/produkt/ok_display/). Wenn du dieses kaufst, musst du es **nicht mehr flashen** (Punkt 2 entfällt).
2. **ESPHome Code (nur für Eigenbau):** Verwende die ESPHome YAML des CYD_Solar_Displays und flashe deinen ESP32 (z.B. über [web.esphome.io](https://web.esphome.io)).

## 🛠️ Installation

### Methode 1: HACS (Empfohlen)
1. Öffne HACS in Home Assistant.
2. Gehe auf **Integrationen** -> **Benutzerdefinierte Repositories**.
3. Füge die URL dieses Repositories als "Integration" hinzu.
4. Klicke auf "Herunterladen" und starte Home Assistant neu.

### Methode 2: Manuelle Installation
1. Lade dir dieses Repository herunter.
2. Kopiere den Ordner `custom_components/cyd_solar_display` in das `custom_components` Verzeichnis deiner Home Assistant Installation.
3. Starte Home Assistant neu.

## ⚙️ Einrichtung
1. Gehe in Home Assistant zu **Einstellungen > Geräte & Dienste**.
2. Klicke auf **Integration hinzufügen** und suche nach `CYD Solar Display`.
3. Gib deine Daten ein (im CYD Monitor Sidebar-Panel kannst du alles später bequem anpassen).
4. **Flashe dein ESP32 (CYD) Display** mithilfe der beiliegenden `cyd_solar_display.yaml` über das ESPHome Dashboard. Lass hierbei Home Assistant die IP Adresse via mDNS auflösen.

## 📡 Funktionsweise (ESPHome API / Native API)
Anders als viele simple Displays pusht diese Integration keine stummen JSON-Texte über MQTT oder langsame HTTP-Endpunkte. 

Wir greifen im Hintergrund auf die ultrastarke **`homeassistant.services.async_call`** Systemarchitektur zurück und feuern die Sensordaten per direkter C++ Funktionsausführung in die Native API des ESPHome-Geräts. Dies gewährt extrem niedrige Latenzen und entlastet das WLAN, während das Python-Backend intelligent mittels `DataUpdateCoordinator` das ESP32 dirigiert. 

Das Display reagiert passiv (wird also mit Daten "befeuert") und führt alle Layout-Renderings als autarker Lambda-Code selbst durch.

## 🗺️ Status & Wartung
Das CYD Solar Display Projekt wird aktuell als **Feature-Complete (Closed)** angesehen. Das bedeutet, das Panel hat alle Kernfunktionen, die für das OpenKairo Ökosystem geplant waren, erfolgreich erreicht. 

Die zukünftige Entwicklung fokussiert sich rein auf:
- 🛠️ **Wartung & Bugfixes:** Sicherstellen der Kompatibilität mit neuen Home Assistant Core- und ESPHome-Updates.
- 🎨 **Feintuning:** Kleinere optische Anpassungen am bestehenden Cyberpunk-Theme.
- 🚦 **Stabilisierung:** Optimierung der Auslastung und Laufzeitstabilität des ESP32.

Wir danken allen Nutzerinnen und Nutzern für das umfangreiche Feedback während der Entwicklungsphase!

---

## ☕ Support & Spenden

Dir gefällt das Projekt und du möchtest die Weiterentwicklung unterstützen? Ich freue mich riesig über jeden noch so kleinen Betrag für die nächste Tasse Kaffee!

[![Spenden via PayPal](https://img.shields.io/badge/PayPal-Spenden-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=info@low-streaming.de&currency_code=EUR)

📧 **Kontakt / PayPal-Adresse direkt:** `info@low-streaming.de`

---
**Powered by [OpenKairo](https://openkairo.de) - Developed with ♥ for the HA Community.**
