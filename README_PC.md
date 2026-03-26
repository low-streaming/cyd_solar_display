# CYD SOLAR DISPLAY - PC SETUP & FIRMWARE BUILD

Diese Anleitung hilft dir dabei, die Firmware an deinem PC (Windows) mit **Visual Studio Code** zu kompilieren. Das ist deutlich schneller und stabiler als auf einem Raspberry Pi.

## 1. Voraussetzungen auf dem PC
* **Python** installiert (von python.org)
* **VS Code** installiert

## 2. ESPHome installieren
Öffne eine **PowerShell** an deinem PC und installiere ESPHome:
```powershell
pip install esphome
```

## 3. Firmware lokal kompilieren (Ohne HA)
Um die `.bin` Datei für deinen Server zu generieren, führe diesen Befehl in deinem Projektordner aus:
```powershell
esphome compile cyd_solar_display.yaml
```
Das Ergebnis findest du danach unter:
`cyd_solar_display\.esphome\build\cyd-solar-display\.pioenvs\cyd-solar-display\firmware.bin`

## 4. Nutzung in VS Code
1. Installiere die Erweiterung **"ESPHome"** in VS Code.
2. Öffne den Ordner `cyd_solar_display` in VS Code.
3. Klicke mit der rechten Maustaste auf `cyd_solar_display.yaml` und wähle **"ESPHome: Compile"**.

---

### Warum das "PC-Setup" der Markt-Standard ist:
* **Keine Abstürze:** Der Compiler hat am PC genug RAM (8GB+ statt 1GB beim Pi).
* **Speed:** Ein Build dauert am PC nur Sekunden, statt Minuten.
* **Dateizugriff:** Du kannst die `.bin` sofort hochladen und deine `version.txt` anpassen.

**Viel Erfolg beim ersten Build am PC!**
