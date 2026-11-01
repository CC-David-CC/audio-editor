// Receives bounded channel chunks, keeping sample conversion off the desktop thread.
let out,view,frames,channels,cursor,format,bytesPerSample,dataOffset,clippedSamples;
const limit=128*1024*1024;
self.onmessage=({data:m})=>{try{
 if(m.type==='start'){
  const {length,sampleRate,numberOfChannels}=m;format=m.format??'pcm16';
  if(!['pcm16','pcm24','float32'].includes(format))throw Error('Unsupported WAV format.');
  bytesPerSample=format==='pcm16'?2:format==='pcm24'?3:4;dataOffset=format==='float32'?56:44;
  const dataSize=length*numberOfChannels*bytesPerSample,size=dataOffset+dataSize+(dataSize%2);
  if(!Number.isSafeInteger(length)||length<1||!Number.isInteger(numberOfChannels)||numberOfChannels<1||numberOfChannels>32||!Number.isInteger(sampleRate)||sampleRate<1||sampleRate>384000||!Number.isSafeInteger(size)||size>limit)throw Error('Edited WAV exceeds the 128 MiB file limit.');
  frames=length;channels=numberOfChannels;cursor=0;clippedSamples=0;out=new ArrayBuffer(size);view=new DataView(out);
  const put=(p,s)=>{for(let i=0;i<s.length;i++)view.setUint8(p+i,s.charCodeAt(i));};
  put(0,'RIFF');view.setUint32(4,size-8,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,format==='float32'?3:1,true);view.setUint16(22,channels,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*channels*bytesPerSample,true);view.setUint16(32,channels*bytesPerSample,true);view.setUint16(34,bytesPerSample*8,true);
  if(format==='float32'){put(36,'fact');view.setUint32(40,4,true);view.setUint32(44,frames,true);put(48,'data');view.setUint32(52,dataSize,true);}else{put(36,'data');view.setUint32(40,dataSize,true);}self.postMessage({type:'ready'});
 }else if(m.type==='chunk'){
  if(!view||m.offset!==cursor||!Array.isArray(m.parts)||m.parts.length!==channels)throw Error('Invalid audio chunk.');
  const count=m.parts[0].length;if(!count||cursor+count>frames||m.parts.some(p=>!(p instanceof Float32Array)||p.length!==count))throw Error('Invalid audio chunk.');
  for(let i=0;i<count;i++)for(let c=0;c<channels;c++){
   const input=m.parts[c][i],offset=dataOffset+((cursor+i)*channels+c)*bytesPerSample;if(!Number.isFinite(input))throw Error('Audio contains a non-finite sample.');
   if(format==='float32')view.setFloat32(offset,input,true);
   else{if(input>1||input< -1)clippedSamples++;const v=Math.max(-1,Math.min(1,input));if(format==='pcm16')view.setInt16(offset,v<0?v*32768:v*32767,true);else{const sample=Math.trunc(v<0?v*8388608:v*8388607);view.setUint8(offset,sample&255);view.setUint8(offset+1,(sample>>8)&255);view.setUint8(offset+2,(sample>>16)&255);}}
  }
  cursor+=count;if(cursor===frames){const blob=new Blob([out],{type:'audio/wav'});out=null;view=null;self.postMessage({type:'done',blob,clippedSamples});}else self.postMessage({type:'ready'});
 }else throw Error('Invalid audio operation.');
 }catch(e){out=null;view=null;self.postMessage({type:'error',message:e.message});}
};
