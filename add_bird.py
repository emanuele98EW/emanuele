import os
import re

base_dir = r"c:\Users\emanu\OneDrive\Desktop\Personale\sito_github - Copia\emanuele\engineering"
project_root = r"c:\Users\emanu\OneDrive\Desktop\Personale\sito_github - Copia\emanuele"

html_files = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

updated = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    rel_dir = os.path.relpath(project_root, os.path.dirname(file))
    prefix = "" if rel_dir == '.' else rel_dir.replace('\\', '/') + '/'
    
    video_src = prefix + "assets/Cute%20Bird%20Flapping%20Animation.webm"
    
    # We want to match:
    # <a href="<any_prefix>engineering/index.html" class="menu-toggle">
    #   Ingegneria
    
    # The negative lookahead (?!\s*style="display:\s*flex) ensures we don't accidentally add the bird twice if the script is run multiple times.
    pattern = r'(<a\s+href="[^"]*engineering/index\.html"\s+class="menu-toggle")(?!\s*style="display:\s*flex)(>|\s*style="[^"]*">)(\s*?)Ingegneria'
    
    replacement = rf'\1 style="display: flex; align-items: center; gap: 8px;">\g<3><video autoplay loop muted playsinline style="width: 35px; height: 35px; background: transparent; pointer-events: none;">\g<3>  <source src="{video_src}" type="video/webm">\g<3></video>\g<3>Ingegneria'
    
    content, count = re.subn(pattern, replacement, content)
    
    if count > 0 and content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        updated += 1

print(f"Added bird to {updated} engineering files.")
