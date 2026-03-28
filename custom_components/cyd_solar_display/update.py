import logging
from homeassistant.components.update import (
    UpdateEntity,
    UpdateEntityFeature,
    DEVICE_CLASS_FIRMWARE,
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
    _attr_device_class = DEVICE_CLASS_FIRMWARE
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
        _LOGGER.info("Starting firmware update for CYD Solar Display to version %s", version)
        
        # 1. Find the ESPHome update entity
        esphome_update_entity = self.coordinator.data.get("esphome_update_entity")
        
        if not esphome_update_entity:
            _LOGGER.error("Could not find the target ESPHome update entity for installation")
            return

        # 2. Trigger the install service on the ESPhome entity
        try:
            await self.hass.services.async_call(
                "update",
                "install",
                {"entity_id": esphome_update_entity},
                blocking=True
            )
            _LOGGER.info("Successfully triggered ESPHome update for %s", esphome_update_entity)
        except Exception as err:
            _LOGGER.error("Failed to trigger update: %s", err)
