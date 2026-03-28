import aiohttp
import logging
from homeassistant.components.update import (
    UpdateEntity,
    UpdateEntityFeature,
    UpdateDeviceClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
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
        """Install an update using the ESPHome web server."""
        _LOGGER.info("USER-ACTION: Direct-Push Update gestartet für Version %s", version)
        
        target_host = self.coordinator.entry.data.get(CONF_HOST)
        if not target_host:
            _LOGGER.error("FEHLER: Keine Host-IP für das Display gefunden!")
            return

        # 1. URL zur Datei auf GitHub
        update_url = "https://raw.githubusercontent.com/low-streaming/cyd_solar_display/main/cyd_solar_display.bin"
        
        try:
            # 2. Download der Binary von GitHub
            _LOGGER.info("Lade Firmware von GitHub herunter: %s", update_url)
            async with aiohttp.ClientSession() as session:
                async with session.get(update_url) as resp:
                    if resp.status != 200:
                        _LOGGER.error("Download fehlgeschlagen (Status %s)", resp.status)
                        return
                    binary_data = await resp.read()
            
            # 3. Upload zum Display (ESPHome WebServer /update endpoint)
            # ESPHome erwartet die Datei als Multipart-Form-Data
            upload_url = f"http://{target_host}/update"
            _LOGGER.info("Pushing Firmware zu Display unter: %s", upload_url)
            
            data = aiohttp.FormData()
            data.add_field('update', 
                           binary_data,
                           filename='firmware.bin',
                           content_type='application/octet-stream')
            
            async with aiohttp.ClientSession() as session:
                async with session.post(upload_url, data=data) as resp:
                    if resp.status == 200:
                        _LOGGER.info("Update erfolgreich gesendet! Display startet neu.")
                    else:
                        _LOGGER.error("Push fehlgeschlagen! Status: %s. Ist der WebServer aktiv?", resp.status)

        except Exception as err:
            _LOGGER.error("Kritischer Fehler beim Update-Push: %s", err)
