(() => {
 const rail=document.querySelector('.carousel-rail');if(!rail)return;
 const group=rail.querySelector('.carousel-group'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const track=document.createElement('div');track.className='carousel-track';
 const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');duplicate.querySelectorAll('a').forEach(a=>a.tabIndex=-1);
 rail.append(track);track.append(group,duplicate);rail.classList.add('carousel-ready');
 const toggle=document.querySelector('.carousel-toggle');let paused=reduced.matches,position=0,distance=0,last=0,frame=0;
 const measure=()=>{distance=group.getBoundingClientRect().width;if(distance)position=((position%distance)+distance)%distance;paint()};
 function paint(){track.style.transform=`translate3d(${-position}px,0,0)`;toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Wznów ruch ▶':'Zatrzymaj ruch Ⅱ';}
 function tick(now){const delta=last?Math.min(now-last,64):0;last=now;if(!paused&&!document.hidden&&distance){position=(position+delta*.025)%distance;paint()}frame=requestAnimationFrame(tick)}
 function step(dir){paused=true;position=(position+dir*(group.children[0].getBoundingClientRect().width+18)+distance)%distance;paint()}
 toggle.addEventListener('click',()=>{paused=!paused;paint()});document.querySelector('.carousel-prev').addEventListener('click',()=>step(-1));document.querySelector('.carousel-next').addEventListener('click',()=>step(1));
 rail.addEventListener('keydown',e=>{if(e.target===rail&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();step(e.key==='ArrowLeft'?-1:1)}});
 rail.addEventListener('pointerdown',()=>{paused=true;paint()},{passive:true});
 rail.addEventListener('focusin',e=>{paused=true;const card=e.target.closest('.carousel-card');if(card&&card.matches(':focus-visible')){position=card.offsetLeft%distance;rail.scrollLeft=0}paint()});
 let start=0;rail.addEventListener('touchstart',e=>{start=e.changedTouches[0].clientX;paused=true;paint()},{passive:true});rail.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-start;if(Math.abs(d)>45)step(d<0?1:-1)},{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;paint()});document.addEventListener('visibilitychange',()=>last=0);
 new ResizeObserver(measure).observe(group);measure();paint();frame=requestAnimationFrame(tick);
 window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
 window.addEventListener('pageshow',event=>{if(event.persisted){last=0;frame=requestAnimationFrame(tick)}});
})();
