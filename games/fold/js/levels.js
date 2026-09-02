'use strict';
// 章节/关卡定义与程序生成（带求解器验证最少折数）
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// [w,h,折数,颜色数,双面,洞数]
const CH=[
 {name:'对折',desc:'拖动纸的一侧越过一条格线，它就翻过去盖在另一侧上。翻过去的那面朝下，露出的是纸背——素色。',lv:[[3,3,1,2],[3,3,1,3],[4,4,1,3],[4,4,2,2],[4,4,2,3],[4,4,2,3]]},
 {name:'层叠',desc:'纸越折越厚。盖在上面的挡住下面的，最后只看最上面一层。顺序决定一切。',lv:[[5,5,2,3],[5,4,3,3],[5,5,3,3],[5,5,3,4],[6,6,3,3],[6,6,4,3]]},
 {name:'双面',desc:'这批纸两面都印了色。翻过去露出的不再是素色，而是背面的图案。看见点纹，就是在看纸背。',lv:[[4,4,2,3,1],[4,4,2,3,1],[5,5,3,3,1],[5,5,3,4,1],[6,5,3,3,1],[6,6,4,3,1]]},
 {name:'镂空',desc:'有的格子被剪掉了。洞盖上来，透出的是下面那层；洞落在桌面上，就是空。',lv:[[4,4,2,3,0,1],[5,5,2,3,0,2],[5,5,3,3,0,2],[5,5,3,3,1,2],[6,6,3,4,1,3],[6,6,4,3,1,3]]},
];
const LEVELS=[];CH.forEach((c,ci)=>c.lv.forEach((l,li)=>LEVELS.push({ch:ci,idx:li,w:l[0],h:l[1],folds:l[2],colors:l[3],two:!!l[4],holes:l[5]||0})));
function dailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
const DAILY={ch:4,idx:0,w:6,h:6,folds:4,colors:3,two:true,holes:2,daily:true};

function fillPattern(rng,W,H,set,allowBlank){
  for(let tries=0;tries<20;tries++){
    const base=set[Math.floor(rng()*set.length)],a=new Array(W*H).fill(base);
    const n=2+Math.floor(rng()*3);
    for(let i=0;i<n;i++){
      const pool=allowBlank&&rng()<.3?[0]:set;const col=pool[Math.floor(rng()*pool.length)];
      const rw=1+Math.floor(rng()*Math.ceil(W*.6)),rh=1+Math.floor(rng()*Math.ceil(H*.6));
      const rx=Math.floor(rng()*(W-rw+1)),ry=Math.floor(rng()*(H-rh+1));
      for(let y=ry;y<ry+rh;y++)for(let x=rx;x<rx+rw;x++)a[y*W+x]=col;
    }
    if(new Set(a).size>=2)return a;
  }
  return new Array(W*H).fill(0).map((_,i)=>set[i%set.length]);
}
function genLevel(p,seed){
  const rng=mulberry32(seed);
  let last=null;
  for(let attempt=0;attempt<80;attempt++){
    const set=[1,2,3,4,5].sort(()=>rng()-.5).slice(0,p.colors);
    const front=fillPattern(rng,p.w,p.h,set,p.ch>=1),back=p.two?fillPattern(rng,p.w,p.h,set,true):null;
    const holes=new Set();while(holes.size<p.holes)holes.add(Math.floor(rng()*p.w*p.h));
    const cells=new Map();
    for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++){const i=y*p.w+x;cells.set(KEY(x,y),holes.has(i)?[{f:-1,b:-1,up:true}]:[{f:front[i],b:back?back[i]:0,up:true}]);}
    let c=cells;const seq=[];
    for(let i=0;i<p.folds;i++){const m=legalMoves(c);const mv=m[Math.floor(rng()*m.length)];seq.push(mv);c=fold(c,mv);}
    const target=pattern(c);
    const vis=new Set(target.a.filter(v=>v>=0));
    if(vis.size<2&&!(target.a.length===1))continue;
    if(target.a.every(v=>v<0))continue;
    last={cells,target,par:p.folds,seq};
    if(p.folds===1||solve(cells,target,p.folds-1)===null)return last;   // 最少折数恰好等于设计折数
  }
  const sol=solve(last.cells,last.target,last.par);last.par=sol?sol.length:last.par;return last;
}

