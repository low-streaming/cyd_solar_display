import logging
import os
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components import frontend, panel_custom
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig, HomeAssistantView
from aiohttp import web

from .const import DOMAIN
from .coordinator import CYDSolarCoordinator

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up CYD Solar Display from a config entry."""
    
    coordinator = CYDSolarCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Register API View for Panel Config
    if "api_registered" not in hass.data[DOMAIN]:
        hass.http.register_view(CYDConfigView(hass))
        hass.data[DOMAIN]["api_registered"] = True

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
                require_admin=True,
                config={"entry_id": entry.entry_id}
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

class CYDConfigView(HomeAssistantView):
    """API Endpoint context for panel configuration."""
    url = "/api/cyd_solar_display/config/{entry_id}"
    name = "api:cyd_solar_display:config"
    requires_auth = True

    def __init__(self, hass: HomeAssistant):
        self.hass = hass

    async def get(self, request: web.Request, entry_id: str) -> web.Response:
        """Get current options."""
        entry = self.hass.config_entries.async_get_entry(entry_id)
        if not entry:
            return self.json_message("Entry not found", 404)
        return self.json({"options": dict(entry.options)})

    async def post(self, request: web.Request, entry_id: str) -> web.Response:
        """Update options."""
        data = await request.json()
        entry = self.hass.config_entries.async_get_entry(entry_id)
        if not entry:
            return self.json_message("Entry not found", 404)
        
        new_options = dict(entry.options)
        new_options.update(data)
        
        self.hass.config_entries.async_update_entry(entry, options=new_options)
        return self.json({"status": "ok"})
