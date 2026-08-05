(()=>{
  const db=()=>window.tciDb;
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  async function start(){
    if(location.pathname!=='/admin'&&location.pathname!=='/admin/')return;
    const form=document.getElementById('pollForm'),title=document.getElementById('pollTitle'),description=document.getElementById('pollDescription'),category=document.getElementById('pollCategory');
    if(!form||!title||!description||!category||form.dataset.wordingAssistReady)return;
    form.dataset.wordingAssistReady='true';
    const panel=document.createElement('div');
    panel.className='tciAiPanel';
    panel.innerHTML='<h3>Poll wording support</h3><div class="tciAiStatus">Enter a topic, then generate a neutral community-poll draft.</div><button type="button" class="btn light" data-wording-generate style="margin-top:10px">Suggest Wording</button><div data-wording-output></div>';
    title.insertAdjacentElement('beforebegin',panel);
    const button=panel.querySelector('[data-wording-generate]'),output=panel.querySelector('[data-wording-output]');
    button.addEventListener('click',async()=>{
      const topic=title.value.trim();
      if(topic.length<3){output.innerHTML='<p class="tciAiStatus tciAiWarn">Enter at least three characters for the poll topic.</p>';return}
      const categoryText=category.options[category.selectedIndex]?.textContent?.trim()||'';
      button.disabled=true;button.textContent='Preparing suggestion...';
      const{data,error}=await db().rpc('assist_poll_wording',{topic_text:topic,category_text:categoryText});
      button.disabled=false;button.textContent='Suggest Wording';
      if(error||!data){output.innerHTML='<p class="tciAiStatus tciAiWarn">Wording support is temporarily unavailable.</p>';return}
      const guidance=Array.isArray(data.guidance)?data.guidance:[];
      output.innerHTML=`<div style="margin-top:12px"><strong>Suggested title</strong><p>${esc(data.title)}</p><strong>Suggested description</strong><p>${esc(data.description)}</p><strong>Neutral question</strong><p>${esc(data.neutral_prompt)}</p>${guidance.length?`<div class="small">${guidance.map(item=>'• '+esc(item)).join('<br>')}</div>`:''}<button type="button" class="btn primary" data-wording-apply style="margin-top:10px">Apply Suggestion</button></div>`;
      output.querySelector('[data-wording-apply]').addEventListener('click',()=>{
        title.value=data.title||title.value;
        description.value=data.description||description.value;
        title.dispatchEvent(new Event('input',{bubbles:true}));
        description.dispatchEvent(new Event('input',{bubbles:true}));
        output.insertAdjacentHTML('beforeend','<p class="tciAiStatus tciAiGood">Suggestion applied. Review and edit it before creating the poll.</p>');
      });
    });
  }
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(start,900),{once:true});else setTimeout(start,900);
})();
