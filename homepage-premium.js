(()=>{
  async function ready(){for(let i=0;i<40;i++){if(window.tciDb)return window.tciDb;await new Promise(r=>setTimeout(r,100))}return null}
  async function init(){
    const db=await ready();if(!db)return;
    const toggle=document.getElementById('premiumMenuBtn'),sidebar=document.getElementById('premiumSidebar'),backdrop=document.getElementById('premiumBackdrop'),close=document.getElementById('premiumSidebarClose');
    const open=()=>{sidebar?.classList.add('open');backdrop?.classList.add('open');document.body.classList.add('menuOpen');toggle?.setAttribute('aria-expanded','true')};
    const shut=()=>{sidebar?.classList.remove('open');backdrop?.classList.remove('open');document.body.classList.remove('menuOpen');toggle?.setAttribute('aria-expanded','false')};
    toggle?.addEventListener('click',open);close?.addEventListener('click',shut);backdrop?.addEventListener('click',shut);document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
    const{data:{session}}=await db.auth.getSession();
    const authArea=document.getElementById('sidebarAuth');
    const adminLink=document.getElementById('sidebarAdmin');
    if(session){
      const name=session.user.user_metadata?.display_name||session.user.email?.split('@')[0]||'Member';
      if(authArea)authArea.innerHTML=`<a href="/profile" class="sidebarProfile"><strong>Hi, ${name}</strong><span>View your profile</span></a><button id="sidebarLogout" class="sidebarLogout" type="button">Log Out</button>`;
      document.getElementById('sidebarLogout')?.addEventListener('click',async()=>{await db.auth.signOut();location.href='/'});
      const{data:isAdmin}=await db.rpc('is_tci_admin',{check_user:session.user.id});
      if(adminLink)adminLink.hidden=!isAdmin;
    }else{
      if(authArea)authArea.innerHTML='<a class="sidebarSignIn" href="/auth?mode=login">Sign In</a><a class="sidebarCreate" href="/auth?mode=signup">Create Account</a>';
      if(adminLink)adminLink.hidden=true;
    }
  }
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();