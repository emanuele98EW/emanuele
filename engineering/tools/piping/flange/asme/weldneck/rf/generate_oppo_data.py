import pandas as pd
import json

urls = {
    "150": "https://www.oppo.it/tabelle/flange_asme_150.htm",
    "300": "https://www.oppo.it/tabelle/flange_asme_300.htm",
    "600": "https://www.oppo.it/tabelle/flange_asme_600.htm",
    "900": "https://www.oppo.it/tabelle/flange_asme_900.htm",
    "1500": "https://www.oppo.it/tabelle/flange_asme_1500.htm"
}

flange_data = {}

def clean_val(v):
    if pd.isna(v) or str(v) == '-': return "-"
    raw = str(v).replace(',', '.')
    return raw

for cls, url in urls.items():
    try:
        # Read HTML tables. Note that pandas will parse 88,9 as 889 if we don't handle thousands/decimals
        # Actually it's better to force it to read as string to preserve formatting, or we fix it manually.
        dfs = pd.read_html(url, converters={c: str for c in range(20)}) 
        df = dfs[0]
        # Skip the first multi-header row
        df.columns = ["dn", "a", "b", "c", "d", "e", "f", "spessore", "w", "foro_dia", "n_fori", "peso"]
        df = df.iloc[2:].copy() # drop headers
        
        class_dict = {}
        for _, row in df.iterrows():
            dn_raw = str(row['dn']).replace('"', '').strip()
            if dn_raw == 'nan' or dn_raw == '-': continue
            
            # clean DN
            dn = dn_raw.replace(' ', '-').replace('--', '-')
            if dn == '1-1/4': pass
            
            if " 1/4" in dn_raw: dn = dn_raw.replace(" 1/4", "-1/4")
            if " 1/2" in dn_raw: dn = dn_raw.replace(" 1/2", "-1/2")
            if " 3/4" in dn_raw: dn = dn_raw.replace(" 3/4", "-3/4")
            
            # In the string converter it keeps "88,9", turning to "88.9"
            class_dict[dn_raw] = {
                "a": clean_val(row['a']),
                "b": clean_val(row['b']),
                "c": clean_val(row['c']),
                "d": clean_val(row['d']),
                "e": clean_val(row['e']),
                "f": clean_val(row['f']),
                "thickness": clean_val(row['spessore']),
                "w": clean_val(row['w']),
                "holes": f"{clean_val(row['n_fori'])} x {clean_val(row['foro_dia'])}",
                "weight": clean_val(row['peso'])
            }
        flange_data[cls] = class_dict
        print(f"Scraped {cls}")
    except Exception as e:
        print(f"Error for {cls}: {e}")

with open("data_ansis.json", "w") as f:
    json.dump(flange_data, f, indent=2)
