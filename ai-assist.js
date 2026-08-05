(()=>{
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const db=()=>window.tciDb;
  const routeFor=result=>result.content_type==='poll'?`/polls/${encodeURIComponent(result.slug)}`:result.content_type==='survey'?`/surveys/${encodeURIComponent(result.slug)}`:`/listings/${encodeURIComponent(result.slug)}`;

  function addStyles(){
    if(document.getElementById('tciAiAssistStyles'))return;
    const style=document.createElement('style');
    style.id='tciAiAssistStyles';
    style.textContent=`
      .tciSearchWrap{position:relative;flex:1;max-width:420px}.tciSearchWrap>.search{width:100%}
      .tciSearchResults{position:absolute;z-index:1000;top:calc(100% + 8px);left:0;right:0;background:#fff;border:1px solid #dce5ef;border-radius:16px;box-shadow:0 18px 50px rgba(7,27,52,.18);overflow:hidden}
      .tciSearchResults[hidden]{display:none}.tciSearchItem{display:block;padding:13px 15px;border-bottom:1px solid #edf2f7;color:#071b34;text-decoration:none}.tciSearchItem:last-child{border-bottom:0}.tciSearchItem:hover,.tciSearchItem:focus{background:#f4fbfb}.tciSearchItem strong{display:block}.tciSearchType{font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#138e8a}.tciSearchEmpty{padding:14px;color:#62748a}
      .tciAiPanel{margin-top:12px;padding:14px;border:1px solid #dce5ef;border-radius:14px;background:#f8fbfe}.tciAiPanel h3{margin:0 0 8px;font-size:15px}.tciAiStatus{font-size:13px;color:#62748a}.tciAiWarn{color:#8a5800}.tciAiHigh{color:#b42318}.tciAiGood{color:#15834d}.tciAiMatch{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid #e6edf5}.tciAiMatch:first-of-type{border-top:0}
      .tciRecommendedLink{display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit}.tciRecommendedLink+.tciRecommendedLink{margin-top:10px}.tciRecommendedRank{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e9f8f7;color:#087b77;font-weight:900}
      @media(max-width:800px){.tciSearchWrap{max-width:none;width:100%}}
    `;
    document.head.append(style);
  }

  function initAssistedSearch(){
    const input=document.querySelector('.header .search');
    if(!input||input.dataset.aiSearchReady)return;
    input.dataset.aiSearchReady='true';
    const wrap=document.createElement('div');wrap.className='tciSearchWrap';
    input.parentNode.insertBefore(wrap,input);wrap.append(input);
    const results=document.createElement('div');results.className='tciSearchResults';results.hidden=true;wrap.append(results);
    let timer=0,request=0;
    const close=()=>{results.hidden=true};
    input.addEventListener('input',()=>{
      clearTimeout(timer);const query=input.value.trim();
      if(query.length<2){close();return}
      timer=setTimeout(async()=>{
        const current=++request;results.hidden=false;results.innerHTML='<div class="tciSearchEmpty">Searching...</div>';
        const{data,error}=await db().rpc('search_public_content',{search_text:query,result_limit:8});
        if(current!==request)return;
        if(error){results.innerHTML='<div class="tciSearchEmpty">Search is temporarily unavailable.</div>';return}
        const rows=data||[];
        results.innerHTML=rows.length?rows.map(item=>`<a class="tciSearchItem" href="${routeFor(item)}"><span class="tciSearchType">${esc(item.content_type)}</span><strong>${esc(item.title)}</strong><span class="small">${esc(item.description||'Open this result')}</span></a>`).join(''):'<div class="tciSearchEmpty">No matching public content found.</div>';
      },250);
    });
    input.addEventListener('keydown',event=>{if(event.key==='Escape')close();if(event.key==='Enter'&&input.value.trim()){event.preventDefault();location.href='/polls?q='+encodeURIComponent(input.value.trim())}});
    document.addEventListener('click',event=>{if(!wrap.contains(event.target))close()});
  }

  async function initRecommendations(){
    if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
    const card=document.querySelector('.trending');
    if(!card||card.dataset.aiRecommendationsReady)return;
    card.dataset.aiRecommendationsReady='true';
    const{data,error}=await db().rpc('get_recommended_polls',{result_limit:3});
    if(error||!data?.length)return;
    const head=card.querySelector('.cardHead');
    card.innerHTML='';if(head)card.append(head);
    data.forEach((poll,index)=>{
      const link=document.createElement('a');link.className='rankRow tciRecommendedLink';link.href=`/polls/${encodeURIComponent(poll.slug)}`;
      link.innerHTML=`<div class="tciRecommendedRank">${index+1}</div><div><strong>${esc(poll.title)}</strong><div class="small">${Number(poll.ballot_count||0).toLocaleString()} ballot${Number(poll.ballot_count||0)===1?'':'s'} · Open now</div></div><span>›</span>`;
      card.append(link);
    });
    const all=card.querySelector('.cardHead a');if(all)all.href='/polls';
  }

  function renderDuplicatePanel(panel,rows){
    if(!rows.length){panel.innerHTML='<h3>Duplicate check</h3><div class="tciAiStatus tciAiGood">No similar poll titles found.</div>';return}
    panel.innerHTML='<h3>Possible duplicate titles</h3>'+rows.map(row=>`<div class="tciAiMatch"><span><strong>${esc(row.record_title)}</strong><span class="small"> ${esc(row.record_status)}</span></span><strong>${Math.round(Number(row.similarity_score)*100)}%</strong></div>`).join('')+'<div class="tciAiStatus tciAiWarn">Review these matches before creating the poll.</div>';
  }

  function renderModerationPanel(panel,result){
    const flags=result?.flags||[],risk=result?.risk||'none',score=Number(result?.score||0);
    panel.innerHTML=`<h3>Content review</h3><div class="tciAiStatus ${risk==='high'?'tciAiHigh':risk==='medium'?'tciAiWarn':'tciAiGood'}">Risk: ${esc(risk)} · Score ${score}/100</div>${flags.length?`<div class="small">Signals: ${flags.map(esc).join(', ')}</div>`:'<div class="small">No moderation signals detected.</div>'}`;
  }

  function initAdminAssistance(){
    if(location.pathname!=='/admin'&&location.pathname!=='/admin/')return;
    const form=document.getElementById('pollForm'),title=document.getElementById('pollTitle'),description=document.getElementById('pollDescription');
    if(!form||!title||!description||form.dataset.aiAssistReady)return;
    form.dataset.aiAssistReady='true';
    const duplicatePanel=document.createElement('div');duplicatePanel.className='tciAiPanel';duplicatePanel.innerHTML='<h3>Duplicate check</h3><div class="tciAiStatus">Enter a poll title to check for similar records.</div>';
    title.insertAdjacentElement('afterend',duplicatePanel);
    const moderationPanel=document.createElement('div');moderationPanel.className='tciAiPanel';moderationPanel.innerHTML='<h3>Content review</h3><div class="tciAiStatus">Enter a description to review content signals.</div>';
    description.insertAdjacentElement('afterend',moderationPanel);
    let titleTimer=0,descriptionTimer=0,lastDuplicates=[],lastModeration={risk:'none',score:0,flags:[]};
    const checkTitle=async()=>{
      const candidate=title.value.trim();if(candidate.length<3){lastDuplicates=[];duplicatePanel.innerHTML='<h3>Duplicate check</h3><div class="tciAiStatus">Enter at least three characters.</div>';return}
      duplicatePanel.innerHTML='<h3>Duplicate check</h3><div class="tciAiStatus">Checking existing polls...</div>';
      const{data,error}=await db().rpc('find_duplicate_content',{candidate_text:candidate,content_kind:'poll',exclude_record_id:null,similarity_threshold:.35});
      if(error){duplicatePanel.innerHTML='<h3>Duplicate check</h3><div class="tciAiStatus tciAiWarn">Unable to complete duplicate check.</div>';return}
      lastDuplicates=data||[];renderDuplicatePanel(duplicatePanel,lastDuplicates);
    };
    const checkDescription=async()=>{
      const text=description.value.trim();if(!text){lastModeration={risk:'none',score:0,flags:[]};renderModerationPanel(moderationPanel,lastModeration);return}
      const{data,error}=await db().rpc('moderation_assist',{input_text:text});
      if(error){moderationPanel.innerHTML='<h3>Content review</h3><div class="tciAiStatus tciAiWarn">Unable to complete content review.</div>';return}
      lastModeration=data||{risk:'none',score:0,flags:[]};renderModerationPanel(moderationPanel,lastModeration);
    };
    title.addEventListener('input',()=>{clearTimeout(titleTimer);titleTimer=setTimeout(checkTitle,300)});
    description.addEventListener('input',()=>{clearTimeout(descriptionTimer);descriptionTimer=setTimeout(checkDescription,300)});
    const original=form.onsubmit;
    form.onsubmit=async event=>{
      event.preventDefault();await Promise.all([checkTitle(),checkDescription()]);
      const strongDuplicate=lastDuplicates.some(item=>Number(item.similarity_score)>=.8);
      const highRisk=lastModeration.risk==='high';
      if((strongDuplicate||highRisk)&&!confirm('The assisted review found a strong duplicate or high-risk content signal. Continue creating this poll?'))return;
      if(typeof original==='function')return original.call(form,event);
    };
  }

  window.addEventListener('DOMContentLoaded',()=>{addStyles();initAssistedSearch();initRecommendations();setTimeout(initAdminAssistance,700)});
})();
