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

  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;
    const rotateY = ((offsetX / bounds.width) - 0.5) * 8;
    const rotateX = (0.5 - (offsetY / bounds.height)) * 8;

    card.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
    card.style.setProperty("--pointer-x", `${((offsetX / bounds.width) * 100).toFixed(2)}%`);
    card.style.setProperty("--pointer-y", `${((offsetY / bounds.height) * 100).toFixed(2)}%`);
  });

  card.addEventListener("pointerleave", () => {
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

function updateScrollState() {
  const scrollTop = window.scrollY;
  if (nav) {
    nav.classList.toggle("is-scrolled", scrollTop > 14);

    // === 新增：滚动隐藏导航栏逻辑 ===
    // 向下滚动隐藏，向上滚动显示
    if (scrollTop > lastScrollY && scrollTop > 100) {
      // 向下滚动
      nav.classList.add("is-hidden");
    } else {
      // 向上滚动
      nav.classList.remove("is-hidden");
    }
    lastScrollY = scrollTop;
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
  const increment = target / (duration / 16); // 每帧增长量
  let current = 0;

  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
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
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // 为背景光晕添加视差效果
    document.querySelectorAll(".glow").forEach((glow, index) => {
      const speed = 0.5 + (index * 0.1);
      glow.style.transform = `translateY(${scrollY * speed}px)`;
    });
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
  document.addEventListener("DOMContentLoaded", initContactModal);
} else {
  initContactModal();
}

