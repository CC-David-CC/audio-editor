// Receives bounded channel chunks, keeping sample conversion off the desktop thread.
let out, view, frames, channels, cursor;
const limit=128*1024*1024;
self.onmessage=({data:m})=>{try{
 if(m.type==='start'){
  const {length,sampleRate,numberOfChannels}=m, size=44+length*numberOfChannels*2;
  if(!Number.isSafeInteger(length)||length<0||!Number.isInteger(numberOfChannels)||numberOfChannels<1||numberOfChannels>32||!Number.isInteger(sampleRate)||sampleRate<1||!Number.isSafeInteger(size)||size>limit)throw Error('Edited WAV exceeds the 128 MiB file limit.');
  frames=length;channels=numberOfChannels;cursor=0;out=new ArrayBuffer(size);view=new DataView(out);
  const put=(p,s)=>{for(let i=0;i<s.length;i++)view.setUint8(p+i,s.charCodeAt(i));};
  put(0,'RIFF');view.setUint32(4,size-8,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,size-44,true);self.postMessage({type:'ready'});
 }else if(m.type==='chunk'){
  if(!view||m.offset!==cursor||!Array.isArray(m.parts)||m.parts.length!==channels)throw Error('Invalid audio chunk.');
  const count=m.parts[0].length;if(!count||cursor+count>frames||m.parts.some(p=>!(p instanceof Float32Array)||p.length!==count))throw Error('Invalid audio chunk.');
  for(let i=0;i<count;i++)for(let c=0;c<channels;c++){const v=Math.max(-1,Math.min(1,m.parts[c][i]));view.setInt16(44+((cursor+i)*channels+c)*2,v<0?v*32768:v*32767,true);}
  cursor+=count;if(cursor===frames){const blob=new Blob([out],{type:'audio/wav'});out=null;view=null;self.postMessage({type:'done',blob});}else self.postMessage({type:'ready'});
 }else throw Error('Invalid audio operation.');
 }catch(e){out=null;view=null;self.postMessage({type:'error',message:e.message});}
};
