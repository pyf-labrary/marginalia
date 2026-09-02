'use strict';
// 纸的模型与求解器：Map<key,Layer[]>，折叠=镜像+反序+翻面
// 一张纸 = Map<key, Layer[]>；key 编码格子绝对坐标；Layer = {f,b,up}（f 正面色、b 背面色、up 正面朝上）。洞 = f=b=-1。
const OFF=64, KEY=(x,y)=>(x+OFF)*256+(y+OFF), DEC=k=>[(k>>8)-OFF,(k&255)-OFF];
const PAL=['#efe6d2','#c9463d','#2f4c73','#d6a23f','#4f7f5c','#7b5590'];
const PALN=['素','朱','黛','藤黄','松','紫'];

function bounds(cells){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const k of cells.keys()){const [x,y]=DEC(k);if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}
  return {x0,y0,x1:x1+1,y1:y1+1,w:x1+1-x0,h:y1+1-y0};
}
function topVis(st){for(let i=st.length-1;i>=0;i--){const l=st[i],c=l.up?l.f:l.b;if(c>=0)return {c,back:!l.up,holes:st.length-1-i};}return {c:-1,back:false,holes:0};}
function bottomVis(st){for(let i=0;i<st.length;i++){const l=st[i],c=l.up?l.b:l.f;if(c>=0)return {c,back:l.up};}return {c:-1,back:false};}
function legalMoves(cells){
  const b=bounds(cells),m=[];
  for(let L=b.x0+1;L<b.x1;L++){m.push({ax:'v',L,side:'lo'});m.push({ax:'v',L,side:'hi'});}
  for(let L=b.y0+1;L<b.y1;L++){m.push({ax:'h',L,side:'lo'});m.push({ax:'h',L,side:'hi'});}
  return m;
}
function isFlap(k,mv){const [x,y]=DEC(k);const c=mv.ax==='v'?x:y;return mv.side==='lo'?c<mv.L:c>=mv.L;}
function fold(cells,mv){
  const out=new Map();
  for(const [k,st] of cells) if(!isFlap(k,mv)) out.set(k,st.slice());
  for(const [k,st] of cells) if(isFlap(k,mv)){
    const [x,y]=DEC(k);
    const nk=mv.ax==='v'?KEY(2*mv.L-1-x,y):KEY(x,2*mv.L-1-y);
    const tgt=out.get(nk)||[];
    for(let i=st.length-1;i>=0;i--){const l=st[i];tgt.push({f:l.f,b:l.b,up:!l.up});}
    out.set(nk,tgt);
  }
  return out;
}
function pattern(cells){
  const b=bounds(cells),a=new Array(b.w*b.h).fill(-1);
  for(const [k,st] of cells){const [x,y]=DEC(k);a[(y-b.y0)*b.w+(x-b.x0)]=topVis(st).c;}
  return {w:b.w,h:b.h,a};
}
function samePattern(p,q){if(p.w!==q.w||p.h!==q.h)return false;for(let i=0;i<p.a.length;i++)if(p.a[i]!==q.a[i])return false;return true;}
function ser(cells){
  const b=bounds(cells),ks=[...cells.keys()].sort((a,c)=>a-c);let s=b.w+'x'+b.h+'|';
  for(const k of ks){const [x,y]=DEC(k);s+=(x-b.x0)+','+(y-b.y0)+':';for(const l of cells.get(k)){s+=(l.up?l.f:l.b)+'/'+(l.up?l.b:l.f)+' ';}s+=';';}
  return s;
}
// BFS 求最短折法（cap 为最大深度），找不到返回 null
function solve(cells,target,cap){
  if(samePattern(pattern(cells),target))return [];
  const seen=new Set([ser(cells)]);let frontier=[{c:cells,p:[]}];
  for(let d=1;d<=cap;d++){
    const next=[];
    for(const n of frontier){
      for(const mv of legalMoves(n.c)){
        const c=fold(n.c,mv);
        if(samePattern(pattern(c),target))return n.p.concat([mv]);
        if(d<cap){const s=ser(c);if(!seen.has(s)){seen.add(s);next.push({c,p:n.p.concat([mv])});}}
      }
    }
    frontier=next;if(!frontier.length)break;
  }
  return null;
}

