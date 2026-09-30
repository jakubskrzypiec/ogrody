(() => {
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.body.classList.add('motion-ready');
 const modal=document.getElementById('galleryModal');
 const backgrounds=[document.querySelector('header'),document.querySelector('main'),document.querySelector('footer')];
 new MutationObserver(()=>{const open=modal.classList.contains('open');backgrounds.forEach(el=>{if(el)el.inert=open})}).observe(modal,{attributes:true,attributeFilter:['class']});
 modal.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const buttons=[...modal.querySelectorAll('button')].filter(el=>el.getClientRects().length);
  const first=buttons[0],last=buttons[buttons.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('menu-active')){document.querySelector('.menu-toggle').click();document.querySelector('.menu-toggle').focus()}});
 const form=document.querySelector('.contact-form');if(!form)return;
 const files=form.querySelector('[type=file]'),status=form.querySelector('.form-status'),submit=form.querySelector('[type=submit]');
 const checkFiles=()=>{
  const selected=[...files.files];let error='';
  if(selected.length>5)error='Wybierz maksymalnie 5 zdjęć.';
  else if(selected.reduce((sum,file)=>sum+file.size,0)>10*1024*1024)error='Zdjęcia mogą mieć łącznie maksymalnie 10 MB.';
  else if(selected.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)))error='Wybierz pliki JPG, PNG lub WebP.';
  files.setCustomValidity(error);
 };
 files.addEventListener('change',checkFiles);
 form.addEventListener('submit',async event=>{
  event.preventDefault();checkFiles();if(!form.reportValidity()||form.elements._honey.value)return;
  submit.disabled=true;submit.setAttribute('aria-busy','true');status.textContent='Wysyłam zapytanie…';
  const data=new FormData(form);data.set('_replyto',data.get('email'));data.delete('attachment');[...files.files].forEach((file,i)=>data.append('attachment'+(i+1),file));
  try{
   const response=await fetch(form.action.replace('formsubmit.co/','formsubmit.co/ajax/'),{method:'POST',body:data,headers:{Accept:'application/json'},signal:AbortSignal.timeout(25000)});
   const result=await response.json();if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('Not accepted');
   status.textContent='Zapytanie zostało przyjęte do wysyłki. Dziękuję za wiadomość.';form.reset();window.dispatchEvent(new CustomEvent('effkowe:conversion',{detail:{name:'inquiry_accepted'}}));
  }catch{
   status.replaceChildren(document.createTextNode('Nie udało się potwierdzić wysyłki. Dane zostały w formularzu. Spróbuj ponownie lub '));const mail=document.createElement('a');mail.href='mailto:ewa.katrycz@gmail.com';mail.textContent='napisz bezpośrednio e-mail';status.append(mail);
  }finally{submit.disabled=false;submit.removeAttribute('aria-busy')}
 });
 document.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  let name=link.href.startsWith('mailto:')?'email_click':link.href.startsWith('tel:')?'phone_click':link.textContent.includes('Zapytaj o projekt ogrodu')?'project_cta_click':null;
  if(name)window.dispatchEvent(new CustomEvent('effkowe:conversion',{detail:{name}}));
 }));
})();
