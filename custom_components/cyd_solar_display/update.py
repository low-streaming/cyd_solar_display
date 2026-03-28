import logging
from homeassistant.components.update import (
    UpdateEntity,
    UpdateEntityFeature,
    UpdateDeviceClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities):
    """Set up the CYD Solar update entity."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([CYDSolarUpdateEntity(coordinator, entry)])

class CYDSolarUpdateEntity(CoordinatorEntity, UpdateEntity):
    """Update entity for CYD Solar Display."""

    _attr_has_entity_name = True
    _attr_device_class = UpdateDeviceClass.FIRMWARE
    _attr_supported_features = UpdateEntityFeature.INSTALL | UpdateEntityFeature.PROGRESS
    _attr_title = "CYD Solar Firmware"

    def __init__(self, coordinator, entry):
        """Initialize."""
        super().__init__(coordinator)
        self.entry = entry
        self._attr_unique_id = f"{entry.entry_id}_update"
        
        # Link to the same device as the rest of the integration
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name="CYD Solar Display",
            manufacturer="OpenKairo",
            model="ESP32-2432S028",
        )

    @property
    def installed_version(self):
        """Version currently in use."""
        # We try to get this from the coordinator data
        return self.coordinator.data.get("installed_version", "1.2.6")

    @property
    def latest_version(self):
        """Latest version available for install."""
        return self.coordinator.latest_version

    @property
    def in_progress(self):
        """Update installation in progress."""
        return self.coordinator.data.get("update_in_progress", False)

    async def async_install(self, version: str, backup: bool, **kwargs):
        """Install an update."""
        _LOGGER.info("USER-ACTION: Unabhängiges Firmware-Update gestartet für Version %s", version)
        
        # 1. URL zur Datei auf GitHub
        # Wir nutzen die Haupt-Datei, da ESPHome den Versions-Check intern über die Header macht
        update_url = "https://raw.githubusercontent.com/low-streaming/cyd_solar_display/main/cyd_solar_display.bin"
        
        # 2. Finde den spezialisierten OTA-Dienst
        ota_service = self.coordinator.data.get("ota_service")
        
        if not ota_service:
            _LOGGER.error("FEHLER: Kein OTA-Dienst für dieses Gerät gefunden! Discovery fehlgeschlagen.")
            return

        # 3. Rufe den ESPHome-Dienst auf dem Display auf
        try:
            _LOGGER.info("Sende Update-Befehl an Display via Dienst: esphome.%s", ota_service)
            await self.hass.services.async_call(
                "esphome",
                ota_service,
                {"url": update_url},
                blocking=True
            )
            _LOGGER.info("Update-Befehl erfolgreich gesendet! Das Display lädt die Datei nun selbstständig.")
        except Exception as err:
            _LOGGER.error("Senden des Update-Befehls fehlgeschlagen: %s", err)
