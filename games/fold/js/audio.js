'use strict';
// WebAudio 合成音效：折纸沙沙、落纸、印章、五声三音
let AC=null,muted=localStorage.getItem('fold.mute')==='1';
function audio(){if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();}if(AC.state==='suspended')AC.resume();return AC;}
function noiseBuf(ac,len){const b=ac.createBuffer(1,ac.sampleRate*len,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
function sfxFold(){ if(muted)return; try{const ac=audio(),t=ac.currentTime;
  const s=ac.createBufferSource();s.buffer=noiseBuf(ac,.5);s.playbackRate.value=.8+Math.random()*.4;
  const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(2600,t+.25);f.Q.value=.9;
  const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+.42);
  s.connect(f).connect(g).connect(ac.destination);s.start(t);s.stop(t+.5);
  // 落纸的轻扑
  const o=ac.createOscillator(),og=ac.createGain();o.type='sine';o.frequency.setValueAtTime(140,t+.3);o.frequency.exponentialRampToValueAtTime(60,t+.42);
  og.gain.setValueAtTime(0,t+.3);og.gain.linearRampToValueAtTime(.25,t+.32);og.gain.exponentialRampToValueAtTime(.001,t+.5);o.connect(og).connect(ac.destination);o.start(t+.3);o.stop(t+.52);
}catch(e){}}
function sfxWin(){ if(muted)return; try{const ac=audio(),t=ac.currentTime;
  // 印章一击
  const s=ac.createBufferSource();s.buffer=noiseBuf(ac,.2);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=600;
  const g=ac.createGain();g.gain.setValueAtTime(.6,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);s.connect(f).connect(g).connect(ac.destination);s.start(t);
  const o=ac.createOscillator(),og=ac.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(45,t+.2);og.gain.setValueAtTime(.5,t);og.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(og).connect(ac.destination);o.start(t);o.stop(t+.32);
  // 三声五声音阶
  [523.25,659.25,783.99].forEach((fr,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=fr;const tt=t+.25+i*.11;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.18,tt+.02);g.gain.exponentialRampToValueAtTime(.001,tt+.6);o.connect(g).connect(ac.destination);o.start(tt);o.stop(tt+.65);});
}catch(e){}}
function sfxTick(){ if(muted)return; try{const ac=audio(),t=ac.currentTime;const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=1800;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.06);}catch(e){}}

