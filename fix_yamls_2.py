import re

with open('cyd_solar_display.yaml', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the api service lambda:
# The compiler says expected ')' before 'void' which is most likely because the lambda is never closed.
# In ESPHome YAML, the lambda ends where indentation ends.
# But sometimes the parser gets confused if blocks are merged incorrectly.

# I will rewrite the api section and the ota section to be clean.
api_block_old = r'    - service: update_display[\s\S]*?id\(evaluate_dimming\)\.execute\(\);'
api_block_new = """    - service: update_display
      variables:
        solar: float
        grid: float
        house: float
        bat_w: float
        bat_soc: float
        val_yield: float
        val_yield_month: float
        val_yield_year: float
        val_yield_total: float
        grid_in: float
        grid_out: float
        page_num: int
        page_idx: int
        page_total: int
        c1_n: string
        c1_v: string
        c2_n: string
        c2_v: string
        c3_n: string
        c3_v: string
        c4_n: string
        c4_v: string
        c5_n: string
        c5_v: string
        c6_n: string
        c6_v: string
        c7_n: string
        c7_v: string
        c8_n: string
        c8_v: string
        show_kw: bool
        c9_n: string
        c9_v: string
        c10_n: string
        c10_v: string
        c11_n: string
        c11_v: string
        c12_n: string
        c12_v: string
        c13_n: string
        c13_v: string
        c14_n: string
        c14_v: string
        c15_n: string
        c15_v: string
        c16_n: string
        c16_v: string
        c17_n: string
        c17_v: string
        c18_n: string
        c18_v: string
        c19_n: string
        c19_v: string
        c20_n: string
        c20_v: string
        c21_n: string
        c21_v: string
        c22_n: string
        c22_v: string
        c23_n: string
        c23_v: string
        c24_n: string
        c24_v: string
        c25_n: string
        c25_v: string
        c26_n: string
        c26_v: string
        c27_n: string
        c27_v: string
        c28_n: string
        c28_v: string
        dim_start: int
        dim_end: int
        dim_brt: float
        p1_en: bool
        p2_en: bool
        p3_en: bool
        p4_en: bool
        p5_en: bool
        p6_en: bool
        p7_en: bool
        p8_en: bool
        p9_en: bool
        auto_rotate: bool
      then:
        - lambda: |-
            id(solar_w).publish_state(solar);
            id(grid_w).publish_state(grid);
            id(house_w).publish_state(house);
            id(battery_w).publish_state(bat_w);
            id(battery_soc).publish_state(bat_soc);
            id(yield_today).publish_state(val_yield);
            id(yield_month).publish_state(val_yield_month);
            id(yield_year).publish_state(val_yield_year);
            id(yield_total).publish_state(val_yield_total);
            id(grid_import).publish_state(grid_in);
            id(grid_export).publish_state(grid_out);
            
            if (id(ha_page_sync_switch).state) {
              id(current_page).publish_state(page_num);
              id(page_display_idx).publish_state(page_idx);
            }
            id(page_display_total).publish_state(page_total);
            id(custom1_n).publish_state(c1_n);
            id(custom1_v).publish_state(c1_v);
            id(custom2_n).publish_state(c2_n);
            id(custom2_v).publish_state(c2_v);
            id(custom3_n).publish_state(c3_n);
            id(custom3_v).publish_state(c3_v);
            id(custom4_n).publish_state(c4_n);
            id(custom4_v).publish_state(c4_v);
            id(custom5_n).publish_state(c5_n);
            id(custom5_v).publish_state(c5_v);
            id(custom6_n).publish_state(c6_n);
            id(custom6_v).publish_state(c6_v);
            id(custom7_n).publish_state(c7_n);
            id(custom7_v).publish_state(c7_v);
            id(custom8_n).publish_state(c8_n);
            id(custom8_v).publish_state(c8_v);
            id(show_kw_switch).publish_state(show_kw);
            id(custom9_n).publish_state(c9_n);
            id(custom9_v).publish_state(c9_v);
            id(custom10_n).publish_state(c10_n);
            id(custom10_v).publish_state(c10_v);
            id(custom11_n).publish_state(c11_n);
            id(custom11_v).publish_state(c11_v);
            id(custom12_n).publish_state(c12_n);
            id(custom12_v).publish_state(c12_v);
            id(custom13_n).publish_state(c13_n);
            id(custom13_v).publish_state(c13_v);
            id(custom14_n).publish_state(c14_n);
            id(custom14_v).publish_state(c14_v);
            id(custom15_n).publish_state(c15_n);
            id(custom15_v).publish_state(c15_v);
            id(custom16_n).publish_state(c16_n);
            id(custom16_v).publish_state(c16_v);
            id(custom17_n).publish_state(c17_n);
            id(custom17_v).publish_state(c17_v);
            id(custom18_n).publish_state(c18_n);
            id(custom18_v).publish_state(c18_v);
            id(custom19_n).publish_state(c19_n);
            id(custom19_v).publish_state(c19_v);
            id(custom20_n).publish_state(c20_n);
            id(custom20_v).publish_state(c20_v);
            id(custom21_n).publish_state(c21_n);
            id(custom21_v).publish_state(c21_v);
            id(custom22_n).publish_state(c22_n);
            id(custom22_v).publish_state(c22_v);
            id(custom23_n).publish_state(c23_n);
            id(custom23_v).publish_state(c23_v);
            id(custom24_n).publish_state(c24_n);
            id(custom24_v).publish_state(c24_v);
            id(custom25_n).publish_state(c25_n);
            id(custom25_v).publish_state(c25_v);
            id(custom26_n).publish_state(c26_n);
            id(custom26_v).publish_state(c26_v);
            id(custom27_n).publish_state(c27_n);
            id(custom27_v).publish_state(c27_v);
            id(custom28_n).publish_state(c28_n);
            id(custom28_v).publish_state(c28_v);
            
            id(page1_enabled) = p1_en;
            id(page2_enabled) = p2_en;
            id(page3_enabled) = p3_en;
            id(page4_enabled) = p4_en;
            id(page5_enabled) = p5_en;
            id(page6_enabled) = p6_en;
            id(page7_enabled) = p7_en;
            id(page8_enabled) = p8_en;
            id(page9_enabled) = p9_en;
            id(auto_switch_enabled) = auto_rotate;
            
            id(dim_start_time) = dim_start;
            id(dim_end_time) = dim_end;
            id(dim_brightness) = dim_brt;
            id(evaluate_dimming).execute();"""

new_content = re.sub(api_block_old, api_block_new, content)

with open('cyd_solar_display.yaml', 'w', encoding='utf-8') as f:
    f.write(new_content)
