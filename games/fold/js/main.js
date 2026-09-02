'use strict';
// 状态、交互、UI
const $=s=>document.querySelector(s);
const cv=$('#c'),ctx=cv.getContext('2d'),tcv=$('#target'),tctx=tcv.getContext('2d');
let progress={};try{progress=JSON.parse(localStorage.getItem('fold.progress')||'{}');}catch(e){}
const cache={};
let G=null;   // {lvl,key,cells,target,par,hist:[],moves,cs,origin:{x,y},originT,anim,hint,won,hintUsed}
let DPR=1,W=0,H=0;

function levelKey(l){return l.daily?'daily-'+dailySeed():'L'+LEVELS.indexOf(l);}
function loadLevel(l){
  const key=levelKey(l);
  if(!cache[key]){const seed=l.daily?dailySeed()*31+7:1000+LEVELS.indexOf(l)*7919+l.w*13+l.folds;cache[key]=genLevel(l,seed);}
  const d=cache[key];
  G={lvl:l,key,cells:d.cells,target:d.target,par:d.par,hist:[],moves:0,anim:null,hint:null,won:false,hintUsed:false,winT:0,shake:0};
  fitCamera(true);
  $('#win').classList.remove('on');
  const c=l.daily?{name:'今日',desc:'按日期生成的一张纸，双面、带洞、四折。每天一张。'}:CH[l.ch];
  $('#chapText').innerHTML=`<b>${c.name}</b>${l.daily?'':'· 第 '+(l.idx+1)+' 张'}<br>${c.desc}`;
  $('#sSize').textContent=`${l.w}×${l.h}${l.two?' · 双面':''}${l.holes?' · '+l.holes+' 洞':''}`;
  drawTarget();updateStats();renderLevels();
  const best=progress[key];
  if(l===LEVELS[0]&&!best)G.tutorial=true;
}
function updateStats(){$('#sMoves').textContent=G.moves;$('#sPar').innerHTML=G.par+'<i>折</i>';}
function fitCamera(snap){
  const b=bounds(G.cells),l=G.lvl;
  const area={w:W-80,h:H-80};
  if(snap||!G.cs){G.cs=Math.max(28,Math.min(96,Math.floor(Math.min(area.w/(l.w*1.7+1),area.h/(l.h*1.7+1)))));}
  const cs=G.cs;
  G.originT={x:W/2-(b.x0+b.w/2)*cs,y:H/2-(b.y0+b.h/2)*cs};
  if(snap||!G.origin)G.origin={...G.originT};
}
function resize(){DPR=Math.min(2,devicePixelRatio||1);const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);if(G)fitCamera(true);drawTarget();}
addEventListener('resize',resize);

let drag=null;
function px(e){const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
cv.addEventListener('pointerdown',e=>{
  if(!G||G.anim||G.won)return;audio();
  const p=px(e),b=bounds(G.cells),cs=G.cs,o=G.origin;
  const gx=(p.x-o.x)/cs,gy=(p.y-o.y)/cs;
  if(gx<b.x0||gx>=b.x1||gy<b.y0||gy>=b.y1)return;
  drag={sx:p.x,sy:p.y,gx,gy,mv:null};cv.setPointerCapture(e.pointerId);cv.classList.add('dragging');G.tutorial=false;
});
cv.addEventListener('pointermove',e=>{
  if(!drag||!G||G.anim)return;
  const p=px(e),dx=p.x-drag.sx,dy=p.y-drag.sy,b=bounds(G.cells),cs=G.cs,o=G.origin;
  if(Math.hypot(dx,dy)<6){drag.mv=null;return;}
  let mv=null,crossed=false;
  if(Math.abs(dx)>=Math.abs(dy)){
    if(dx>0){for(let L=b.x0+1;L<b.x1;L++){const lx=o.x+L*cs;if(lx>drag.sx){mv={ax:'v',L,side:'lo'};crossed=p.x>=lx;break;}}}
    else{for(let L=b.x1-1;L>b.x0;L--){const lx=o.x+L*cs;if(lx<drag.sx){mv={ax:'v',L,side:'hi'};crossed=p.x<=lx;break;}}}
  }else{
    if(dy>0){for(let L=b.y0+1;L<b.y1;L++){const ly=o.y+L*cs;if(ly>drag.sy){mv={ax:'h',L,side:'lo'};crossed=p.y>=ly;break;}}}
    else{for(let L=b.y1-1;L>b.y0;L--){const ly=o.y+L*cs;if(ly<drag.sy){mv={ax:'h',L,side:'hi'};crossed=p.y<=ly;break;}}}
  }
  if(mv&&(!drag.mv||drag.mv.ax!==mv.ax||drag.mv.L!==mv.L))sfxTick();
  drag.mv=mv;
  if(mv&&crossed){doFold(mv);drag=null;cv.classList.remove('dragging');}
});
function endDrag(){drag=null;cv.classList.remove('dragging');}
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);

function doFold(mv){
  if(!G||G.anim||G.won)return;
  const post=fold(G.cells,mv);
  G.hist.push(G.cells);G.moves++;G.hint=null;
  G.anim={pre:G.cells,post,mv,t0:performance.now(),dur:520};
  sfxFold();updateStats();
}
function afterMove(){
  if(samePattern(pattern(G.cells),G.target)){
    G.won=true;G.winT=performance.now();G.shake=.18;sfxWin();
    const stars=G.moves<=G.par?3:G.moves<=G.par+1?2:1;
    const prev=progress[G.key];if(!prev||stars>prev)progress[G.key]=stars;localStorage.setItem('fold.progress',JSON.stringify(progress));
    $('#winStars').innerHTML=[1,2,3].map(i=>`<span class="${i<=stars?'':'off'}">★</span>`).join('');
    $('#winTitle').textContent=stars===3?'恰好折成':'折成';
    $('#winSub').textContent=`${G.moves} 折 · 最少 ${G.par} 折${G.hintUsed?' · 用了提示':''}`;
    setTimeout(()=>{$('#win').classList.add('on');renderLevels();},420);
  }
}
function undo(){if(!G||G.anim||!G.hist.length)return;G.won=false;$('#win').classList.remove('on');G.cells=G.hist.pop();G.moves--;G.hint=null;fitCamera(false);updateStats();sfxTick();}
function reset(){if(!G)return;const l=G.lvl;loadLevel(l);}
function hintMove(){const sol=solve(G.cells,G.target,Math.min(5,G.par+1));return sol&&sol.length?sol[0]:null;}
function hint(){
  if(!G||G.anim||G.won)return;
  const mv=hintMove();
  if(mv){G.hint={mv,until:performance.now()+2600};G.hintUsed=true;toast('沿亮线，把发亮的一侧翻过去');}
  else{toast('这条路折不到目标了——按 Z 退回去');}
}
function next(){const i=LEVELS.indexOf(G.lvl);if(i>=0&&i+1<LEVELS.length)loadLevel(LEVELS[i+1]);else loadLevel(DAILY);}
let toastT=null;function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2400);}
function setMute(m){muted=m;localStorage.setItem('fold.mute',m?'1':'0');$('#bMute').innerHTML=(m?'有声':'静音')+' <small>M</small>';}

$('#bUndo').onclick=undo;$('#bReset').onclick=reset;$('#bHint').onclick=hint;$('#bMute').onclick=()=>setMute(!muted);
$('#winReplay').onclick=reset;$('#winNext').onclick=next;
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey)return;const k=e.key.toLowerCase();
  if(k==='z')undo();else if(k==='r')reset();else if(k==='h')hint();else if(k==='m')setMute(!muted);else if(k==='n'&&G&&G.won)next();});

function renderLevels(){
  const f=$('#levels');f.innerHTML='';
  CH.forEach((c,ci)=>{const d=document.createElement('div');d.className='ch';d.innerHTML=`<div class="nm">${c.name}</div>`;const row=document.createElement('div');row.className='row';
    LEVELS.filter(l=>l.ch===ci).forEach(l=>{const t=document.createElement('div');t.className='tile'+(G&&G.lvl===l?' cur':'');const st=progress[levelKey(l)]||0;
      t.innerHTML=`<span>${l.idx+1}</span><span class="st">${[1,2,3].map(i=>`<i class="${i<=st?'on':''}"></i>`).join('')}</span>`;t.onclick=()=>loadLevel(l);row.appendChild(t);});
    d.appendChild(row);f.appendChild(d);});
  const d=document.createElement('div');d.className='ch';d.innerHTML='<div class="nm">每日</div>';const row=document.createElement('div');row.className='row';
  const t=document.createElement('div');t.className='tile daily'+(G&&G.lvl===DAILY?' cur':'');const st=progress[levelKey(DAILY)]||0;
  t.innerHTML=`<span>${String(dailySeed()).slice(4,6)}/${String(dailySeed()).slice(6)}</span><span class="st">${[1,2,3].map(i=>`<i class="${i<=st?'on':''}"></i>`).join('')}</span>`;t.onclick=()=>loadLevel(DAILY);row.appendChild(t);d.appendChild(row);f.appendChild(d);
}

makePatterns();resize();setMute(muted);
(function(){ // 从上次未打满的那张开始
  let start=LEVELS[0];for(const l of LEVELS){if((progress[levelKey(l)]||0)<3){start=l;break;}}
  loadLevel(start);
})();
requestAnimationFrame(frame);
// 调试/自测钩子
window.__FOLD={get G(){return G},fold,solve,pattern,loadLevel,LEVELS,DAILY,doFold,
  selfTest(){const c=new Map([[KEY(0,0),[{f:1,b:0,up:true}]],[KEY(1,0),[{f:2,b:0,up:true}]]]);const r=fold(c,{ax:'v',L:1,side:'lo'});const p=pattern(r);return p.w===1&&p.h===1&&p.a[0]===0&&r.get(KEY(1,0)).length===2;}};
