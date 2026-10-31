/** Read a conventional RIFF/WAVE sample rate without decoding audio. */
export function wavSampleRate(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength<12)return null;
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),id=i=>String.fromCharCode(bytes[i],bytes[i+1],bytes[i+2],bytes[i+3]);
 if(id(0)!=='RIFF'||id(8)!=='WAVE')return null;
 const limit=Math.min(bytes.byteLength,v.getUint32(4,true)+8);let offset=12;
 while(offset+8<=limit){const size=v.getUint32(offset+4,true),end=offset+8+size;if(end>limit)return null;if(id(offset)==='fmt '){if(size<16)return null;const rate=v.getUint32(offset+12,true);return rate>=8000&&rate<=192000?rate:null;}offset=end+(size%2);}
 return null;
}
