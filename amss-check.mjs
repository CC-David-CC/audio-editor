// Validate untrusted AudioMass session framing before its decoder allocates
// AudioBuffers. The project limit applies to both file and decoded PCM bytes.
export function checkSession(bytes){
 const max=128*1024*1024;if(!(bytes instanceof Uint8Array)||bytes.byteLength>max||bytes.byteLength<37)throw Error('Invalid or oversized project.');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let o=0;
 const take=n=>{if(!Number.isSafeInteger(n)||n<0||o+n>bytes.byteLength)throw Error('Truncated project.');const x=o;o+=n;return x};
 const u8=()=>v.getUint8(take(1)),u16=()=>v.getUint16(take(2),true),f32=()=>{const x=v.getFloat32(take(4),true);if(!Number.isFinite(x))throw Error('Invalid project value.');return x},str=()=>take(u8());
 if(u8()!==1||u8()!==65||u8()!==77||u8()!==83||u8()!==0)throw Error('Not an AudioMass project.');
 const nt=u16(),nc=u16(),na=u16(),nx=u16(),selT=u16(),selC=u16();if(!nt||nt>1024||nc>10000||na>10000||nx>10000||(selT!==65535&&selT>=nt)||(selC!==65535&&selC>=nc))throw Error('Unsupported project size.');
 for(let i=0;i<5;i++)f32();for(let i=0;i<nt;i++){u8();for(let j=0;j<3;j++)f32();str()}
 const audio=[];let allocated=0;for(let i=0;i<na;i++){const ch=u8(),rate=u16()+65536*u16(),len=u16()+65536*u16();str();if(!ch||ch>32||rate<3000||rate>384000||!len)throw Error('Unsupported project audio.');if(ch>2)throw Error('This editor supports mono or stereo audio; this project contains '+ch+' channels. The original is unchanged.');allocated+=ch*len*4;if(!Number.isSafeInteger(allocated)||allocated>max)throw Error('Project audio exceeds the memory limit.');audio.push({ch,rate,len})}
 for(let i=0;i<nc;i++){const track=u16(),sound=u16(),start=f32(),startIn=f32(),end=f32(),fadeIn=f32(),fadeOut=f32();str();if(track>=nt||sound>=na||start<0||startIn<0||end<startIn||end>audio[sound].len/audio[sound].rate+0.001||fadeIn<0||fadeOut<0)throw Error('Invalid project clip.');}
 for(let i=0;i<nx;i++){if(u16()>=nc||u16()>=nc)throw Error('Invalid project crossfade.');}
 let beatSettings=null;take((4-o%4)%4);take(allocated);while(o<bytes.byteLength){const start=take(8),tag=String.fromCharCode(bytes[start],bytes[start+1],bytes[start+2],bytes[start+3]);if(tag==='MRK\0'){const length=v.getUint32(start+4,true);if(length>65536)throw Error('Too many project markers.');take(length);take((4-o%4)%4);}else if(tag==='CDBT'){const flags=v.getUint32(start+4,true);if(beatSettings!==null||flags>3||(flags&2)&&!(flags&1))throw Error('Invalid project beat settings.');beatSettings={beat_on:!!(flags&1),beat_snap:!!(flags&2)};}else if(tag!=='BPM\0'&&tag!=='SIG\0')throw Error('Unsupported project metadata.');}
 return {beatSettings};
}
