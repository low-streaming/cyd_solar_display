import logging
import json
import asyncio
from datetime import timedelta, datetime
import aiohttp

from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN

from .const import (
    DOMAIN,
    CONF_HOST,
    CONF_PORT,
    CONF_SOLAR_ENTITY,
    CONF_GRID_ENTITY,
    CONF_HOUSE_ENTITY,
    CONF_BATTERY_ENTITY,
    CONF_BATTERY_SOC_ENTITY,
    CONF_YIELD_TODAY_ENTITY,
    CONF_GRID_IMPORT_ENTITY,
    CONF_GRID_EXPORT_ENTITY,
    CONF_AUTO_PAGE_SWITCH,
    CONF_PAGE_INTERVAL
)

_LOGGER = logging.getLogger(__name__)

class CYDSolarCoordinator(DataUpdateCoordinator):
    """Coordinator to manage solar data and push to CYD."""

    def __init__(self, hass, entry):
        """Initialize."""
        self.entry = entry
        self.host = entry.data[CONF_HOST]
        self.port = entry.data.get(CONF_PORT, 80)
        self.current_page = 1
        self.last_page_switch = datetime.now()
        
        update_interval = entry.options.get("update_interval", 5)
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=update_interval),
        )

    async def _async_update_data(self):
        """Fetch data from entities and push to ESP32."""
        data = {}
        
        # Helper to get numeric state
        def get_value(entity_id):
            state = self.hass.states.get(entity_id)
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return None
            try:
                return round(float(state.state), 1)
            except (ValueError, TypeError):
                return None

        # Gather data
        payload = {
            "solar_w": get_value(self.entry.options.get(CONF_SOLAR_ENTITY)),
            "grid_w": get_value(self.entry.options.get(CONF_GRID_ENTITY)),
            "house_w": get_value(self.entry.options.get(CONF_HOUSE_ENTITY)),
            "battery_w": get_value(self.entry.options.get(CONF_BATTERY_ENTITY)),
            "battery_soc": get_value(self.entry.options.get(CONF_BATTERY_SOC_ENTITY)),
            "yield_today_kwh": get_value(self.entry.options.get(CONF_YIELD_TODAY_ENTITY)),
            "grid_import_kwh": get_value(self.entry.options.get(CONF_GRID_IMPORT_ENTITY)),
            "grid_export_kwh": get_value(self.entry.options.get(CONF_GRID_EXPORT_ENTITY)),
            "timestamp": datetime.now().isoformat(),
        }

        # Handle Page Switching
        auto_switch = self.entry.options.get("auto_page_switch", False)
        if auto_switch:
            interval = self.entry.options.get("page_interval", 10)
            if (datetime.now() - self.last_page_switch).total_seconds() >= interval:
                self.current_page = 2 if self.current_page == 1 else 1
                self.last_page_switch = datetime.now()
        
        # Data for Service Call
        service_data = {
            "solar": payload["solar_w"] or 0,
            "grid": payload["grid_w"] or 0,
            "house": payload["house_w"] or 0,
            "bat_w": payload["battery_w"] or 0,
            "bat_soc": payload["battery_soc"] or 0,
            "yield": payload["yield_today_kwh"] or 0,
            "grid_in": payload["grid_import_kwh"] or 0,
            "grid_out": payload["grid_export_kwh"] or 0,
            "page_num": self.current_page,
        }
        
        # Call the ESPHome Service
        # We assume the device name is 'cyd_solar_display' as per YAML
        try:
            await self.hass.services.async_call(
                "esphome", 
                "cyd_solar_display_update_display", 
                service_data
            )
        except Exception as err:
            _LOGGER.debug("Could not call ESPHome service: %s", err)

        return payload
