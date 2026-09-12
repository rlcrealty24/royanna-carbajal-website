document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  navToggle.classList.toggle('active');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

// ─── Portal / CRM integration ──────────────────────────────────────────────
// TODO: replace these three placeholders once the portal gives you real values.
const PORTAL_SUBMIT_URL = 'https://portal.rlcrealtyco.com/api/forms/submit';
const FORM_IDS = {
  'buyer-seller': 'REPLACE_WITH_BUYER_SELLER_FORM_ID',
  'rental': 'REPLACE_WITH_RENTAL_FORM_ID',
};
const BOOKING_URL = 'https://portal.rlcrealtyco.com/booking/REPLACE_WITH_BOOKING_SLUG';

// ─── Modals ─────────────────────────────────────────────────────────────────
const overlays = document.querySelectorAll('.modal-overlay');

function openModal(name) {
  const overlay = document.getElementById(`modal-${name}`);
  if (!overlay) return;
  if (name === 'booking') {
    const frame = overlay.querySelector('[data-booking-src]');
    if (frame && !frame.src) frame.src = BOOKING_URL;
  }
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(overlay) {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-open-modal]').forEach(trigger => {
  trigger.addEventListener('click', () => openModal(trigger.dataset.openModal));
});

overlays.forEach(overlay => {
  overlay.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(overlay));
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    overlays.forEach(overlay => {
      if (overlay.classList.contains('open')) closeModal(overlay);
    });
  }
});

// ─── Inquiry form submission ────────────────────────────────────────────────
document.querySelectorAll('.inquiry-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = form.dataset.formTarget;
    const formId = FORM_IDS[target];
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('.form-submit');

    const data = Object.fromEntries(new FormData(form).entries());

    submitBtn.disabled = true;
    statusEl.textContent = 'Sending…';
    statusEl.className = 'form-status';

    try {
      const res = await fetch(PORTAL_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: formId, data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');

      statusEl.textContent = "Thank you — I'll be in touch shortly.";
      statusEl.className = 'form-status success';
      form.reset();
      setTimeout(() => {
        const overlay = form.closest('.modal-overlay');
        if (overlay) closeModal(overlay);
        statusEl.textContent = '';
      }, 2200);
    } catch (err) {
      statusEl.textContent = 'Something went wrong — please try again.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
    }
  });
});
