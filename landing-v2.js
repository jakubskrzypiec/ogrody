(() => {
 const rail=document.querySelector('.carousel-rail');if(!rail)return;
 const group=rail.querySelector('.carousel-group');if(!group)return;
 const previous=document.querySelector('.carousel-prev'),next=document.querySelector('.carousel-next');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let firstVisible=0;
 rail.classList.add('carousel-ready');
 function geometry(){const style=getComputedStyle(rail),count=parseInt(style.getPropertyValue('--carousel-visible'),10)||1;const card=group.querySelector('.carousel-card');return{count,pitch:card.getBoundingClientRect().width+parseFloat(getComputedStyle(group).gap),last:Math.max(0,group.children.length-count)};}
 function update(){const{pitch}=geometry();firstVisible=Math.round(rail.scrollLeft/pitch);previous.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;}
 function step(direction){const{pitch,last}=geometry();const index=Math.max(0,Math.min(last,Math.round(rail.scrollLeft/pitch)+direction));rail.scrollTo({left:index*pitch,behavior:reduced.matches?'instant':'smooth'});}
 previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
 rail.addEventListener('keydown',event=>{if(event.target===rail&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}});
 rail.addEventListener('scroll',update,{passive:true});
 new ResizeObserver(()=>{rail.closest('.carousel-stage').style.setProperty('--carousel-image-height',group.querySelector('.carousel-image').getBoundingClientRect().height+'px');const{pitch,last}=geometry();rail.scrollTo({left:Math.min(firstVisible,last)*pitch,behavior:'instant'});update();}).observe(rail);
 update();
})();