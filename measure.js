const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve('about.html'));
  
  const metrics = await page.evaluate(() => {
    const heroPanel = document.querySelector('.about-hero-panel');
    const nextSection = document.querySelector('main .section');
    const aboutLayout = document.querySelector('.about-layout');
    
    if (!heroPanel || !nextSection || !aboutLayout) return 'Missing elements';
    
    const hpRect = heroPanel.getBoundingClientRect();
    const nsRect = nextSection.getBoundingClientRect();
    const alRect = aboutLayout.getBoundingClientRect();
    
    // Check computed styles on header, section, etc.
    const aboutHero = document.querySelector('.about-hero');
    const header = document.querySelector('header');
    
    const ahStyles = window.getComputedStyle(aboutHero);
    const headerStyles = window.getComputedStyle(header);
    const nsStyles = window.getComputedStyle(nextSection);
    
    return {
      heroPanelBottom: hpRect.bottom,
      nextSectionTop: nsRect.top,
      aboutLayoutTop: alRect.top,
      gap: nsRect.top - hpRect.bottom,
      realGapToCards: alRect.top - hpRect.bottom,
      aboutHero: {
        marginBottom: ahStyles.marginBottom,
        paddingBottom: ahStyles.paddingBottom,
        gap: ahStyles.gap
      },
      header: {
        marginBottom: headerStyles.marginBottom,
        paddingBottom: headerStyles.paddingBottom
      },
      nextSection: {
        marginTop: nsStyles.marginTop,
        paddingTop: nsStyles.paddingTop
      }
    };
  });
  
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
