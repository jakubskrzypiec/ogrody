const header = document.getElementById('header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.main-nav a');
const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Stabilny start po załadowaniu fontów — ogranicza wizualne "przeskoki" typografii.
Promise.race([
  document.fonts?.ready || Promise.resolve(),
  new Promise(resolve => setTimeout(resolve, 900))
]).then(() => requestAnimationFrame(() => body.classList.add('page-loaded')));

function setHeaderState() {
  header?.classList.toggle('scrolled', window.scrollY > 30);
}
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
  body.classList.toggle('menu-active', open);
});
navLinks.forEach(link => link.addEventListener('click', () => {
  header?.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Otwórz menu');
  body.classList.remove('menu-active');
}));

// Pasek postępu — lekki i bez ingerencji w layout.
const progressBar = document.querySelector('.scroll-progress span');
let scrollTick = false;
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  progressBar?.style.setProperty('--progress', progress);
  scrollTick = false;
}
window.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(updateScrollProgress);
}, { passive: true });
updateScrollProgress();

// Reveal — kilka kierunków, ale bez przesuwania layoutu.
const revealEls = [...document.querySelectorAll('.reveal')];
revealEls.forEach((el, i) => el.style.setProperty('--reveal-order', i % 4));
if (!reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// Parallax przerywników.
const parallaxEls = document.querySelectorAll('.image-break .parallax-bg');
if (!reducedMotion && window.innerWidth > 780) {
  let ticking = false;
  const parallax = () => {
    parallaxEls.forEach(el => {
      const section = el.parentElement;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.045;
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.055)`;
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

// Delikatny ruch hero kursorem — tylko desktop i tylko fine pointer.
const hero = document.querySelector('.hero');
const heroBg = document.querySelector('.hero-bg');
if (hero && heroBg && finePointer && !reducedMotion) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    heroBg.style.setProperty('--hero-x', `${x * -9}px`);
    heroBg.style.setProperty('--hero-y', `${y * -7}px`);
  });
  hero.addEventListener('pointerleave', () => {
    heroBg.style.setProperty('--hero-x', '0px');
    heroBg.style.setProperty('--hero-y', '0px');
  });
}

// Galerie — pełne, rozdzielone zestawy fotografii Effkowe Ogrody z portfolio.
const base = 'https://static.oferteo.pl/images/portfolio/7318627/orig/';
const galleries = {
  1: [
    '1768857268427-crop-1000022974.jpg',
    '1768857276491-crop-1000022972.jpg',
    '1768857284632-crop-1000022971.jpg',
    '1768857293501-crop-1000022970.jpg',
    '1768857299242-crop-1000022969.jpg',
    '1768857304831-crop-1000022968.jpg',
    '1768857311100-crop-1000022963.jpg',
    '1768857318070-crop-1000022961.jpg',
    '1768857324492-crop-1000022962.jpg',
    '1768857331008-crop-1000022960.jpg'
  ].map(file => base + file),
  2: [
    '1768857339498-crop-1000022530.jpg',
    '1768857346050-crop-1000016603.jpg',
    '1768857351531-crop-1000016602.jpg',
    '1768857357634-crop-1000016601.jpg',
    '1768857363292-crop-1000016600.jpg',
    '1768857369130-crop-1000016599.jpg',
    '1768856786470-crop-1000034114.jpg',
    '1768856812992-crop-1000032832.jpg'
  ].map(file => base + file),
  3: [
    '1768856789161-crop-1000032292.jpg',
    '1768856793850-crop-1000032291.jpg',
    '1768856798201-crop-1000032823.jpg',
    '1768856802770-crop-1000032829.jpg',
    '1768856807890-crop-1000032826.jpg',
    '1768856825181-crop-1000028673.jpg',
    '1768856833991-crop-1000024318.jpg'
  ].map(file => base + file),
};

const modal = document.getElementById('galleryModal');
const galleryImage = document.getElementById('galleryImage');
const galleryCurrent = document.getElementById('galleryCurrent');
const galleryTotal = document.getElementById('galleryTotal');
const galleryCaption = document.getElementById('galleryCaption');
const galleryThumbs = document.getElementById('galleryThumbs');
const closeBtn = document.querySelector('.gallery-close');
if (galleryImage) galleryImage.referrerPolicy = 'no-referrer';
const prevBtn = document.querySelector('.gallery-prev');
const nextBtn = document.querySelector('.gallery-next');
let activeGallery = 1;
let activeIndex = 0;
let lastTrigger = null;
let galleryTouchStart = 0;

function preloadAround() {
  const images = galleries[activeGallery];
  [-1, 1].forEach(direction => {
    const index = (activeIndex + direction + images.length) % images.length;
    const preload = new Image();
    preload.src = images[index];
  });
}

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
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    button.appendChild(img);
    button.addEventListener('click', () => {
      activeIndex = index;
      updateGallery(true);
    });
    galleryThumbs.appendChild(button);
  });
}

function updateGallery(animate = false) {
  const images = galleries[activeGallery];
  const src = images[activeIndex];
  if (animate && !reducedMotion) galleryImage.classList.add('is-changing');
  const swap = () => {
    galleryImage.src = src;
    galleryImage.alt = `Realizacja ${String(activeGallery).padStart(2, '0')} — ujęcie ${activeIndex + 1}`;
    galleryCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
    galleryTotal.textContent = String(images.length).padStart(2, '0');
    galleryCaption.textContent = `Realizacja ${String(activeGallery).padStart(2, '0')} · ujęcie ${String(activeIndex + 1).padStart(2, '0')}`;
    [...galleryThumbs.children].forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    galleryThumbs.children[activeIndex]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    preloadAround();
  };
  if (animate && !reducedMotion) setTimeout(swap, 110); else swap();
}

galleryImage?.addEventListener('load', () => galleryImage.classList.remove('is-changing'));
galleryImage?.addEventListener('error', () => {
  galleryImage.classList.remove('is-changing');
  galleryCaption.textContent = 'Nie udało się wczytać tego ujęcia — wybierz kolejne.';
});

function openGallery(number, trigger) {
  activeGallery = Number(number);
  activeIndex = 0;
  lastTrigger = trigger;
  renderThumbs();
  updateGallery(false);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('gallery-open');
  closeBtn?.focus({ preventScroll: true });
}

function closeGallery() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  body.classList.remove('gallery-open');
  lastTrigger?.focus({ preventScroll: true });
}

function moveGallery(direction) {
  const length = galleries[activeGallery].length;
  activeIndex = (activeIndex + direction + length) % length;
  updateGallery(true);
}

document.querySelectorAll('[data-gallery]').forEach(button => {
  button.addEventListener('click', () => openGallery(button.dataset.gallery, button));
});
closeBtn?.addEventListener('click', closeGallery);
prevBtn?.addEventListener('click', () => moveGallery(-1));
nextBtn?.addEventListener('click', () => moveGallery(1));
modal?.addEventListener('click', (event) => { if (event.target === modal) closeGallery(); });
modal?.addEventListener('touchstart', event => { galleryTouchStart = event.changedTouches[0]?.clientX || 0; }, { passive: true });
modal?.addEventListener('touchend', event => {
  const end = event.changedTouches[0]?.clientX || 0;
  const delta = end - galleryTouchStart;
  if (Math.abs(delta) > 55) moveGallery(delta > 0 ? -1 : 1);
}, { passive: true });
document.addEventListener('keydown', (event) => {
  if (!modal?.classList.contains('open')) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});

// Premium micro-interactions: karty realizacji mają subtelny tilt na desktopie.
if (finePointer && !reducedMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty('--tilt-y', `${px * 3.2}deg`);
      card.style.setProperty('--tilt-x', `${py * -2.4}deg`);
      card.style.setProperty('--spot-x', `${(px + .5) * 100}%`);
      card.style.setProperty('--spot-y', `${(py + .5) * 100}%`);
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
}

// FAQ — tylko jedna odpowiedź naraz.
const details = [...document.querySelectorAll('.faq details')];
details.forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  details.forEach(other => { if (other !== item) other.open = false; });
}));

// Placeholder link do opinii Google.
document.querySelector('.google-link[href="#"]')?.addEventListener('click', event => event.preventDefault());

document.getElementById('year').textContent = new Date().getFullYear();

// Aktywna sekcja w nawigacji — bez skakania layoutu.
const sectionLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')]
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(item => item.section);
const activeSectionObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  sectionLinks.forEach(({ link, section }) => link.classList.toggle('is-active', section === visible.target));
}, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .15, .35, .6] });
sectionLinks.forEach(({ section }) => activeSectionObserver.observe(section));
