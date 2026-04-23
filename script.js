const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = document.querySelectorAll(".reveal");
if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const tiltCards = document.querySelectorAll(".tilt-card");
tiltCards.forEach((card) => {
  if (prefersReducedMotion) {
    return;
  }

  let bounds;
  let ticking = false;
  let mouseX = 0;
  let mouseY = 0;

  card.addEventListener("pointerenter", () => {
    bounds = card.getBoundingClientRect();
  });

  card.addEventListener("pointermove", (event) => {
    if (!bounds) bounds = card.getBoundingClientRect();
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const offsetX = mouseX - bounds.left;
        const offsetY = mouseY - bounds.top;
        const rotateY = ((offsetX / bounds.width) - 0.5) * 8;
        const rotateX = (0.5 - (offsetY / bounds.height)) * 8;

        card.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--pointer-x", `${((offsetX / bounds.width) * 100).toFixed(2)}%`);
        card.style.setProperty("--pointer-y", `${((offsetY / bounds.height) * 100).toFixed(2)}%`);
        ticking = false;
      });
      ticking = true;
    }
  });

  card.addEventListener("pointerleave", () => {
    bounds = null;
    card.style.removeProperty("--rotate-x");
    card.style.removeProperty("--rotate-y");
    card.style.removeProperty("--pointer-x");
    card.style.removeProperty("--pointer-y");
  });
});

const nav = document.getElementById("site-nav");
const navPanel = document.getElementById("nav-panel");
const menuToggle = document.getElementById("menu-toggle");
let lastScrollY = 0;
let navTicking = false;

function updateScrollState() {
  if (!navTicking) {
    window.requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      if (nav) {
        nav.classList.toggle("is-scrolled", scrollTop > 14);
        lastScrollY = scrollTop;
      }
      navTicking = false;
    });
    navTicking = true;
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

if (menuToggle && navPanel) {
  menuToggle.addEventListener("click", () => {
    const open = navPanel.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-nav") && navPanel.classList.contains("is-open")) {
      navPanel.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const path = window.location.pathname.split("/").pop() || "index.html";
const activeKey = path.replace(".html", "") || "index";
document.querySelectorAll("[data-nav]").forEach((link) => {
  link.classList.toggle("is-active", link.dataset.nav === activeKey);
});

// === 新增：按钮涟漪效果 ===
document.querySelectorAll(".button, .nav-cta").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    if (prefersReducedMotion) return;

    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "button-ripple";
    ripple.style.width = ripple.style.height = "20px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.animation = "ripple 600ms ease-out";

    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// === 新增：计数器动画 ===
function animateCounter(element, target) {
  if (prefersReducedMotion) {
    element.textContent = target;
    return;
  }

  const duration = 1200; // 持续时间（毫秒）
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // easeOutQuart 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 4);
    
    element.textContent = Math.floor(easeProgress * target);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  };
  
  window.requestAnimationFrame(step);
}

// 为所有统计数据启用计数器动画
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.target.dataset.counter !== "true") {
      const number = entry.target.querySelector("strong");
      if (number) {
        const targetText = number.textContent;
        const target = parseInt(targetText.replace(/\D/g, ""));
        if (!isNaN(target)) {
          animateCounter(number, target);
          entry.target.dataset.counter = "true";
          counterObserver.unobserve(entry.target);
        }
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll(".hero-data-strip div, .metric-card, .case-metrics div").forEach((el) => {
  counterObserver.observe(el);
});

// === 新增：视差滚动效果 ===
if (!prefersReducedMotion) {
  const glows = document.querySelectorAll(".glow");
  let parallaxTicking = false;

  window.addEventListener("scroll", () => {
    if (!parallaxTicking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // 为背景光晕添加视差效果
        glows.forEach((glow, index) => {
          const speed = 0.5 + (index * 0.1);
          glow.style.transform = `translateY(${scrollY * speed}px)`;
        });
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  }, { passive: true });
}

// === 新增：输入框焦点效果 ===
document.querySelectorAll("input, textarea").forEach((input) => {
  input.addEventListener("focus", function () {
    if (prefersReducedMotion) return;
    this.style.animation = "focusGlow 300ms ease-out";
  });

  input.addEventListener("blur", function () {
    this.style.animation = "none";
  });
});

// === 新增：客服悬浮按钮与弹窗逻辑 ===
function initContactModal() {
  // 仅在浏览器中注入一次
  if (document.getElementById("contact-modal-overlay")) return;

  const html = `
    <button class="fab-contact" id="fab-contact" aria-label="联系客服">
      <img src="./assets/support-avatar.jpg?v=3" alt="在线客服" class="fab-avatar">
      <span class="fab-online-badge"></span>
    </button>
    <div class="contact-modal-overlay" id="contact-modal-overlay">
      <div class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="contact-modal-close" id="contact-modal-close" aria-label="关闭">&times;</button>
        <div class="contact-modal-header">
           <h2 id="modal-title">您希望如何获取帮助？</h2>
        </div>
        <div class="contact-options">
           <button class="contact-option-card tilt-card" id="contact-option-wechat">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 17c1.4-1 2.3-2.4 2.8-4M21 11.5c0-4-3.5-7.5-8-7.5S5 7.5 5 11.5c0 1.8.7 3.5 1.8 4.8l-1.3 3.2 3.4-1.8c1.3.4 2.6.5 4.1.5 4.5 0 8-3.5 8-7.5z"></path>
              </svg>
              <strong>微信在线联系</strong>
              <span>添加专属顾问微信随时沟通</span>
           </button>
           <a href="mailto:3041236644@qq.com" class="contact-option-card tilt-card" id="contact-option-email">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" id="email-icon-svg">
                <polyline points="22,6 12,13 2,6"></polyline>
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
              </svg>
              <strong id="email-text-title">发送邮件联系</strong>
              <span id="email-text-desc">3041236644@qq.com</span>
           </a>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  const overlay = document.getElementById("contact-modal-overlay");
  const closeBtn = document.getElementById("contact-modal-close");
  const fabBtn = document.getElementById("fab-contact");
  const wechatBtn = document.getElementById("contact-option-wechat");

  function openModal() {
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden"; // 防背景滚动
  }

  function closeModal() {
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  // 绑定事件
  fabBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC 关闭弹窗
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-visible")) {
      closeModal();
    }
  });

  // 微信提示：显示二维码
  const originalWechatHTML = wechatBtn.innerHTML;
  let isWechatQRShowing = false;

  wechatBtn.addEventListener("click", () => {
    if (!isWechatQRShowing) {
      wechatBtn.innerHTML = `
        <img src="./assets/wechat-qr.jpg" alt="微信二维码" style="width: 140px; height: 140px; margin-bottom: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <strong style="color: var(--text);">微信扫一扫加好友</strong>
        <span style="color: var(--muted);">长按或扫码添加专属顾问</span>
      `;
      wechatBtn.style.borderColor = "var(--accent)";
      isWechatQRShowing = true;
    } else {
      wechatBtn.innerHTML = originalWechatHTML;
      wechatBtn.style.borderColor = "";
      isWechatQRShowing = false;
    }
  });

  // 拦截所有的 href="#contact" 并强制它们重定向到弹窗打开
  document.querySelectorAll('a[href*="#contact"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // 邮箱提示：复制邮箱地址
  const emailBtn = document.getElementById("contact-option-email");
  emailBtn.addEventListener("click", () => {
    // 写入剪贴板
    navigator.clipboard.writeText("3041236644@qq.com").then(() => {
      const icon = document.getElementById("email-icon-svg");
      const title = document.getElementById("email-text-title");
      
      icon.innerHTML = `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`;
      icon.setAttribute("stroke", "#10B981");
      title.innerText = "邮箱地址已复制！";
      title.style.color = "#10B981";
      emailBtn.style.borderColor = "#10B981";

      setTimeout(() => {
        closeModal();
        // 恢复原有状态
        setTimeout(() => {
          icon.innerHTML = `<polyline points="22,6 12,13 2,6"></polyline><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>`;
          icon.setAttribute("stroke", "currentColor");
          title.innerText = "发送邮件联系";
          title.style.color = "var(--text)";
          emailBtn.style.borderColor = "rgba(45, 124, 255, 0.12)";
        }, 500);
      }, 1500);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  });
}

// 文档就绪后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initContactModal();
    initPolicyModal();
  });
} else {
  initContactModal();
  initPolicyModal();
}

function initPolicyModal() {
  const html = `
    <div class="policy-modal-overlay" id="policy-modal-overlay">
      <div class="policy-modal-container">
        <button class="policy-modal-close" id="policy-modal-close" aria-label="关闭">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="policy-content-area single-card-mode">
          <div class="policy-pane active" id="policy-pane-terms">
            <h3>服务条款</h3>
            <p>欢迎使用通必达科技平台。本服务条款约束您访问和使用通必达科技网站、产品及服务。请您仔细阅读本条款内容。</p>
            <h4>1. 接受条款</h4>
            <p>当您访问或使用本服务，即表示您同意受本条款及所有相关政策（包括但不限于隐私政策）的约束。</p>
            <h4>2. 服务提供</h4>
            <p>我们保留在任何时候以任何理由修改或终止服务的权利，恕不另行通知。我们保留在任何时候更改这些条款的权利。修改后的条款将会在网站上公布。</p>
            <h4>3. 用户责任</h4>
            <p>您不得利用本平台从事任何违反法律法规、危害网络安全、或侵犯第三方合法权益的行为。否则我们有权随时暂停或终止您的账户。</p>
            <h4>4. 免责声明</h4>
            <p>本服务按“原样”及“可用”基础提供，我们不对服务的准确性、可靠性或无误性作任何明示或暗示的保证。</p>
          </div>
          <div class="policy-pane" id="policy-pane-privacy">
            <h3>隐私政策</h3>
            <p>通必达科技深知隐私对您的重要性，并会尊重您的隐私。本政策描述了我们如何收集、使用、存储及共享您的个人信息。</p>
            <h4>1. 信息收集</h4>
            <p>在您注册或使用我们的服务时，我们可能会收集您的公司名称、联系人信息、邮箱及使用行为等信息。</p>
            <h4>2. 信息使用</h4>
            <p>收集到的信息仅用于向您提供更好、更个性化的服务，包含服务通知、安全验证、产品改进等。</p>
            <h4>3. 数据安全</h4>
            <p>我们使用行业标准的加密技术和安全防护机制来保护您的个人信息，防止数据泄露或被未经授权的访问。</p>
            <h4>4. 第三方共享</h4>
            <p>除法律法规要求或为实现服务所必需外，我们不会向任何第三方出售、交易或转移您的个人信息。</p>
          </div>
          <div class="policy-pane" id="policy-pane-aup">
            <h3>可接受使用政策</h3>
            <p>本政策概述了您在使用通必达科技服务时被禁止的行为。此政策是对《服务条款》的补充。</p>
            <h4>1. 禁止滥用</h4>
            <p>您不得以任何可能破坏、瘫痪、过度负担或损害我们服务器及网络的方式使用服务。</p>
            <h4>2. 恶意活动</h4>
            <p>严禁利用我们的平台发送垃圾邮件、传播病毒木马、或进行任何形式的网络攻击。</p>
            <h4>3. 违规处理</h4>
            <p>如果发现任何违反本政策的行为，我们将立即采取行动，包括限制、暂停或永久终止您对服务的访问权。</p>
            <h4>4. 知识产权保护</h4>
            <p>您不得上传、分享或分发任何侵犯他人版权、商标权、商业秘密或其他合法权益的内容。</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  const overlay = document.getElementById("policy-modal-overlay");
  const closeBtn = document.getElementById("policy-modal-close");
  const panes = document.querySelectorAll(".policy-pane");

  function openPolicyModal(targetId) {
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden";
    showPane(targetId);
  }

  function closePolicyModal() {
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  function showPane(targetId) {
    panes.forEach(pane => {
      if (pane.id === `policy-pane-${targetId}`) {
        pane.classList.add("active");
        // scroll to top when opening a pane
        pane.parentElement.scrollTop = 0;
      } else {
        pane.classList.remove("active");
      }
    });
  }

  // 绑定关闭事件
  closeBtn.addEventListener("click", closePolicyModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePolicyModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-visible")) {
      closePolicyModal();
    }
  });

  // 拦截底部链接点击
  document.querySelectorAll('.simple-footer-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const text = link.innerText.trim();
      if (text === '服务条款') {
        e.preventDefault();
        openPolicyModal('terms');
      } else if (text === '隐私政策') {
        e.preventDefault();
        openPolicyModal('privacy');
      } else if (text === '可接受使用政策') {
        e.preventDefault();
        openPolicyModal('aup');
      }
    });
  });
}


// 产品中心 Tab 切换逻辑
document.addEventListener('DOMContentLoaded', () => {
  const rolePills = document.querySelectorAll('.role-pill');
  const stackCards = document.querySelectorAll('.product-stack .stack-card');

  if (rolePills.length > 0 && stackCards.length > 0) {
    rolePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const targetTab = pill.getAttribute('data-tab');
        
        // 移除所有的 active 类
        rolePills.forEach(p => p.classList.remove('active'));
        stackCards.forEach(c => c.classList.remove('active'));
        
        // 给当前点击的标签和对应的内容添加 active
        pill.classList.add('active');
        const targetCard = document.querySelector(`.product-stack .stack-card[data-tab="${targetTab}"]`);
        if (targetCard) {
          targetCard.classList.add('active');
        }
      });
    });
  }

  // === FAQ Page Tab Switching ===
  const faqNavItems = document.querySelectorAll('.faq-nav-item');
  const faqArticles = document.querySelectorAll('.faq-article');

  if (faqNavItems.length > 0 && faqArticles.length > 0) {
    faqNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all
        faqNavItems.forEach(nav => nav.classList.remove('active'));
        faqArticles.forEach(article => article.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Show corresponding article
        const targetId = item.getAttribute('href').substring(1);
        const targetArticle = document.getElementById(targetId);
        if (targetArticle) {
          targetArticle.classList.add('active');
        }
      });
    });
  }
});
