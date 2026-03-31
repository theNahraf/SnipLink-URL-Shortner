/**
 * Landing Page — JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ---- Mobile Menu Toggle ----
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileMenuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileMenuToggle.textContent = '☰';
      });
    });
  }

  // ---- Update nav for logged-in users ----
  if (api.isAuthenticated()) {
    const navLinks = document.getElementById('navLinks');
    const loginBtn = document.getElementById('navLoginBtn');
    const signupBtn = document.getElementById('navSignupBtn');
    if (loginBtn) loginBtn.textContent = 'Dashboard';
    if (loginBtn) loginBtn.href = '/dashboard';
    if (signupBtn) signupBtn.style.display = 'none';
  }

  // ---- URL Shortener Form ----
  const form = document.getElementById('shortenForm');
  const urlInput = document.getElementById('urlInput');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const resultCard = document.getElementById('resultCard');
  const shortUrlOutput = document.getElementById('shortUrlOutput');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    // Loading state
    btnText.textContent = 'Shortening...';
    btnLoader.classList.remove('hidden');

    try {
      const data = await api.shortenUrl(url);
      shortUrlOutput.textContent = data.shortUrl;
      resultCard.classList.add('show');
      showToast('Link shortened successfully! 🎉', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btnText.textContent = 'Shorten';
      btnLoader.classList.add('hidden');
    }
  });

  // ---- Animated Counter ----
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);
      el.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatNumber(target);
      }
    }
    requestAnimationFrame(update);
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    return num.toLocaleString();
  }

  // ---- Feature cards stagger animation ----
  const featureCards = document.querySelectorAll('.feature-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s backwards`;
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  featureCards.forEach(card => cardObserver.observe(card));

  // ---- Landing Tabs ----
  window.switchLandingTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}TabContent`).classList.add('active');
  };

  // ---- QR Generator Form ----
  const qrForm = document.getElementById('qrForm');
  if (qrForm) {
    const qrUrlInput = document.getElementById('qrUrlInput');
    const qrBtn = document.getElementById('qrBtn');
    const qrBtnText = document.getElementById('qrBtnText');
    const qrBtnLoader = document.getElementById('qrBtnLoader');
    const qrResultCard = document.getElementById('qrResultCard');
    const landingQrImage = document.getElementById('landingQrImage');

    qrForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = qrUrlInput.value.trim();
      if (!url) return;

      qrBtnText.classList.add('hidden');
      qrBtnLoader.classList.remove('hidden');
      qrBtn.disabled = true;
      qrResultCard.classList.remove('show');

      try {
        // Just generate a generic QR code for the inputted URL directly
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=' + encodeURIComponent(url);
        
        // Wait for image to load to provide a smooth UX
        landingQrImage.onload = () => {
          qrResultCard.classList.add('show');
          if (window.showToast) showToast('QR Code generated! 📱', 'success');
          
          qrBtnText.classList.remove('hidden');
          qrBtnLoader.classList.add('hidden');
          qrBtn.disabled = false;
        };

        landingQrImage.onerror = () => {
          throw new Error('Failed to generate QR Code. Please try again.');
        };

        landingQrImage.src = qrUrl;
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        qrBtnText.classList.remove('hidden');
        qrBtnLoader.classList.add('hidden');
        qrBtn.disabled = false;
      }
    });

    window.downloadLandingQr = function() {
      const img = document.getElementById('landingQrImage');
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = img.src;
      link.click();
    };
  }
});
