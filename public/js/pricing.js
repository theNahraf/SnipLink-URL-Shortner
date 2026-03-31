/**
 * Pricing Page — JavaScript
 * Handles Razorpay subscription checkout
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update nav for logged-in users
  if (api.isAuthenticated()) {
    const loginBtn = document.getElementById('navLoginBtn');
    const signupBtn = document.getElementById('navSignupBtn');
    if (loginBtn) { loginBtn.textContent = 'Dashboard'; loginBtn.href = '/dashboard'; }
    if (signupBtn) signupBtn.style.display = 'none';
  }

  // ---- Mobile Menu Toggle ----
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      if (navbar) navbar.classList.toggle('menu-open');
      mobileMenuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        if (navbar) navbar.classList.remove('menu-open');
        mobileMenuToggle.textContent = '☰';
      });
    });
  }
});

// ---- Subscribe ----
async function handleSubscribe(planType) {
  try {
    showToast('Processing mock payment...', 'info');

    // This bypasses Razorpay entirely and upgrades the user
    await api.request('POST', '/payments/mock-upgrade', { planType });

    // Instantly sync the new profile into localStorage
    try {
      const profile = await api.getProfile();
      if(profile) api.setAuth(profile, api.accessToken);
    } catch(e) {}

    showToast('Payment successful! 🎉 Upgrading your plan...', 'success');
    
    // Refresh user data or just redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  } catch (err) {
    if (err.statusCode === 401 || err.message.toLowerCase().includes('unauthorized')) {
      showToast('Please sign up or log in first', 'warning');
      setTimeout(() => window.location.href = '/login', 1500);
    } else {
      showToast(err.message || 'Payment upgrade failed', 'error');
    }
  }
}

// ---- FAQ Toggle ----
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  item.classList.toggle('open');
}
