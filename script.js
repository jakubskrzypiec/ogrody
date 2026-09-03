// Endpoint formularza Formspree. Podmień również action w index.html.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/TWOJ_ENDPOINT'; // <-- podmień na własny endpoint

const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');

function setHeaderState() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 40);
}
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('is-open', !open);
    header?.classList.toggle('menu-open', !open);
    document.body.style.overflow = !open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      header?.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// Lightbox realizacji — klawiatura: strzałki, Esc i Tab.
const lightbox = document.querySelector('[data-lightbox]');
const galleryButtons = [...document.querySelectorAll('[data-lightbox-src]')];
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const btnClose = document.querySelector('[data-lightbox-close]');
const btnPrev = document.querySelector('[data-lightbox-prev]');
const btnNext = document.querySelector('[data-lightbox-next]');
let currentIndex = 0;
let lastFocusedElement = null;

function renderLightbox(index) {
  currentIndex = (index + galleryButtons.length) % galleryButtons.length;
  const trigger = galleryButtons[currentIndex];
  const thumb = trigger.querySelector('img');
  if (lightboxImage) {
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = thumb?.alt || 'Realizacja Effkowe Ogrody';
  }
  if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.lightboxCaption || '';
}

function openLightbox(index) {
  if (!lightbox) return;
  lastFocusedElement = document.activeElement;
  renderLightbox(index);
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  btnClose?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  if (lightboxImage) lightboxImage.src = '';
  lastFocusedElement?.focus();
}

galleryButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
btnClose?.addEventListener('click', closeLightbox);
btnPrev?.addEventListener('click', () => renderLightbox(currentIndex - 1));
btnNext?.addEventListener('click', () => renderLightbox(currentIndex + 1));
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', event => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') renderLightbox(currentIndex - 1);
  if (event.key === 'ArrowRight') renderLightbox(currentIndex + 1);
  if (event.key === 'Tab') {
    const focusable = [...lightbox.querySelectorAll('button:not([disabled])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

// Jeżeli endpoint jest jeszcze placeholderem, formularz nie wysyła danych i podpowiada co uzupełnić.
const contactForm = document.querySelector('[data-contact-form]');
const formNote = document.querySelector('[data-form-note]');
if (contactForm) {
  contactForm.action = FORMSPREE_ENDPOINT;
  contactForm.addEventListener('submit', event => {
    if (FORMSPREE_ENDPOINT.includes('TWOJ_ENDPOINT')) {
      event.preventDefault();
      if (formNote) formNote.textContent = 'Formularz jest gotowy wizualnie — przed publikacją podłącz endpoint Formspree w script.js.';
    }
  });
}
