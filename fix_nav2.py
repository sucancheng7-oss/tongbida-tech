import os
import glob
import re

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the nav block
    nav_match = re.search(r'(<nav class="site-nav[^>]*id="site-nav"[^>]*>.*?</nav>)', content, re.DOTALL)
    if not nav_match:
        return
        
    nav_html = nav_match.group(1)
    
    # Remove the nav
    new_content = content.replace(nav_html, '')
    
    # Find <header class="site-header"> or <header class="site-header page-header">
    header_pattern = r'(<header class="site-header[^>]*>)'
    header_match = re.search(header_pattern, new_content)
    
    if header_match:
        header_tag = header_match.group(1)
        # Place nav before header
        new_content = new_content.replace(header_tag, nav_html + '\n\n    ' + header_tag)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Fixed {filepath}")

for html_file in glob.glob("*.html"):
    fix_html(html_file)

