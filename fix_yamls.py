import re

with open('cyd_solar_display.yaml', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the missing brace at custom28
content = content.replace(
    'it.filled_rectangle(165, 132, 4, 80, id(color_grid_in));\n      } else if (page == 10) {',
    'it.filled_rectangle(165, 132, 4, 80, id(color_grid_in));\n          it.print(177, 140, id(font_label), id(color_grid_in), TextAlign::TOP_LEFT, id(custom28_n).state.c_str());\n          print_val(237, 172, "%s", id(custom28_v).state.c_str());\n        }\n      } else if (page == 10) {'
)

# Fix response.get_body() to body
content = content.replace('std::string latest = response.get_body();', 'std::string latest = body;')

with open('cyd_solar_display.yaml', 'w', encoding='utf-8') as f:
    f.write(content)
