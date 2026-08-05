(()=>{
  const isAdminHome=()=>location.pathname==='/admin'||location.pathname==='/admin/';
  const isMobile=()=>window.matchMedia('(max-width:900px)').matches;
  const labels=new Map([
    ['Create Poll','Draft a new community poll'],
    ['Existing Polls','View, publish or pause polls'],
    ['Poll Options','Add and manage poll choices'],
    ['Rankings and Survey Operations','Open rankings, surveys and reports']
  ]);

  function compactHeroTools(){
    const hero=document.querySelector('.adminHero');
    const tools=hero?.querySelector('[data-admin-modules]');
    if(!hero||!tools||tools.dataset.mobileReady)return;
    tools.dataset.mobileReady='true';
    tools.classList.add('adminToolsGrid');
    tools.hidden=true;
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='btn light adminToolsToggle';
    toggle.textContent='Open Admin Tools';
    toggle.setAttribute('aria-expanded','false');
    toggle.onclick=()=>{
      const open=tools.hidden;
      tools.hidden=!open;
      toggle.setAttribute('aria-expanded',String(open));
      toggle.textContent=open?'Close Admin Tools':'Open Admin Tools';
    };
    tools.before(toggle);
  }

  function compactStats(){
    const stats=document.querySelector('.adminStats');
    if(!stats||stats.dataset.mobileStatsReady)return;
    const cards=[...stats.children];
    if(cards.length<5)return;
    stats.dataset.mobileStatsReady='true';
    stats.setAttribute('aria-label','Administration statistics');
    cards.forEach((card,index)=>{if(index>3)card.hidden=true});
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='btn light adminStatsToggle';
    toggle.textContent='More Statistics';
    toggle.setAttribute('aria-expanded','false');
    stats.after(toggle);
    toggle.onclick=()=>{
      const open=toggle.getAttribute('aria-expanded')!=='true';
      cards.slice(4).forEach(card=>card.hidden=!open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.textContent=open?'Fewer Statistics':'More Statistics';
    };
  }

  function cardTitle(card){
    return card.querySelector(':scope > h2')?.textContent?.trim()||card.querySelector(':scope > .cardHead h2')?.textContent?.trim()||'Administration Section';
  }

  function closeOtherAccordions(current){
    document.querySelectorAll('.adminAccordion.isOpen').forEach(card=>{
      if(card===current)return;
      card.classList.remove('isOpen');
      const header=card.querySelector(':scope > .adminAccordionHeader');
      if(header){header.setAttribute('aria-expanded','false');header.querySelector('.adminAccordionIcon').textContent='+'}
    });
  }

  function makeAccordion(card){
    if(card.dataset.mobileAccordionReady)return;
    const title=cardTitle(card);
    card.dataset.mobileAccordionReady='true';
    card.classList.add('adminAccordion');
    const header=document.createElement('button');
    header.type='button';
    header.className='adminAccordionHeader';
    header.setAttribute('aria-expanded','false');
    header.innerHTML=`<span><strong>${title==='Rankings and Survey Operations'?'Admin Tools':title}</strong><small>${labels.get(title)||'Tap to open'}</small></span><span class="adminAccordionIcon" aria-hidden="true">+</span>`;
    const body=document.createElement('div');
    body.className='adminAccordionBody';
    const directTitle=card.querySelector(':scope > h2');
    if(directTitle)directTitle.remove();
    const cardHead=card.querySelector(':scope > .cardHead');
    if(cardHead){const heading=cardHead.querySelector('h2');if(heading)heading.remove()}
    while(card.firstChild)body.append(card.firstChild);
    card.append(header,body);
    header.onclick=()=>{
      const open=!card.classList.contains('isOpen');
      closeOtherAccordions(card);
      card.classList.toggle('isOpen',open);
      header.setAttribute('aria-expanded',String(open));
      header.querySelector('.adminAccordionIcon').textContent=open?'−':'+';
      if(open)setTimeout(()=>card.scrollIntoView({behavior:'smooth',block:'start'}),80);
    };
  }

  function enhancePollCards(){
    document.querySelectorAll('#pollList .adminPoll').forEach(card=>{
      if(card.dataset.tapReady)return;
      card.dataset.tapReady='true';
      card.classList.add('tapCard');
      const view=card.querySelector('a[href^="/polls/"]');
      if(!view)return;
      card.setAttribute('role','link');
      card.tabIndex=0;
      card.addEventListener('click',event=>{
        if(event.target.closest('a,button,input,select,textarea'))return;
        location.href=view.href;
      });
      card.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();location.href=view.href}
      });
    });
  }

  function apply(){
    if(!isAdminHome()||!isMobile())return;
    document.body.classList.add('mobileAdmin');
    compactHeroTools();
    compactStats();
    document.querySelectorAll('#adminContent > .adminGrid > .adminCard, #adminContent > .optionManager, #adminContent > [data-survey-overview]').forEach(makeAccordion);
    enhancePollCards();
  }

  const observer=new MutationObserver(apply);
  function start(){apply();observer.observe(document.documentElement,{childList:true,subtree:true})}
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(start,850),{once:true});else setTimeout(start,850);
  window.addEventListener('resize',apply);
})();
