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
    CONF_ENABLE_PAGE1,
    CONF_ENABLE_PAGE2,
    CONF_YIELD_TODAY_ENTITY,
    CONF_YIELD_MONTH_ENTITY,
    CONF_YIELD_YEAR_ENTITY,
    CONF_YIELD_TOTAL_ENTITY,
    CONF_GRID_IMPORT_ENTITY,
    CONF_GRID_EXPORT_ENTITY,
    CONF_ENABLE_PAGE3,
    CONF_CUSTOM1_NAME,
    CONF_CUSTOM1_ENTITY,
    CONF_CUSTOM2_NAME,
    CONF_CUSTOM2_ENTITY,
    CONF_CUSTOM3_NAME,
    CONF_CUSTOM3_ENTITY,
    CONF_CUSTOM4_NAME,
    CONF_CUSTOM4_ENTITY,
    CONF_ENABLE_PAGE4,
    CONF_CUSTOM5_NAME,
    CONF_CUSTOM5_ENTITY,
    CONF_CUSTOM6_NAME,
    CONF_CUSTOM6_ENTITY,
    CONF_CUSTOM7_NAME,
    CONF_CUSTOM7_ENTITY,
    CONF_CUSTOM7_ENTITY,
    CONF_CUSTOM8_NAME,
    CONF_CUSTOM8_ENTITY,
    CONF_ENABLE_PAGE5,
    CONF_MINING1_NAME,
    CONF_MINING1_ENTITY,
    CONF_MINING2_NAME,
    CONF_MINING2_ENTITY,
    CONF_MINING3_NAME,
    CONF_MINING3_ENTITY,
    CONF_MINING4_NAME,
    CONF_MINING4_ENTITY,
    CONF_SHOW_KW,
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

    def __init__(self, config_entry) -> None:
        """Initialize options flow."""
        pass

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Entity selection schema
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                # Core Entities
                vol.Optional(CONF_ENABLE_PAGE1, default=self.config_entry.options.get(CONF_ENABLE_PAGE1, True)): bool,
                vol.Optional(CONF_SOLAR_ENTITY, default=self.config_entry.options.get(CONF_SOLAR_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_GRID_ENTITY, default=self.config_entry.options.get(CONF_GRID_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_HOUSE_ENTITY, default=self.config_entry.options.get(CONF_HOUSE_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_BATTERY_ENTITY, default=self.config_entry.options.get(CONF_BATTERY_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_BATTERY_SOC_ENTITY, default=self.config_entry.options.get(CONF_BATTERY_SOC_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                
                # Page 2
                vol.Optional(CONF_ENABLE_PAGE2, default=self.config_entry.options.get(CONF_ENABLE_PAGE2, True)): bool,
                vol.Optional(CONF_YIELD_TODAY_ENTITY, default=self.config_entry.options.get(CONF_YIELD_TODAY_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_YIELD_MONTH_ENTITY, default=self.config_entry.options.get(CONF_YIELD_MONTH_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_YIELD_YEAR_ENTITY, default=self.config_entry.options.get(CONF_YIELD_YEAR_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_YIELD_TOTAL_ENTITY, default=self.config_entry.options.get(CONF_YIELD_TOTAL_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_GRID_IMPORT_ENTITY, default=self.config_entry.options.get(CONF_GRID_IMPORT_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_GRID_EXPORT_ENTITY, default=self.config_entry.options.get(CONF_GRID_EXPORT_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                
                # Page 3 (Custom Sensors)
                vol.Optional(CONF_ENABLE_PAGE3, default=self.config_entry.options.get(CONF_ENABLE_PAGE3, True)): bool,
                vol.Optional(CONF_CUSTOM1_NAME, default=self.config_entry.options.get(CONF_CUSTOM1_NAME, "Custom 1")): str,
                vol.Optional(CONF_CUSTOM1_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM1_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_CUSTOM2_NAME, default=self.config_entry.options.get(CONF_CUSTOM2_NAME, "Custom 2")): str,
                vol.Optional(CONF_CUSTOM2_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM2_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_CUSTOM3_NAME, default=self.config_entry.options.get(CONF_CUSTOM3_NAME, "Custom 3")): str,
                vol.Optional(CONF_CUSTOM3_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM3_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_CUSTOM4_NAME, default=self.config_entry.options.get(CONF_CUSTOM4_NAME, "Custom 4")): str,
                vol.Optional(CONF_CUSTOM4_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM4_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                
                # Page 4 (More Custom Sensors)
                vol.Optional(CONF_ENABLE_PAGE4, default=self.config_entry.options.get(CONF_ENABLE_PAGE4, True)): bool,
                vol.Optional(CONF_CUSTOM5_NAME, default=self.config_entry.options.get(CONF_CUSTOM5_NAME, "Custom 5")): str,
                vol.Optional(CONF_CUSTOM5_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM5_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_CUSTOM6_NAME, default=self.config_entry.options.get(CONF_CUSTOM6_NAME, "Custom 6")): str,
                vol.Optional(CONF_CUSTOM6_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM6_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_CUSTOM7_NAME, default=self.config_entry.options.get(CONF_CUSTOM7_NAME, "Custom 7")): str,
                vol.Optional(CONF_CUSTOM7_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM7_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_CUSTOM8_NAME, default=self.config_entry.options.get(CONF_CUSTOM8_NAME, "Custom 8")): str,
                vol.Optional(CONF_CUSTOM8_ENTITY, default=self.config_entry.options.get(CONF_CUSTOM8_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                
                # Page 5 (Mining Sensors)
                vol.Optional(CONF_ENABLE_PAGE5, default=self.config_entry.options.get(CONF_ENABLE_PAGE5, True)): bool,
                vol.Optional(CONF_MINING1_NAME, default=self.config_entry.options.get(CONF_MINING1_NAME, "Mining 1")): str,
                vol.Optional(CONF_MINING1_ENTITY, default=self.config_entry.options.get(CONF_MINING1_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_MINING2_NAME, default=self.config_entry.options.get(CONF_MINING2_NAME, "Mining 2")): str,
                vol.Optional(CONF_MINING2_ENTITY, default=self.config_entry.options.get(CONF_MINING2_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_MINING3_NAME, default=self.config_entry.options.get(CONF_MINING3_NAME, "Mining 3")): str,
                vol.Optional(CONF_MINING3_ENTITY, default=self.config_entry.options.get(CONF_MINING3_ENTITY)): selector.EntitySelector({"domain": "sensor"}),
                vol.Optional(CONF_MINING4_NAME, default=self.config_entry.options.get(CONF_MINING4_NAME, "Mining 4")): str,
                vol.Optional(CONF_MINING4_ENTITY, default=self.config_entry.options.get(CONF_MINING4_ENTITY)): selector.EntitySelector({"domain": "sensor"}),

                # Settings
                vol.Optional(CONF_SHOW_KW, default=self.config_entry.options.get(CONF_SHOW_KW, False)): bool,
                vol.Optional("update_interval", default=self.config_entry.options.get("update_interval", 5)): int,
                vol.Optional(CONF_PAGE_INTERVAL, default=self.config_entry.options.get(CONF_PAGE_INTERVAL, 10)): int,
            })
        )
