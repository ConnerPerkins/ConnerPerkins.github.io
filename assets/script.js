// Small interactive helpers: menu toggle and smooth scrolling
document.addEventListener('DOMContentLoaded',function(){
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if(navToggle){
    navToggle.addEventListener('click',()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if(nav){
        nav.style.display = expanded ? 'none' : 'block';
      }
    });
  }

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const href = a.getAttribute('href');
      if(href && href.startsWith('#')){
        const el = document.querySelector(href);
        if(el){
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth',block:'start'});
          // Close mobile nav after clicking
          if(window.innerWidth <= 600 && nav){
            nav.style.display = 'none';
            if(navToggle) navToggle.setAttribute('aria-expanded','false');
          }
        }
      }
    });
  });
});

// Tabs: accessible pattern with keyboard support
function initTabs(root = document){
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));

  if(!tabs.length) return;

  function activateTab(tab){
    tabs.forEach(t=>{
      const selected = (t === tab);
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(p=>{
      const show = p.id === tab.getAttribute('aria-controls');
      if(show) p.removeAttribute('hidden'); else p.setAttribute('hidden','');
    });

    tab.focus();
  }

  tabs.forEach((tab, i)=>{
    tab.addEventListener('click', ()=> activateTab(tab));
    tab.addEventListener('keydown', (e)=>{
      const key = e.key;
      let idx = tabs.indexOf(tab);
      if(key === 'ArrowRight') idx = (idx + 1) % tabs.length;
      else if(key === 'ArrowLeft') idx = (idx - 1 + tabs.length) % tabs.length;
      else if(key === 'Home') idx = 0;
      else if(key === 'End') idx = tabs.length - 1;
      else return;
      e.preventDefault();
      activateTab(tabs[idx]);
    });
  });
}

// initialize tabs inside the page
// Resume preview helper
function initResumePreview(root = document){
  const iframe = root.getElementById('resume-preview');
  const link = root.getElementById('resume-download');
  const linkWrapper = root.getElementById('resume-link');
  // If a static resume is bundled at assets/resume.pdf, show it by default.
  const staticPath = 'assets/resume.pdf';
  let currentURL = null;
  // Fetch the PDF as a blob and load it into an object URL so the browser
  // doesn't trigger a download due to server headers. This preserves an
  // in-browser preview even if the server sets Content-Disposition: attachment.
  fetch(staticPath).then(resp => {
    if(!resp.ok) throw new Error('Resume not found');
    return resp.blob();
  }).then(blob => {
    if(currentURL) URL.revokeObjectURL(currentURL);
    currentURL = URL.createObjectURL(blob);
    if(iframe){ iframe.src = currentURL; iframe.removeAttribute('hidden'); }
    if(link && linkWrapper){ link.href = currentURL; linkWrapper.removeAttribute('hidden'); }
  }).catch(()=>{
    // If fetch fails (offline/file://), fall back to assigning the static path
    // which may still display when served normally.
    try{ if(iframe){ iframe.src = staticPath; iframe.removeAttribute('hidden'); } if(link && linkWrapper){ link.href = staticPath; linkWrapper.removeAttribute('hidden'); } }catch(e){}
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initTabs(document);
  initResumePreview(document);
});
