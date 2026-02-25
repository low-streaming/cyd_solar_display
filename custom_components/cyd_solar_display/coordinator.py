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
    CONF_YIELD_MONTH_ENTITY,
    CONF_YIELD_YEAR_ENTITY,
    CONF_YIELD_TOTAL_ENTITY,
    CONF_GRID_IMPORT_ENTITY,
    CONF_GRID_EXPORT_ENTITY,
    CONF_CUSTOM1_NAME,
    CONF_CUSTOM1_ENTITY,
    CONF_CUSTOM2_NAME,
    CONF_CUSTOM2_ENTITY,
    CONF_CUSTOM3_NAME,
    CONF_CUSTOM3_ENTITY,
    CONF_CUSTOM4_NAME,
    CONF_CUSTOM4_ENTITY,
    CONF_CUSTOM5_NAME,
    CONF_CUSTOM5_ENTITY,
    CONF_CUSTOM6_NAME,
    CONF_CUSTOM6_ENTITY,
    CONF_CUSTOM7_NAME,
    CONF_CUSTOM7_ENTITY,
    CONF_CUSTOM8_NAME,
    CONF_CUSTOM8_ENTITY,
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
            update_interval=timedelta(seconds=int(entry.options.get("update_interval", 5))),
        )

    async def _async_update_data(self):
        """Fetch data from entities and push to ESP32."""
        data = {}
        
        def get_value(entity_id):
            if not entity_id:
                return None
            state = self.hass.states.get(entity_id)
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return None
            try:
                return round(float(state.state), 1)
            except (ValueError, TypeError):
                return None

        def get_custom_val(entity_id):
            if not entity_id:
                return ""
            state = self.hass.states.get(entity_id)
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return "--"
            val = state.state
            unit = state.attributes.get("unit_of_measurement", "")
            return f"{val} {unit}".strip()

        # Gather data
        payload = {
            "solar_w": get_value(self.entry.options.get(CONF_SOLAR_ENTITY)),
            "grid_w": get_value(self.entry.options.get(CONF_GRID_ENTITY)),
            "house_w": get_value(self.entry.options.get(CONF_HOUSE_ENTITY)),
            "battery_w": get_value(self.entry.options.get(CONF_BATTERY_ENTITY)),
            "battery_soc": get_value(self.entry.options.get(CONF_BATTERY_SOC_ENTITY)),
            "yield_today_kwh": get_value(self.entry.options.get(CONF_YIELD_TODAY_ENTITY)),
            "yield_month_kwh": get_value(self.entry.options.get(CONF_YIELD_MONTH_ENTITY)),
            "yield_year_kwh": get_value(self.entry.options.get(CONF_YIELD_YEAR_ENTITY)),
            "yield_total_kwh": get_value(self.entry.options.get(CONF_YIELD_TOTAL_ENTITY)),
            "grid_import_kwh": get_value(self.entry.options.get(CONF_GRID_IMPORT_ENTITY)),
            "grid_export_kwh": get_value(self.entry.options.get(CONF_GRID_EXPORT_ENTITY)),
            "timestamp": datetime.now().isoformat(),
            
            "c1_n": self.entry.options.get(CONF_CUSTOM1_NAME, "Custom 1"),
            "c1_v": get_custom_val(self.entry.options.get(CONF_CUSTOM1_ENTITY)),
            "c2_n": self.entry.options.get(CONF_CUSTOM2_NAME, "Custom 2"),
            "c2_v": get_custom_val(self.entry.options.get(CONF_CUSTOM2_ENTITY)),
            "c3_n": self.entry.options.get(CONF_CUSTOM3_NAME, "Custom 3"),
            "c3_v": get_custom_val(self.entry.options.get(CONF_CUSTOM3_ENTITY)),
            "c4_n": self.entry.options.get(CONF_CUSTOM4_NAME, "Custom 4"),
            "c4_v": get_custom_val(self.entry.options.get(CONF_CUSTOM4_ENTITY)),
            
            "c5_n": self.entry.options.get(CONF_CUSTOM5_NAME, "Custom 5"),
            "c5_v": get_custom_val(self.entry.options.get(CONF_CUSTOM5_ENTITY)),
            "c6_n": self.entry.options.get(CONF_CUSTOM6_NAME, "Custom 6"),
            "c6_v": get_custom_val(self.entry.options.get(CONF_CUSTOM6_ENTITY)),
            "c7_n": self.entry.options.get(CONF_CUSTOM7_NAME, "Custom 7"),
            "c7_v": get_custom_val(self.entry.options.get(CONF_CUSTOM7_ENTITY)),
            "c8_n": self.entry.options.get(CONF_CUSTOM8_NAME, "Custom 8"),
            "c8_v": get_custom_val(self.entry.options.get(CONF_CUSTOM8_ENTITY)),
        }

        # Handle Page Switching
        auto_switch = self.entry.options.get("auto_page_switch", False)
        # We now have up to 4 pages
        max_page = 4
        if auto_switch:
            try:
                interval = int(self.entry.options.get("page_interval", 10))
            except (ValueError, TypeError):
                interval = 10
            
            if (datetime.now() - self.last_page_switch).total_seconds() >= interval:
                self.current_page = self.current_page + 1
                if self.current_page > max_page:
                    self.current_page = 1
                self.last_page_switch = datetime.now()
        
        # Data for Service Call
        service_data = {
            "solar": float(payload["solar_w"] or 0.0),
            "grid": float(payload["grid_w"] or 0.0),
            "house": float(payload["house_w"] or 0.0),
            "bat_w": float(payload["battery_w"] or 0.0),
            "bat_soc": float(payload["battery_soc"] or 0.0),
            "val_yield": float(payload["yield_today_kwh"] or 0.0),
            "val_yield_month": float(payload["yield_month_kwh"] or 0.0),
            "val_yield_year": float(payload["yield_year_kwh"] or 0.0),
            "val_yield_total": float(payload["yield_total_kwh"] or 0.0),
            "grid_in": float(payload["grid_import_kwh"] or 0.0),
            "grid_out": float(payload["grid_export_kwh"] or 0.0),
            "page_num": int(self.current_page),
            "c1_n": str(payload["c1_n"] or " "),
            "c1_v": str(payload["c1_v"] or " "),
            "c2_n": str(payload["c2_n"] or " "),
            "c2_v": str(payload["c2_v"] or " "),
            "c3_n": str(payload["c3_n"] or " "),
            "c3_v": str(payload["c3_v"] or " "),
            "c4_n": str(payload["c4_n"] or " "),
            "c4_v": str(payload["c4_v"] or " "),
            "c5_n": str(payload["c5_n"] or " "),
            "c5_v": str(payload["c5_v"] or " "),
            "c6_n": str(payload["c6_n"] or " "),
            "c6_v": str(payload["c6_v"] or " "),
            "c7_n": str(payload["c7_n"] or " "),
            "c7_v": str(payload["c7_v"] or " "),
            "c8_n": str(payload["c8_n"] or " "),
            "c8_v": str(payload["c8_v"] or " "),
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
            _LOGGER.error("Could not call ESPHome service '%s': %s", "cyd_solar_display_update_display", err)

        return payload
