(() => {
  const book = document.querySelector('[data-notebook]');
  const button = document.querySelector('.notebook-open');
  if (!book || !button) return;
  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    book.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Przejdź do notatek ↓';
  }
  button.addEventListener('click', () => {
    if (!opened) open();
    else document.getElementById('notatki').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  window.addEventListener('scroll', () => {
    if (book.getBoundingClientRect().top < -80) open();
  }, {passive: true});
})();
