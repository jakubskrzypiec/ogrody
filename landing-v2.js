(() => {
 const rail=document.querySelector('.carousel-rail');if(!rail)return;
 const group=rail.querySelector('.carousel-group');
 const track=document.createElement('div');track.className='carousel-track';
 const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');duplicate.querySelectorAll('a').forEach(link=>link.tabIndex=-1);
 rail.append(track);track.append(group,duplicate);
 const measure=()=>{const distance=group.getBoundingClientRect().width;track.style.setProperty('--carousel-distance',`${distance}px`);track.style.setProperty('--carousel-duration',`${distance/25}s`)};
 new ResizeObserver(measure).observe(group);measure();
 // Compositor-driven translation keeps fractional pixels and never pauses on hover.
 // Reduced-motion users retain a manually scrollable list.
 rail.addEventListener('keydown',event=>{
  if(event.target!==rail||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();rail.scrollBy({left:(event.key==='ArrowLeft'?-1:1)*group.children[0].getBoundingClientRect().width,behavior:'smooth'});
 });
})();
