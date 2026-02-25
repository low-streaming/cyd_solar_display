import logging
import os
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components import frontend, panel_custom
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN
from .coordinator import CYDSolarCoordinator

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up CYD Solar Display from a config entry."""
    
    coordinator = CYDSolarCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Register the preview component
    # Using the modern async method for registering static paths
    preview_url = f"/cyd_solar_display/{entry.entry_id}"
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            preview_url,
            hass.config.path(f"custom_components/{DOMAIN}/www"),
            False
        )
    ])
    
    # This makes the JS available for the entire UI, needed for our custom selector/preview
    js_url = f"{preview_url}/cyd-preview.js"
    add_extra_js_url(hass, js_url)

    # Register the Sidebar Panel
    # Note: 'cyd-preview' is the custom element name defined in the JS file
    if DOMAIN not in hass.data.get("frontend_panels", {}):
        try:
            await panel_custom.async_register_panel(
                hass,
                frontend_url_path=DOMAIN,
                webcomponent_name="cyd-preview",
                module_url=js_url,
                sidebar_title="CYD Monitor",
                sidebar_icon="mdi:monitor-dashboard",
                require_admin=True
            )
        except Exception as err:
            _LOGGER.error("Could not register panel: %s", err)

    entry.async_on_unload(entry.add_update_listener(update_listener))

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Remove the registered panel from the frontend on unload
    frontend.async_remove_panel(hass, DOMAIN)

    unload_ok = True
    hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok

async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)
