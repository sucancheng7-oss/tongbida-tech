import os

files = ['index.html', 'products.html', 'help.html', 'faq.html', 'about.html']

for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_en_link = '<a href="#" class="lang-switch">English</a>'
    new_en_link = f'<a href="./{filename.replace(".html", "_en.html")}" class="lang-switch">English</a>'
    
    if old_en_link in content:
        content = content.replace(old_en_link, new_en_link)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Could not find exact string in {filename}")
