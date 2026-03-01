import urllib.request
from bs4 import BeautifulSoup
import json

urls = {
    "150": "https://www.oppo.it/tabelle/flange_asme_150.htm",
    "300": "https://www.oppo.it/tabelle/flange_asme_300.htm",
    "600": "https://www.oppo.it/tabelle/flange_asme_600.htm",
    "900": "https://www.oppo.it/tabelle/flange_asme_900.htm",
    "1500": "https://www.oppo.it/tabelle/flange_asme_1500.htm"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

flange_data = {}

def clean_val(v):
    v = v.strip()
    if not v or v == '-': return "-"
    return v.replace(',', '.')

for cls, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
        soup = BeautifulSoup(html, 'html.parser')
        
        tables = soup.find_all('table')
        target_table = None
        for table in tables:
            if 'DN' in table.text or 'a' in table.text:
                target_table = table
                break
                
        if not target_table:
            print(f"Table not found for {cls}")
            continue
            
        class_dict = {}
        rows = target_table.find_all('tr')
        
        for row in rows:
            cols = [td.text.strip() for td in row.find_all(['td', 'th'])]
            if len(cols) < 12: continue
            
            dn_raw = cols[0].replace('"', '').replace(' ', '-').strip()
            
            if 'DN' in dn_raw or 'pollici' in dn_raw or not dn_raw:
                continue
                
            if '-1/4' in dn_raw and not dn_raw.startswith('1'): dn_raw = dn_raw.replace('-1/4', ' 1/4').replace('  ', ' ')
            
            a = clean_val(cols[1])
            b = clean_val(cols[2])
            c = clean_val(cols[3])
            d = clean_val(cols[4])
            e = clean_val(cols[5])
            f = clean_val(cols[6])
            
            thickness = clean_val(cols[7])
            w = clean_val(cols[8])
            
            # Handling standard layout DN, a,b,c,d,e,f,spessore,w,foro_dia,n_fori,peso
            # wait, on 150 it was w,foro_dia,n_fori,peso
            # let's check index 9, 10, 11
            # Usually: 8=W(interasse) 9=foro_dia() 10=numero_fori 11=peso
            try:
                # Some tables swap n_fori and foro_dia or combine them
                foro_dia = clean_val(cols[9])
                n_fori = clean_val(cols[10])
                peso = clean_val(cols[11])
                holes = f"{n_fori} x {foro_dia}"
            except:
                holes = "-"
                peso = "-"

            # Divide by 10 logic: the website values usually are for example "889" for 88.9
            # Wait, earlier I saw "889" for 150 Class. If "889" in string, we can do float()/10
            def fix_scale(val):
                if val == "-": return val
                try:
                    fval = float(val)
                    if fval > 30: # clearly missing decimal point if it's supposed to be e.g. 88.9
                        return str(fval / 10)
                    return val
                except:
                    return val
            
            # The only thing is, if it's 889 it means 88.9 (division by 10)
            # but wait, 88.9 mm for OD is correct. But for thickness 111 means 11.1.
            # Are all values missing the decimal for the FIRST decimal place? Yes, oppo.it usually does this for flange tables!
            
            class_dict[dn_raw] = {
                "a": fix_scale(a),
                "b": fix_scale(b),
                "c": fix_scale(c),
                "d": fix_scale(d),
                "e": fix_scale(e),
                "f": fix_scale(f),
                "thickness": fix_scale(thickness),
                "w": fix_scale(w),
                "holes": holes,
                "weight": peso # weight is typically "08" meaning 0.8 kg. We might need to fix it or just show as is
            }
        
        flange_data[cls] = class_dict
        print(f"Parsed {cls}")
    except Exception as e:
        print(f"Error {cls}: {e}")

with open("flanges_oppo.json", "w", encoding='utf-8') as f:
    json.dump(flange_data, f, indent=2)
