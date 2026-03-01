import os
import re

# Patch all note pages inside fluidodinamica subfolders
base = r"c:\Users\emanu\OneDrive\Desktop\Personale\sito_github - Copia\emanuele\engineering\appunti\fluidodinamica"

FONT_IMPORT = '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">'

# CSS additions to inject into existing <style> block
FONT_CSS = """
    /* Better readable font for notes */
    body, .notes-card p, .notes-card li, .legend, td, th, .mini-box p, .breadcrumb {
      font-family: 'Inter', system-ui, sans-serif;
    }
    /* Fix SVG dot-notation characters rendering */
    svg text {
      font-family: 'Inter', system-ui, sans-serif;
    }
"""

updated = 0
for root, dirs, files in os.walk(base):
    for file in files:
        if file == 'index.html' and root != base:
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            
            # Add font import after the last <link rel="stylesheet"> (before </head>)
            if 'fonts.googleapis.com/css2?family=Inter' not in content:
                content = content.replace(
                    '<script src="https://cdn.jsdelivr.net/npm/mathjax@3',
                    f'{FONT_IMPORT}\n  <script src="https://cdn.jsdelivr.net/npm/mathjax@3'
                )
            
            # Inject font CSS at the start of the <style> block
            if "Better readable font" not in content:
                content = content.replace('<style>', f'<style>{FONT_CSS}')
            
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated += 1

print(f"Updated {updated} note pages with Inter font.")
