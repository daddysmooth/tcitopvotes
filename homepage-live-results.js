(()=>{
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  async function start(){
    if(location.pathname!=='/'&&location.pathname!=='/index.html')return;
    const panel=document.querySelector('.topList');
    if(!panel||panel.dataset.liveResultsReady)return;
    panel.dataset.liveResultsReady='true';
    const button=panel.querySelector('a.btn');
    const{data,error}=await window.tciDb.rpc('get_poll_results',{target_slug:'best-beach-in-turks-and-caicos'});
    if(error||!data?.length)return;
    const leaders=[...data].sort((a,b)=>Number(b.vote_count)-Number(a.vote_count)||String(a.option_label).localeCompare(String(b.option_label))).slice(0,2);
    panel.querySelectorAll('.rankRow').forEach(row=>row.remove());
    leaders.forEach((item,index)=>{
      const row=document.createElement('div');
      row.className='rankRow';
      row.innerHTML=`<div class="rank">${index+1}</div><img class="thumb" src="${esc(item.image_url||'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=160&q=80')}" alt=""><div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><strong>${esc(item.option_label)}</strong><span style="font-weight:900;color:#1477e6;background:#eaf3ff;border-radius:999px;padding:4px 9px">${Number(item.vote_percentage).toFixed(1)}%</span></div><div class="small">${Number(item.vote_count)} vote${Number(item.vote_count)===1?'':'s'} · ${Number(item.total_votes)} total selections</div></div><div class="rating">★</div>`;
      panel.insertBefore(row,button||null);
    });
  }
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
