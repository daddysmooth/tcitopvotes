(()=>{
  const isAdminHome=()=>location.pathname==='/admin'||location.pathname==='/admin/';
  const isMobile=()=>window.matchMedia('(max-width: 900px)').matches;

  function sectionTitle(card){
    return card.querySelector(':scope > h2')||card.querySelector(':scope > .cardHead h2');
  }

  function makeCollapsible(card,index){
    if(!isMobile()||card.dataset.mobileAccordionReady)return;
    const title=sectionTitle(card);if(!title)return;
    card.dataset.mobileAccordionReady='true';
    card.classList.add('adminAccordion');

    const header=document.createElement('button');
    header.type='button';
    header.className='adminAccordionHeader';
    header.setAttribute('aria-expanded','false');
    header.innerHTML=`<span>${title.textContent.trim()}</span><span class="adminAccordionIcon" aria-hidden="true">+</span>`;

    const body=document.createElement('div');
    body.className='adminAccordionBody';
    const nodes=[...card.childNodes].filter(node=>{
      if(node===title)return false;
      const head=title.closest('.cardHead');
      return !head||node!==head;
    });

    const head=title.closest('.cardHead');
    if(head){
      [...head.children].forEach(child=>{if(!child.contains(title))body.append(child)});
      head.remove();
    }else title.remove();
    nodes.forEach(node=>{if(node.parentNode===card)body.append(node)});
    card.prepend(header);card.append(body);

    const defaultOpen=index===0;
    card.classList.toggle('isOpen',defaultOpen);
    header.setAttribute('aria-expanded',String(defaultOpen));
    header.querySelector('.adminAccordionIcon').textContent=defaultOpen?'−':'+';

    header.addEventListener('click',()=>{
      const open=card.classList.toggle('isOpen');
      header.setAttribute('aria-expanded',String(open));
      header.querySelector('.adminAccordionIcon').textContent=open?'−':'+';
      if(open)card.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  function makeHeroCompact(){
    if(!isMobile())return;
    const hero=document.querySelector('.adminHero');if(!hero||hero.dataset.mobileCompactReady)return;
    hero.dataset.mobileCompactReady='true';
    const actions=hero.querySelector('[data-admin-modules]');if(!actions)return;
    const toggle=document.createElement('button');toggle.type='button';toggle.className='btn light adminToolsToggle';toggle.textContent='Open Admin Tools';
    actions.classList.add('adminToolsGrid');actions.hidden=true;
    toggle.onclick=()=>{actions.hidden=!actions.hidden;toggle.textContent=actions.hidden?'Open Admin Tools':'Close Admin Tools'};
    hero.append(toggle);
  }

  function enhancePollCards(){
    if(!isMobile())return;
    document.querySelectorAll('.adminPoll').forEach(card=>{
      if(card.dataset.tapReady)return;card.dataset.tapReady='true';card.classList.add('tapCard');
      const view=card.querySelector('a.btn');
      if(view){
        card.setAttribute('role','link');card.tabIndex=0;
        const open=event=>{if(event.target.closest('a,button,input,select,textarea'))return;location.href=view.href};
        card.addEventListener('click',open);
        card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('a,button,input,select,textarea')){event.preventDefault();location.href=view.href}});
      }
    });
  }

  function apply(){
    if(!isAdminHome()||!isMobile())return;
    document.body.classList.add('mobileAdmin');
    makeHeroCompact();
    document.querySelectorAll('#adminContent > .adminGrid > .adminCard, #adminContent > .optionManager, #adminContent > [data-survey-overview]').forEach((card,index)=>makeCollapsible(card,index));
    enhancePollCards();
  }

  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(apply,850),{once:true});else setTimeout(apply,850);
  const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',apply);
})();
