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

// ─── Listing photo carousels ────────────────────────────────────────────────
document.querySelectorAll('[data-carousel]').forEach(track => {
  const wrapper = track.closest('.listing-image');
  const slides = track.querySelectorAll('.listing-slide');
  const dotsWrap = wrapper.querySelector('[data-carousel-dots]');
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('.carousel-dot');

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
  }

  wrapper.querySelector('[data-carousel-prev]').addEventListener('click', () => goTo(index - 1));
  wrapper.querySelector('[data-carousel-next]').addEventListener('click', () => goTo(index + 1));
});

// ─── Portal / CRM integration ──────────────────────────────────────────────
// TODO: replace the join-team placeholder and booking slug once you have them.
const PORTAL_SUBMIT_URL = 'https://portal.rlcrealtyco.com/api/forms/submit';
const FORM_IDS = {
  'buyer-seller': 'c0cdd9f7-2e88-42bc-917c-68afc6629b09',
  'rental': 'c0cdd9f7-2e88-42bc-917c-68afc6629b09',
  'join-team': 'REPLACE_WITH_JOIN_TEAM_FORM_ID',
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
