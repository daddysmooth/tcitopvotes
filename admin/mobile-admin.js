(()=>{
  const isMobile=()=>window.matchMedia('(max-width: 900px)').matches;
  const labels=new Map([
    ['Create Poll','Create a new poll'],
    ['Existing Polls','Manage published and draft polls'],
    ['Poll Options','Add and manage poll choices'],
    ['Rankings and Survey Operations','Open ranking and survey tools']
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
    toggle.textContent='Admin Tools';
    toggle.setAttribute('aria-expanded','false');
    toggle.onclick=()=>{
      tools.hidden=!tools.hidden;
      toggle.setAttribute('aria-expanded',String(!tools.hidden));
      toggle.textContent=tools.hidden?'Admin Tools':'Hide Admin Tools';
    };
    tools.before(toggle);
  }

  function compactStats(){
    const stats=document.querySelector('.adminStats');
    if(!stats||stats.dataset.mobileReady)return;
    stats.dataset.mobileReady='true';
    stats.setAttribute('aria-label','Administration statistics');
  }

  function cardTitle(card){
    return card.querySelector(':scope > h2')?.textContent?.trim()||card.querySelector(':scope > .cardHead h2')?.textContent?.trim()||'Administration Section';
  }

  function makeAccordion(card,index){
    if(card.dataset.accordionReady)return;
    const title=cardTitle(card);
    card.dataset.accordionReady='true';
    card.classList.add('adminAccordion');
    const header=document.createElement('button');
    header.type='button';
    header.className='adminAccordionHeader';
    header.setAttribute('aria-expanded','false');
    header.innerHTML=`<span><strong>${title}</strong><small>${labels.get(title)||'Tap to open'}</small></span><span class="adminAccordionIcon" aria-hidden="true">+</span>`;
    const body=document.createElement('div');
    body.className='adminAccordionBody';
    const directTitle=card.querySelector(':scope > h2');
    if(directTitle)directTitle.remove();
    const cardHead=card.querySelector(':scope > .cardHead');
    if(cardHead){
      const heading=cardHead.querySelector('h2');
      if(heading)heading.remove();
    }
    while(card.firstChild)body.append(card.firstChild);
    card.append(header,body);
    const setOpen=open=>{
      card.classList.toggle('isOpen',open);
      header.setAttribute('aria-expanded',String(open));
      header.querySelector('.adminAccordionIcon').textContent=open?'−':'+';
    };
    header.onclick=()=>setOpen(!card.classList.contains('isOpen'));
    if(index===0&&location.hash==='#create-poll')setOpen(true);
  }

  function enhancePollCards(){
    document.querySelectorAll('.adminPoll').forEach(card=>{
      if(card.dataset.tapReady)return;
      card.dataset.tapReady='true';
      card.classList.add('tapCard');
      const view=card.querySelector('a[href^="/polls/"]');
      if(view){
        card.setAttribute('role','link');
        card.tabIndex=0;
        const open=event=>{
          if(event.target.closest('a,button,input,select,textarea'))return;
          location.href=view.href;
        };
        card.addEventListener('click',open);
        card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open(event)}});
      }
    });
  }

  function enhanceSections(){
    if(!isMobile())return;
    document.body.classList.add('mobileAdmin');
    compactHeroTools();
    compactStats();
    const cards=[...document.querySelectorAll('#adminContent > .adminGrid > .adminCard, #adminContent > .optionManager, #adminContent > [data-survey-overview]')];
    cards.forEach(makeAccordion);
    enhancePollCards();
  }

  const observer=new MutationObserver(()=>enhanceSections());
  function start(){
    enhanceSections();
    const content=document.getElementById('adminContent');
    if(content)observer.observe(content,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(start,850),{once:true});else setTimeout(start,850);
})();
