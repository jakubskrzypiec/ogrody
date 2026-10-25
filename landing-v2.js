(() => {
 const rail=document.querySelector('.carousel-rail');if(!rail)return;
 const group=rail.querySelector('.carousel-group');if(!group)return;
 const previous=document.querySelector('.carousel-prev'),next=document.querySelector('.carousel-next');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 rail.classList.add('carousel-ready');
 function update(){previous.disabled=rail.scrollLeft<=12;next.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;}
 function step(direction){const card=group.querySelector('.carousel-card');if(!card)return;rail.scrollBy({left:direction*(card.getBoundingClientRect().width+18),behavior:reduced.matches?'instant':'smooth'});}
 previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
 rail.addEventListener('keydown',event=>{if(event.target===rail&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}});
 rail.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(rail);update();
})();