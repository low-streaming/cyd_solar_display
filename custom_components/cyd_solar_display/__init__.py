import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components import frontend, panel_custom
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

    # Register API View for Panel Config (only once)
    if "api_registered" not in hass.data[DOMAIN]:
        hass.http.register_view(CYDConfigView(hass))
        hass.data[DOMAIN]["api_registered"] = True

    # Register static files with a FIXED path (no entry_id!)
    # entry_id would change across restarts, breaking the panel URL
    static_url = "/cyd_solar_display/static"
    if "static_registered" not in hass.data[DOMAIN]:
        await hass.http.async_register_static_paths([
            StaticPathConfig(
                static_url,
                hass.config.path(f"custom_components/{DOMAIN}/www"),
                False   # cache=False so updates are visible immediately
            )
        ])
        hass.data[DOMAIN]["static_registered"] = True

    # Stable JS URL (no entry_id dependency)
    js_url = f"{static_url}/cyd-preview.js"

    # Register the Sidebar Panel (only once, guard by checking frontend_panels)
    frontend_panels = hass.data.get("frontend_panels", {})
    if DOMAIN not in frontend_panels:
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
            _LOGGER.warning("Panel already registered or error: %s", err)

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
    # If the update only contains the last_page sync info, don't reload
    # We use a simple comparison of other options if needed, but for now 
    # we just accept that page-syncs might trigger a reload OR we could 
    # use a flag.
    
    # Check if anything OTHER than last_page or _last_sync changed
    old_options = hass.data.get(f"{DOMAIN}_old_options_{entry.entry_id}", {})
    new_options = dict(entry.options)
    
    significant_change = False
    for k, v in new_options.items():
        if k in ["last_page", "_last_sync"]:
            continue
        if old_options.get(k) != v:
            significant_change = True
            break
            
    hass.data[f"{DOMAIN}_old_options_{entry.entry_id}"] = new_options
    
    if significant_change:
        _LOGGER.debug("Significant config change detected, reloading...")
        await hass.config_entries.async_reload(entry.entry_id)
    else:
        _LOGGER.debug("Internal page sync update, skipping reload.")

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
        
        coordinator = self.hass.data[DOMAIN].get(entry_id)
        latest_version = coordinator.latest_version if coordinator else "0.0.0"
        
        return self.json({
            "options": dict(entry.options),
            "latest_version": latest_version
        })

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
