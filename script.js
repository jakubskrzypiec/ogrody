const header = document.getElementById('header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.main-nav a');
const body = document.body;

function setHeaderState() {
  header?.classList.toggle('scrolled', window.scrollY > 30);
}
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  body.classList.toggle('modal-open', open);
});
navLinks.forEach(link => link.addEventListener('click', () => {
  header?.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  body.classList.remove('modal-open');
}));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

const parallaxEls = document.querySelectorAll('.image-break .parallax-bg');
if (!reducedMotion && window.innerWidth > 760) {
  let ticking = false;
  const parallax = () => {
    parallaxEls.forEach(el => {
      const section = el.parentElement;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.05;
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.03)`;
    });
    ticking = false;
  };
  parallax();
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(parallax);
  }, { passive: true });
}

const realGallery = ['realizacja-real-01.webp', 'realizacja-real-02.webp', 'realizacja-real-03.webp', 'realizacja-real-04.webp', 'realizacja-real-05.webp'];
const galleries = {
  1: realGallery,
  2: realGallery,
  3: realGallery,
};

const modal = document.getElementById('galleryModal');
const galleryImage = document.getElementById('galleryImage');
const galleryCurrent = document.getElementById('galleryCurrent');
const galleryTotal = document.getElementById('galleryTotal');
const galleryCaption = document.getElementById('galleryCaption');
const galleryThumbs = document.getElementById('galleryThumbs');
const closeBtn = document.querySelector('.gallery-close');
const prevBtn = document.querySelector('.gallery-prev');
const nextBtn = document.querySelector('.gallery-next');
let activeGallery = 1;
let activeIndex = 0;
let lastTrigger = null;

function renderThumbs() {
  galleryThumbs.innerHTML = '';
  galleries[activeGallery].forEach((src, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = index === activeIndex ? 'active' : '';
    button.setAttribute('aria-label', `Pokaż zdjęcie ${index + 1}`);
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    button.appendChild(img);
    button.addEventListener('click', () => {
      activeIndex = index;
      updateGallery();
    });
    galleryThumbs.appendChild(button);
  });
}

function updateGallery() {
  const images = galleries[activeGallery];
  const src = images[activeIndex];
  galleryImage.src = src;
  galleryImage.alt = `Realizacja ${String(activeGallery).padStart(2, '0')} — ujęcie ${activeIndex + 1}`;
  galleryCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
  galleryTotal.textContent = String(images.length).padStart(2, '0');
  galleryCaption.textContent = `Realizacja ${String(activeGallery).padStart(2, '0')} · ujęcie ${String(activeIndex + 1).padStart(2, '0')}`;
  [...galleryThumbs.children].forEach((el, i) => el.classList.toggle('active', i === activeIndex));
  galleryThumbs.children[activeIndex]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
}

function openGallery(number, trigger) {
  activeGallery = Number(number);
  activeIndex = 0;
  lastTrigger = trigger;
  renderThumbs();
  updateGallery();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open', 'gallery-open');
  closeBtn?.focus();
}

function closeGallery() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open', 'gallery-open');
  lastTrigger?.focus();
}

function moveGallery(direction) {
  const length = galleries[activeGallery].length;
  activeIndex = (activeIndex + direction + length) % length;
  updateGallery();
}

document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('click', () => openGallery(button.dataset.gallery, button));
});
closeBtn?.addEventListener('click', closeGallery);
prevBtn?.addEventListener('click', () => moveGallery(-1));
nextBtn?.addEventListener('click', () => moveGallery(1));
modal?.addEventListener('click', (event) => { if (event.target === modal) closeGallery(); });
document.addEventListener('keydown', (event) => {
  if (!modal?.classList.contains('open')) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});

const details = [...document.querySelectorAll('.faq details')];
details.forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  details.forEach(other => { if (other !== item) other.open = false; });
}));

// Placeholder link do opinii Google — nie przewijamy strony, dopóki nie zostanie podmieniony.
document.querySelector('.google-link[href="#"]')?.addEventListener('click', event => event.preventDefault());

document.getElementById('year').textContent = new Date().getFullYear();

const sectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')]
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(item => item.section);

const activeSectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  sectionLinks.forEach(({ link, section }) => link.classList.toggle('is-active', section === visible.target));
}, {
  root: null,
  rootMargin: '-28% 0px -58% 0px',
  threshold: [0, .15, .35, .6]
});
sectionLinks.forEach(({ section }) => activeSectionObserver.observe(section));
