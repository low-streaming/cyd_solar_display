"""Constants for the CYD Solar Display integration."""

DOMAIN = "cyd_solar_display"

CONF_HOST = "host"
CONF_PORT = "port"
CONF_UPDATE_INTERVAL = "update_interval"

# Entity Config Keys
CONF_SOLAR_ENTITY = "solar_entity"
CONF_GRID_ENTITY = "grid_entity"
CONF_HOUSE_ENTITY = "house_entity"
CONF_BATTERY_ENTITY = "battery_entity"
CONF_BATTERY_SOC_ENTITY = "battery_soc_entity"

# Page 2 Entities
CONF_ENABLE_PAGE2 = "enable_page2"
CONF_YIELD_TODAY_ENTITY = "yield_today_entity"
CONF_GRID_IMPORT_ENTITY = "grid_import_entity"
CONF_GRID_EXPORT_ENTITY = "grid_export_entity"

# Meta
CONF_AUTO_PAGE_SWITCH = "auto_page_switch"
CONF_PAGE_INTERVAL = "page_interval"
CONF_THEME_COLOR = "theme_color"

DEFAULT_PORT = 80
DEFAULT_UPDATE_INTERVAL = 5
DEFAULT_PAGE_INTERVAL = 10
DEFAULT_THEME_COLOR = "#fdd835"  # Home Assistant Solar Yellow
