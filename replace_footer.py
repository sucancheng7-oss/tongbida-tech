import glob
import re

new_footer = """    <footer class="site-footer simple-footer">
      <div class="simple-footer-content">
        <div class="simple-footer-links">
          <a href="./about.html#contact">联系我们</a>
          <span class="separator">|</span>
          <a href="#">服务条款</a>
          <span class="separator">|</span>
          <a href="#">隐私政策</a>
          <span class="separator">|</span>
          <a href="#">可接受使用政策</a>
        </div>
        <div class="simple-footer-copyright">
          <p>Copyright © 2012-2026 Tongbida Technology. All Rights Reserved.</p>
        </div>
      </div>
    </footer>"""

for filepath in glob.glob('*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use regex to find <footer class="site-footer">...</footer> and replace it
    content = re.sub(r'<footer class="site-footer">.*?</footer>', new_footer, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footers replaced.")
