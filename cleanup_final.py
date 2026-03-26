import re

with open('cyd_solar_display.yaml', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the duplicated perform_cloud_update script
content = re.sub(r'  - id: perform_cloud_update\n    then:\n      - lambda: \'id\(update_in_progress\) = true;\'\n      - ota.http_request.flash:\n          url: \${firmware_url}\n          md5_url: \${md5_url}\n      - lambda: \'id\(update_in_progress\) = false;\'\n      - lambda: \'id\(update_in_progress\) = true;\'\n      - ota.http_request.flash:\n          url: \${firmware_url}\n          md5_url: \${md5_url}\n      - lambda: \'id\(update_in_progress\) = false;\'', 
                 r"  - id: perform_cloud_update\n    then:\n      - lambda: 'id(update_in_progress) = true;'\n      - ota.http_request.flash:\n          url: ${firmware_url}\n          md5_url: ${md5_url}\n      - lambda: 'id(update_in_progress) = false;'", 
                 content)

# Ensure no orphan braces from previous edits
# (I'll just trust that the multi_replace_file_content was clean enough)

with open('cyd_solar_display.yaml', 'w', encoding='utf-8') as f:
    f.write(content)
