import os
import glob
import re

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the nav block
    # It looks like:
    # <nav class="site-nav reveal reveal-down" id="site-nav">
    # ...
    # </nav>
    # And it's inside <header class="site-header...">
    
    nav_match = re.search(r'(<nav class="site-nav[^>]*id="site-nav"[^>]*>.*?</nav>)', content, re.DOTALL)
    if not nav_match:
        return
        
    nav_html = nav_match.group(1)
    
    # Remove the nav from inside the header
    new_content = content.replace(nav_html, '')
    
    # Insert it right after <div class="site-shell">...</div>
    # The shell block ends with </div> and then some newlines, then <header
    shell_pattern = r'(<div class="site-shell">.*?</div>)'
    shell_match = re.search(shell_pattern, new_content, re.DOTALL)
    
    if shell_match:
        shell_html = shell_match.group(1)
        # We replace the shell with shell + \n + nav
        new_content = new_content.replace(shell_html, shell_html + '\n\n    ' + nav_html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Fixed {filepath}")

for html_file in glob.glob("*.html"):
    fix_html(html_file)

