const tabs=[...document.querySelectorAll('[role="tab"]')];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function play(element,className){
  if(reducedMotion.matches)return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}
const screenshots=[
  {
    "src": "assets/find-v7.png",
    "width": 1502,
    "height": 932,
    "label": "文件批量查找",
    "caption": "软件实拍 · V7.0",
    "alt": "FileSwift V7.0 文件批量查找实际界面"
  },
  {
    "src": "assets/drawing-v7.png",
    "width": 1502,
    "height": 932,
    "label": "图纸智能处理",
    "caption": "软件实拍 · V7.0",
    "alt": "FileSwift V7.0 图纸智能处理实际界面"
  },
  {
    "src": "assets/cad-v7.png",
    "width": 1920,
    "height": 1027,
    "label": "CAD快捷看图",
    "caption": "软件实拍 · V7.0",
    "alt": "FileSwift V7.0 CAD快捷看图实际界面"
  },
  {
    "src": "assets/rename-v7.png",
    "width": 1592,
    "height": 988,
    "label": "批量改名工具",
    "caption": "界面实拍 · 路径已隐藏",
    "alt": "FileSwift V7.0 批量改名界面，个人路径已隐藏"
  },
  {
    "src": "assets/pdf.webp",
    "width": 1502,
    "height": 932,
    "label": "加密图纸破解",
    "caption": "界面示意 · V7.0",
    "alt": "加密图纸破解功能示意，非 V7.0 实拍"
  }
];
const screenshotLoads=new Map();
let selectedTab=0;
function loadScreenshot(index,priority='low'){
  if(!screenshotLoads.has(index)){
    const preload=new Image();preload.decoding='async';preload.fetchPriority=priority;
    const ready=new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{preload.onload=null;preload.onerror=null;reject(new Error('图片加载超时'));},12000);
      preload.onload=()=>{clearTimeout(timer);resolve(preload);};
      preload.onerror=()=>{clearTimeout(timer);reject(new Error('图片加载失败'));};
      preload.src=screenshots[index].src;
    }).catch(error=>{screenshotLoads.delete(index);throw error;});
    screenshotLoads.set(index,ready);
  }
  return screenshotLoads.get(index);
}
async function selectTab(index){
  if(index===selectedTab&&!document.getElementById('shot-status').textContent)return;
  selectedTab=index;
  const strip=tabs[index].parentElement;
  const tabBox=tabs[index].getBoundingClientRect(),stripBox=strip.getBoundingClientRect();
  if(tabBox.left<stripBox.left)strip.scrollLeft+=tabBox.left-stripBox.left;
  else if(tabBox.right>stripBox.right)strip.scrollLeft+=tabBox.right-stripBox.right;
  document.getElementById('shot-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(tabs.length).padStart(2,'0')}`;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=i!==index;});
  play(document.getElementById(tabs[index].getAttribute('aria-controls')),'tab-enter');
  const image=document.getElementById('detail-image');
  const viewport=document.querySelector('.detail-viewport');
  const status=document.getElementById('shot-status');
  viewport.setAttribute('aria-busy','true');status.textContent='正在加载截图…';
  try{
    await loadScreenshot(index,'high');
    if(index!==selectedTab)return;
    const shot=screenshots[index];
    image.width=shot.width;image.height=shot.height;image.src=shot.src;image.alt=shot.alt;
    const link=document.getElementById('detail-preview');link.href=shot.src;link.setAttribute('aria-label',`放大查看${shot.label}界面`);
    document.getElementById('shot-label').textContent=shot.label;
    document.getElementById('shot-caption').textContent=shot.caption;
    viewport.scrollTop=0;status.textContent='';
  }catch{
    if(index===selectedTab)status.textContent='图片加载较慢，点击当前功能重试';
  }finally{
    if(index===selectedTab)viewport.removeAttribute('aria-busy');
  }
}

// Warm the gallery near the viewport, one image at a time to limit bandwidth.
let galleryWarmed=false;
async function warmGallery(){
  if(galleryWarmed)return;
  galleryWarmed=true;
  const start=selectedTab;
  for(let offset=0;offset<screenshots.length;offset++){
    await loadScreenshot((start+offset)%screenshots.length).catch(()=>{});
  }
}
const initialScreenshot=document.getElementById('detail-image');
function reportImageError(){document.getElementById('shot-status').textContent='图片加载较慢，点击当前功能重试';}
initialScreenshot.addEventListener('error',reportImageError);
if(initialScreenshot.complete&&!initialScreenshot.naturalWidth)reportImageError();
if('IntersectionObserver' in window){
  const galleryObserver=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){galleryObserver.disconnect();warmGallery();}
  },{rootMargin:'400px'});
  galleryObserver.observe(document.querySelector('.detail-shot'));
}else{
  addEventListener('load',warmGallery,{once:true});
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(index));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(next);tabs[next].focus();}});});
tabs.forEach((tab,index)=>{['pointerenter','focus'].forEach(type=>tab.addEventListener(type,()=>{loadScreenshot(index).catch(()=>{});}));});

document.getElementById('shot-prev').addEventListener('click',()=>selectTab((selectedTab+tabs.length-1)%tabs.length));
document.getElementById('shot-next').addEventListener('click',()=>selectTab((selectedTab+1)%tabs.length));

const imageDialog=document.getElementById('image-dialog');
const previewImage=document.getElementById('preview-image');
const zoomButton=document.getElementById('image-zoom');
document.querySelectorAll('[data-image-preview]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const source=link.querySelector('img');
  previewImage.src=source.src;previewImage.alt=source.alt;previewImage.width=source.width;previewImage.height=source.height;
  document.getElementById('image-dialog-title').textContent=source.id==='detail-image'?document.getElementById('shot-label').textContent:'FileSwift 软件概览';
  document.getElementById('image-original').href=link.href;
  imageDialog.classList.remove('original-size');zoomButton.setAttribute('aria-pressed','false');zoomButton.textContent='原始尺寸';
  imageDialog.showModal();
  const scroll=imageDialog.querySelector('.image-scroll');scroll.scrollTop=0;scroll.scrollLeft=0;
}));
zoomButton.addEventListener('click',()=>{
  const original=imageDialog.classList.toggle('original-size');
  zoomButton.setAttribute('aria-pressed',String(original));zoomButton.textContent=original?'适应窗口':'原始尺寸';
});
imageDialog.querySelector('.image-close').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('click',event=>{
  if(event.target!==imageDialog)return;
  const box=imageDialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)imageDialog.close();
});
const paths={search:'M4 5h13v10H4z M7 8h6 M17 16l5 5 M14 13a4 4 0 1 0 0 .01',content:'M5 3h9l4 4v7 M5 3v18h7 M14 3v5h5 M8 10h5 M8 13h3 M16 14a3 3 0 1 0 0 6a3 3 0 0 0 0-6 M18 19l4 3',rename:'M3 6h12v12H3z M7 14l2-5 2 5 M8 12h2 M18 3h4 M20 3v18 M18 21h4',drawing:'M5 3h10l4 4v5 M5 3v18h8 M15 3v5h5 M12 18l7-7 3 3-7 7h-3z',watermark:'M5 3h10l4 4v4 M5 3v18h6 M15 3v5h5 M12 12l5-3 5 7-5 3z M10 17l4 5',unlock:'M7 10V7a5 5 0 0 1 9-3 M4 10h16v12H4z M12 15v3'};
paths.cad='M12 2l9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10';
paths.quick='M13 2L4 14h7l-1 8 10-12h-7z';
paths.download='M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5';
document.querySelectorAll('[data-icon]').forEach(element=>{element.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[element.dataset.icon]}"/></svg>`;});
document.getElementById('copy-email').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('Cato_chen@163.com');status.textContent='邮箱已复制';}catch{status.textContent='请手动复制邮箱：Cato_chen@163.com';}});

// Download destinations are maintained in download-config.js.
const downloadDialog=document.getElementById('download-dialog');
const downloadConfig=window.FILESWIFT_DOWNLOAD||{};
const safeDownloadUrl=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const directUrl=safeDownloadUrl(downloadConfig.directUrl);
const acceleratedUrl=safeDownloadUrl(downloadConfig.acceleratedUrl);
const backupUrl=safeDownloadUrl(downloadConfig.backupUrl);
for(const [id,url] of [['download-accelerated',acceleratedUrl],['download-direct',directUrl],['download-backup',backupUrl]]){
  const link=document.getElementById(id);
  if(url)link.href=url;else link.hidden=true;
}
if(downloadConfig.version){
  document.querySelector('.brand-version').textContent=downloadConfig.pageVersion||downloadConfig.version;
  document.querySelector('.download-brand p').textContent=`${downloadConfig.pageVersion||downloadConfig.version} · Windows 桌面版`;
  document.getElementById('download-version').textContent=`${downloadConfig.pageVersion||downloadConfig.version} · Windows 桌面版`;
}
if(acceleratedUrl||directUrl||backupUrl){
  document.querySelectorAll('[data-download-cta]').forEach(el=>el.textContent='下载 FileSwift');
  document.querySelector('.header nav a[href="#download"]').textContent='下载软件';
  document.getElementById('download-eyebrow').textContent='03 / 下载软件';
  document.getElementById('download-label').textContent='下载 Windows 版';
  document.getElementById('download-meta').textContent='Windows 桌面应用 · 文件在本机处理';
}
const downloadButton=document.getElementById('download-button');
downloadButton.addEventListener('click',event=>{event.preventDefault();downloadDialog.showModal();});
downloadDialog.querySelectorAll('.dialog-close,.dialog-dismiss').forEach(button=>button.addEventListener('click',()=>downloadDialog.close()));
downloadDialog.addEventListener('click',event=>{
  if(event.target!==downloadDialog)return;
  const box=downloadDialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)downloadDialog.close();
});

// Reveal once, without scroll hijacking. Content remains visible without JS.
if('IntersectionObserver' in window){
  const reveals=document.querySelectorAll('.section-heading,.showcase,.feature,.workflow-strip,.download-card,.download-faq');
  reveals.forEach((element,index)=>{element.classList.add('reveal');if(element.classList.contains('feature'))element.style.setProperty('--reveal-delay',`${index%3*65}ms`);});
  document.body.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
  },{threshold:.1});
  reveals.forEach(element=>observer.observe(element));
}
const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
const sections=[...document.querySelectorAll('main>section')];
const navLinks=[...document.querySelectorAll('.header nav a')];
let scrollPending=false;
function updateScroll(){
  const total=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${total>0?Math.min(1,Math.max(0,scrollY/total)):0})`;
  const active=sections.filter(section=>section.getBoundingClientRect().top<innerHeight*.45).at(-1);
  navLinks.forEach(link=>{const selected=active&&link.getAttribute('href')===`#${active.id}`;link.classList.toggle('active',!!selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  scrollPending=false;
}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});
addEventListener('resize',updateScroll);updateScroll();
