import re

with open('cyd_solar_display.yaml', 'r', encoding='utf-8') as f:
    content = f.read()

# Fixes:
content = content.replace('response.get_body()', 'body')
content = content.replace("md5_url: ''", "md5_url: ${md5_url}")
content = content.replace('md5_url: ""', 'md5_url: ${md5_url}')

with open('cyd_solar_display.yaml', 'w', encoding='utf-8') as f:
    f.write(content)
