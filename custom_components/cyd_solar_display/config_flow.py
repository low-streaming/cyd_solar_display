from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector
import voluptuous as vol

from .const import (
    DOMAIN,
    CONF_HOST,
    CONF_PORT,
    DEFAULT_PORT,
    CONF_SOLAR_ENTITY,
    CONF_GRID_ENTITY,
    CONF_HOUSE_ENTITY,
    CONF_BATTERY_ENTITY,
    CONF_BATTERY_SOC_ENTITY,
    CONF_YIELD_TODAY_ENTITY,
    CONF_GRID_IMPORT_ENTITY,
    CONF_GRID_EXPORT_ENTITY,
    CONF_AUTO_PAGE_SWITCH,
    CONF_PAGE_INTERVAL,
)

class CYDSolarConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for CYD Solar Display."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            # Basic validation
            if not user_input[CONF_HOST]:
                errors["base"] = "invalid_host"
            else:
                return self.async_create_entry(title=f"CYD Solar ({user_input[CONF_HOST]})", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_HOST): str,
                vol.Optional(CONF_PORT, default=DEFAULT_PORT): int,
            }),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return CYDSolarOptionsFlow(config_entry)


class CYDSolarOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Entity selection schema
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                # Core Entities
                vol.Optional(CONF_SOLAR_ENTITY, default=self.config_entry.options.get(CONF_SOLAR_ENTITY)): selector.EntitySelector(),
                vol.Optional(CONF_GRID_ENTITY, default=self.config_entry.options.get(CONF_GRID_ENTITY)): selector.EntitySelector(),
                vol.Optional(CONF_HOUSE_ENTITY, default=self.config_entry.options.get(CONF_HOUSE_ENTITY)): selector.EntitySelector(),
                vol.Optional(CONF_BATTERY_ENTITY, default=self.config_entry.options.get(CONF_BATTERY_ENTITY)): selector.EntitySelector(),
                vol.Optional(CONF_BATTERY_SOC_ENTITY, default=self.config_entry.options.get(CONF_BATTERY_SOC_ENTITY)): selector.EntitySelector(),
                
                # Page 2
                vol.Optional(CONF_YIELD_TODAY_ENTITY, default=self.config_entry.options.get(CONF_YIELD_TODAY_ENTITY)): selector.EntitySelector(),
                vol.Optional(CONF_GRID_IMPORT_ENTITY, default=self.config_entry.options.get(CONF_GRID_IMPORT_ENTITY)): selector.EntitySelector(),
                vol.Optional(CONF_GRID_EXPORT_ENTITY, default=self.config_entry.options.get(CONF_GRID_EXPORT_ENTITY)): selector.EntitySelector(),
                
                # Settings
                vol.Optional("update_interval", default=self.config_entry.options.get("update_interval", 5)): int,
                vol.Optional(CONF_AUTO_PAGE_SWITCH, default=self.config_entry.options.get(CONF_AUTO_PAGE_SWITCH, False)): bool,
                vol.Optional(CONF_PAGE_INTERVAL, default=self.config_entry.options.get(CONF_PAGE_INTERVAL, 10)): int,
            })
        )
