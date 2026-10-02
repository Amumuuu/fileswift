const tabs=[...document.querySelectorAll('[role="tab"]')];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function play(element,className){
  if(reducedMotion.matches)return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}
const screenshots=[
  {src:'assets/filename.png',width:940,height:950,label:'文件名称查找',alt:'文件名称查找界面，支持关键词与格式筛选'},
  {src:'assets/pdf.png',width:1220,height:795,label:'加密图纸处理',alt:'PDF 权限处理界面，显示文件统计与待处理文件清单'}
];
const screenshotLoads=new Map();
let selectedTab=0;
function loadScreenshot(index){
  if(!screenshotLoads.has(index)){
    const preload=new Image();preload.src=screenshots[index].src;
    const ready=preload.decode().catch(error=>{screenshotLoads.delete(index);throw error;});
    screenshotLoads.set(index,ready);
  }
  return screenshotLoads.get(index);
}
async function selectTab(index){
  if(index===selectedTab)return;
  selectedTab=index;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=i!==index;});
  play(document.getElementById(tabs[index].getAttribute('aria-controls')),'tab-enter');
  const image=document.getElementById('detail-image');
  const viewport=document.querySelector('.detail-viewport');
  const status=document.getElementById('shot-status');
  viewport.setAttribute('aria-busy','true');status.textContent='正在加载截图…';
  try{
    await loadScreenshot(index);
    if(index!==selectedTab)return;
    const shot=screenshots[index];
    image.width=shot.width;image.height=shot.height;image.src=shot.src;image.alt=shot.alt;
    const link=document.getElementById('detail-preview');link.href=shot.src;link.setAttribute('aria-label',`放大查看${shot.label}界面`);
    document.getElementById('shot-label').textContent=shot.label;
    viewport.scrollTop=0;status.textContent='';
  }catch{
    if(index===selectedTab)status.textContent='截图加载失败，请切换标签重试';
  }finally{
    if(index===selectedTab)viewport.removeAttribute('aria-busy');
  }
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(index));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(next);tabs[next].focus();}});});
tabs.forEach((tab,index)=>{['pointerenter','focus'].forEach(type=>tab.addEventListener(type,()=>{loadScreenshot(index).catch(()=>{});}));});

const imageDialog=document.getElementById('image-dialog');
const previewImage=document.getElementById('preview-image');
const zoomButton=document.getElementById('image-zoom');
document.querySelectorAll('[data-image-preview]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const source=link.querySelector('img');
  previewImage.src=source.src;previewImage.alt=source.alt;previewImage.width=source.width;previewImage.height=source.height;
  document.getElementById('image-dialog-title').textContent=source.id==='detail-image'?document.getElementById('shot-label').textContent:'FileSwift 工作台';
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
paths.download='M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5';
document.querySelectorAll('[data-icon]').forEach(element=>{element.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[element.dataset.icon]}"/></svg>`;});
document.getElementById('copy-email').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('Cato_chen@163.com');status.textContent='邮箱已复制';}catch{status.textContent='请手动复制邮箱：Cato_chen@163.com';}});

// Share links open normally; only package URLs use the download attribute.
const downloadDialog=document.getElementById('download-dialog');
const downloadConfig=window.FILESWIFT_DOWNLOAD||{};
let downloadUrl=null;
try{
  if(downloadConfig.url){
    const candidate=new URL(downloadConfig.url,location.href);
    const allowed=downloadConfig.mode==='share'?['https:','http:']:['https:','http:','file:'];
    if(allowed.includes(candidate.protocol))downloadUrl=candidate;
  }
}catch{ /* Leave the contact option available if the URL is invalid. */ }
if(downloadUrl){
  document.querySelectorAll('[data-download-cta]').forEach(element=>element.textContent='下载 FileSwift');
  document.querySelector('.header nav a[href="#download"]').textContent='下载软件';
  document.getElementById('download-eyebrow').textContent='03 / 下载软件';
  const share=downloadConfig.mode==='share';
  document.getElementById('download-label').textContent=share?'前往百度网盘下载':'下载 Windows 版';
  document.getElementById('download-meta').textContent=share?'Windows 桌面版 · 将在新标签页打开百度网盘':'Windows 应用 · 本地文件处理';
  if(share&&downloadConfig.extractionCode){
    document.getElementById('share-code').hidden=false;
    document.getElementById('share-code-value').textContent=downloadConfig.extractionCode;
  }
}
document.getElementById('copy-share-code').addEventListener('click',async()=>{
  const status=document.getElementById('share-code-status');
  try{await navigator.clipboard.writeText(downloadConfig.extractionCode||'');status.textContent='提取码已复制';}
  catch{status.textContent='请手动复制上方提取码';}
});
document.getElementById('download-button').addEventListener('click',()=>{
  if(downloadUrl){
    const link=document.createElement('a');link.href=downloadUrl.href;link.rel='noopener noreferrer';
    if(downloadConfig.mode==='share')link.target='_blank';
    else link.download=downloadConfig.filename||'FileSwift_V6_6.exe';
    document.body.append(link);link.click();link.remove();return;
  }
  downloadDialog.showModal();
});
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

