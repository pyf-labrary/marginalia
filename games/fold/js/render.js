'use strict';
// Canvas 绘制：纸面/厚度/背面点纹/洞的凹陷/折线高亮/翻页动画
let grain=null,dots=null;
function makePatterns(){
  const g=document.createElement('canvas');g.width=g.height=64;const gc=g.getContext('2d');const id=gc.createImageData(64,64);
  for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=Math.random()<.5?18:0;}
  gc.putImageData(id,0,0);grain=ctx.createPattern(g,'repeat');
  const d=document.createElement('canvas');d.width=d.height=8;const dc=d.getContext('2d');dc.fillStyle='rgba(0,0,0,.28)';dc.beginPath();dc.arc(2,2,1.1,0,7);dc.fill();dc.beginPath();dc.arc(6,6,1.1,0,7);dc.fill();dots=ctx.createPattern(d,'repeat');
}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;r=Math.max(0,Math.min(255,Math.round(r*k)));g=Math.max(0,Math.min(255,Math.round(g*k)));b=Math.max(0,Math.min(255,Math.round(b*k)));return `rgb(${r},${g},${b})`;}
function paperRect(c,x,y,w,h,st){
  // st = {c,back,holes,n,edgeR,edgeB}
  if(st.c<0)return;
  c.fillStyle=PAL[st.c];c.fillRect(x,y,w,h);
  if(grain){c.fillStyle=grain;c.fillRect(x,y,w,h);}
  if(st.back&&dots){c.fillStyle=dots;c.fillRect(x,y,w,h);}
  // 光：左上微亮
  const lg=c.createLinearGradient(x,y,x+w,y+h);lg.addColorStop(0,'rgba(255,255,255,.10)');lg.addColorStop(1,'rgba(0,0,0,.08)');c.fillStyle=lg;c.fillRect(x,y,w,h);
  if(st.holes){ // 顶上有洞，看到的是下层：内阴影表示凹陷
    const d=Math.min(w,h)*.22;
    let g1=c.createLinearGradient(x,y,x,y+d);g1.addColorStop(0,'rgba(0,0,0,.45)');g1.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g1;c.fillRect(x,y,w,d);
    let g2=c.createLinearGradient(x,y,x+d,y);g2.addColorStop(0,'rgba(0,0,0,.35)');g2.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g2;c.fillRect(x,y,d,h);
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);
  }
  // 厚度：右/下沿露出的纸边
  const th=Math.min(1.4*st.n,w*.25);
  if(st.edgeB&&th>0){c.fillStyle=shade(PAL[st.c],.72);c.fillRect(x,y+h,w,th);for(let i=1;i<st.n&&i<9;i++){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(x,y+h+i*1.4,w,.6);}}
  if(st.edgeR&&th>0){c.fillStyle=shade(PAL[st.c],.6);c.fillRect(x+w,y,th,h+(st.edgeB?th:0));}
}
function cellInfo(cells,k){const st=cells.get(k);if(!st)return null;const v=topVis(st);if(v.c<0)return null;return {c:v.c,back:v.back,holes:v.holes,n:st.length};}
function drawSheet(c,cells,origin,cs,skip){
  const infos=[];
  for(const k of cells.keys()){if(skip&&skip(k))continue;const i=cellInfo(cells,k);if(!i)continue;const [x,y]=DEC(k);i.x=x;i.y=y;
    const r=cellInfo(cells,KEY(x+1,y)),b=cellInfo(cells,KEY(x,y+1));
    i.edgeR=!r||(skip&&skip(KEY(x+1,y)))||r.n<i.n;i.edgeB=!b||(skip&&skip(KEY(x,y+1)))||b.n<i.n;infos.push(i);}
  // 影
  c.save();
  for(const i of infos){c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=6+i.n*2.5;c.shadowOffsetX=2+i.n*.9;c.shadowOffsetY=3+i.n*1.3;c.fillStyle='#000';c.fillRect(origin.x+i.x*cs,origin.y+i.y*cs,cs,cs);}
  c.restore();
  for(const i of infos)paperRect(c,origin.x+i.x*cs,origin.y+i.y*cs,cs,cs,i);
  // 格线（可折的线）
  c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=1;
  for(const i of infos){const x=origin.x+i.x*cs,y=origin.y+i.y*cs;const r=cells.get(KEY(i.x+1,i.y)),b=cells.get(KEY(i.x,i.y+1));
    if(r&&!(skip&&skip(KEY(i.x+1,i.y)))){c.beginPath();c.moveTo(x+cs+.5,y);c.lineTo(x+cs+.5,y+cs);c.stroke();}
    if(b&&!(skip&&skip(KEY(i.x,i.y+1)))){c.beginPath();c.moveTo(x,y+cs+.5);c.lineTo(x+cs,y+cs+.5);c.stroke();}}
  // 纸面上的洞落到桌面：虚线框标出「这里本该有纸」
  c.save();c.setLineDash([4,4]);c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=1;
  for(const k of cells.keys()){if(skip&&skip(k))continue;if(cellInfo(cells,k))continue;const [x,y]=DEC(k);c.strokeRect(origin.x+x*cs+3.5,origin.y+y*cs+3.5,cs-7,cs-7);}
  c.restore();
  // 外沿
  c.strokeStyle='rgba(0,0,0,.35)';
  for(const i of infos){const x=origin.x+i.x*cs,y=origin.y+i.y*cs;
    const nb=[[0,-1,x,y,x+cs,y],[-1,0,x,y,x,y+cs],[1,0,x+cs,y,x+cs,y+cs],[0,1,x,y+cs,x+cs,y+cs]];
    for(const [dx,dy,ax,ay,bx,by] of nb){const nk=KEY(i.x+dx,i.y+dy);if(!cellInfo(cells,nk)||(skip&&skip(nk))){c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();}}}
}
function lineHighlight(c,mv,origin,cs,cells,alpha,color){
  const b=bounds(cells);c.save();c.globalAlpha=alpha;c.strokeStyle=color||'#f2d27a';c.lineWidth=3;c.setLineDash([10,7]);c.lineDashOffset=-performance.now()/40;c.shadowColor=color||'#f2d27a';c.shadowBlur=12;
  c.beginPath();
  if(mv.ax==='v'){const x=origin.x+mv.L*cs;c.moveTo(x,origin.y+b.y0*cs-8);c.lineTo(x,origin.y+b.y1*cs+8);}else{const y=origin.y+mv.L*cs;c.moveTo(origin.x+b.x0*cs-8,y);c.lineTo(origin.x+b.x1*cs+8,y);}
  c.stroke();c.restore();
}
function flapTint(c,mv,origin,cs,cells,alpha){
  c.save();c.globalAlpha=alpha;c.fillStyle='#f2d27a';
  for(const k of cells.keys())if(isFlap(k,mv)){const [x,y]=DEC(k);if(cellInfo(cells,k))c.fillRect(origin.x+x*cs,origin.y+y*cs,cs,cs);}
  c.restore();
}
function arrowHint(c,mv,origin,cs,cells,t){
  // 从翻页一侧的重心，弧线越过折线到镜像位置
  const b=bounds(cells);let sx,sy,ex,ey;
  if(mv.ax==='v'){const lx=origin.x+mv.L*cs;const cy=origin.y+(b.y0+b.h/2)*cs;const far=mv.side==='lo'?origin.x+b.x0*cs:origin.x+b.x1*cs;sx=(far+lx)/2;sy=cy;ex=lx+(lx-sx);ey=cy;}
  else{const ly=origin.y+mv.L*cs;const cx=origin.x+(b.x0+b.w/2)*cs;const far=mv.side==='lo'?origin.y+b.y0*cs:origin.y+b.y1*cs;sx=cx;sy=(far+ly)/2;ex=cx;ey=ly+(ly-sy);}
  const p=(Math.sin(t/450)+1)/2;
  c.save();c.globalAlpha=.55+.45*p;c.strokeStyle='#f2d27a';c.fillStyle='#f2d27a';c.lineWidth=4;c.lineCap='round';c.shadowColor='#f2d27a';c.shadowBlur=14;
  const mx=(sx+ex)/2,my=(sy+ey)/2,lift=Math.hypot(ex-sx,ey-sy)*.45;const cxp=mv.ax==='v'?mx:mx-lift,cyp=mv.ax==='v'?my-lift:my;
  c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(cxp,cyp,ex,ey);c.stroke();
  const ang=Math.atan2(ey-cyp,ex-cxp);c.translate(ex,ey);c.rotate(ang);c.beginPath();c.moveTo(0,0);c.lineTo(-14,-8);c.lineTo(-14,8);c.closePath();c.fill();
  c.restore();
}
function drawTarget(){
  const r=tcv.getBoundingClientRect();if(!r.width)return;tcv.width=r.width*DPR;tcv.height=r.height*DPR;tctx.setTransform(DPR,0,0,DPR,0,0);tctx.clearRect(0,0,r.width,r.height);
  if(!G)return;const t=G.target;const cs=Math.floor(Math.min((r.width-30)/t.w,(r.height-44)/t.h,44));const ox=(r.width-t.w*cs)/2,oy=(r.height-20-t.h*cs)/2;
  tctx.save();tctx.shadowColor='rgba(0,0,0,.5)';tctx.shadowBlur=10;tctx.shadowOffsetY=4;tctx.fillStyle='#000';
  for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++)if(t.a[y*t.w+x]>=0)tctx.fillRect(ox+x*cs,oy+y*cs,cs,cs);
  tctx.restore();
  for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++){const v=t.a[y*t.w+x];if(v<0){continue;}paperRect(tctx,ox+x*cs,oy+y*cs,cs,cs,{c:v,back:false,holes:0,n:0});}
  tctx.strokeStyle='rgba(0,0,0,.25)';tctx.lineWidth=1;
  for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++)if(t.a[y*t.w+x]>=0)tctx.strokeRect(ox+x*cs+.5,oy+y*cs+.5,cs-1,cs-1);
  // 空格（洞落桌面）画虚框
  tctx.setLineDash([3,3]);tctx.strokeStyle='rgba(255,255,255,.18)';
  for(let y=0;y<t.h;y++)for(let x=0;x<t.w;x++)if(t.a[y*t.w+x]<0)tctx.strokeRect(ox+x*cs+2.5,oy+y*cs+2.5,cs-5,cs-5);
  tctx.setLineDash([]);
  tctx.fillStyle='#8d8676';tctx.font='12px '+getComputedStyle(document.body).fontFamily;tctx.textAlign='center';tctx.fillText(`${t.w} × ${t.h}`,r.width/2,r.height-6);
}

let lastT=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  requestAnimationFrame(frame);
  if(!G||!W)return;
  // 桌面
  ctx.clearRect(0,0,W,H);
  const vg=ctx.createRadialGradient(W*.45,H*.4,40,W*.5,H*.5,Math.max(W,H)*.8);vg.addColorStop(0,'#24262c');vg.addColorStop(1,'#111216');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  // 相机
  const k=1-Math.exp(-dt*7);G.origin.x+=(G.originT.x-G.origin.x)*k;G.origin.y+=(G.originT.y-G.origin.y)*k;
  let ox=G.origin.x,oy=G.origin.y;
  if(G.shake>0){G.shake-=dt;const s=G.shake*6;ox+=(Math.random()-.5)*s;oy+=(Math.random()-.5)*s;}
  const origin={x:ox,y:oy},cs=G.cs;
  const A=G.anim;
  if(A){
    const t=Math.min(1,(now-A.t0)/A.dur);const e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;const th=e*Math.PI;
    drawSheet(ctx,A.pre,origin,cs,k=>isFlap(k,A.mv));
    // 翻页的影
    const cos=Math.cos(th),sin=Math.sin(th);
    const flap=[];for(const k of A.pre.keys())if(isFlap(k,A.mv)){const st=A.pre.get(k);const [x,y]=DEC(k);const top=topVis(st),bot=bottomVis(st);flap.push({x,y,st,top,bot});}
    const lineP=A.mv.ax==='v'?origin.x+A.mv.L*cs:origin.y+A.mv.L*cs;
    const rects=flap.map(f=>{
      let rx,ry,rw,rh;
      if(A.mv.ax==='v'){const d0=origin.x+f.x*cs-lineP,d1=d0+cs;const p0=lineP+d0*cos,p1=lineP+d1*cos;rx=Math.min(p0,p1);rw=Math.abs(p1-p0);ry=origin.y+f.y*cs;rh=cs;}
      else{const d0=origin.y+f.y*cs-lineP,d1=d0+cs;const p0=lineP+d0*cos,p1=lineP+d1*cos;ry=Math.min(p0,p1);rh=Math.abs(p1-p0);rx=origin.x+f.x*cs;rw=cs;}
      return {f,rx,ry,rw,rh};
    });
    ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=10+sin*30;ctx.shadowOffsetX=4+sin*18;ctx.shadowOffsetY=6+sin*22;ctx.fillStyle='#000';
    for(const r of rects)if((th<Math.PI/2?r.f.top.c:r.f.bot.c)>=0)ctx.fillRect(r.rx,r.ry,r.rw,r.rh);ctx.restore();
    for(const r of rects){const face=th<Math.PI/2?r.f.top:r.f.bot;if(face.c<0)continue;
      // 竖起时露出侧面：一点厚度色
      paperRect(ctx,r.rx,r.ry,Math.max(r.rw,1.5),Math.max(r.rh,1.5),{c:face.c,back:face.back,holes:th<Math.PI/2?r.f.top.holes:0,n:r.f.st.length,edgeR:false,edgeB:false});
      // 翻到背面时亮度略变，暗示光照方向
      ctx.fillStyle=`rgba(0,0,0,${(th<Math.PI/2?0:.12)*(1-Math.abs(cos))})`;ctx.fillRect(r.rx,r.ry,r.rw,r.rh);}
    lineHighlight(ctx,A.mv,origin,cs,A.pre,.5*(1-t),'#ffffff');
    if(t>=1){G.anim=null;G.cells=A.post;fitCamera(false);afterMove();}
  }else{
    drawSheet(ctx,G.cells,origin,cs,null);
    if(G.won&&G.winT){const p=Math.min(1,(now-G.winT)/600);ctx.save();ctx.globalAlpha=(1-p)*.5;ctx.fillStyle='#f2d27a';const b=bounds(G.cells);ctx.fillRect(origin.x+b.x0*cs-8*p,origin.y+b.y0*cs-8*p,b.w*cs+16*p,b.h*cs+16*p);ctx.restore();}
    // 拖动预览
    if(drag&&drag.mv){flapTint(ctx,drag.mv,origin,cs,G.cells,.18);lineHighlight(ctx,drag.mv,origin,cs,G.cells,.9);}
    // 提示 / 教学
    if(G.hint&&now<G.hint.until){lineHighlight(ctx,G.hint.mv,origin,cs,G.cells,.7);arrowHint(ctx,G.hint.mv,origin,cs,G.cells,now);}
    else if(G.tutorial&&G.moves===0&&!drag){const sol=hintMove();if(sol){lineHighlight(ctx,sol,origin,cs,G.cells,.5);arrowHint(ctx,sol,origin,cs,G.cells,now);}}
  }
}

