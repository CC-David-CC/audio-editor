// Keep exports inside the account-file workflow; the frame cannot download files.
const nativeClick=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute('download')){window.alert('Use Save WAV above the editor to save audio in Files.');return;}return nativeClick.call(this);};
// Streams belong to this window. Stop them on close, including a permission
// request that resolves after the desktop has begun disposing the frame.
const capturedStreams=new Set();let mediaReleased=false,mediaPending=0;
const media=navigator.mediaDevices;
if(media?.getUserMedia){
 const originalGetUserMedia=media.getUserMedia.bind(media);
 media.getUserMedia=async (...args)=>{
  if(mediaReleased)throw new DOMException('Audio editor closed.','AbortError');
  let stream;mediaPending++;try{stream=await originalGetUserMedia(...args)}finally{mediaPending--;}
  if(mediaReleased){stream.getTracks().forEach(track=>track.stop());throw new DOMException('Audio editor closed.','AbortError');}
  for(const old of capturedStreams)if(old.getTracks().every(track=>track.readyState==='ended'))capturedStreams.delete(old);
  capturedStreams.add(stream);
  for(const track of stream.getTracks())track.addEventListener('ended',()=>{if(stream.getTracks().every(t=>t.readyState==='ended'))capturedStreams.delete(stream)},{once:true});
  return stream;
 };
}
window.codiMediaActive=()=>mediaPending>0||[...capturedStreams].some(stream=>stream.getTracks().some(track=>track.readyState==='live'));
window.codiReleaseMedia=()=>{mediaReleased=true;for(const stream of capturedStreams)for(const track of stream.getTracks())track.stop();capturedStreams.clear();};
// AudioMass applies several effects with asynchronous OfflineAudioContext
// rendering. Keep the old track in place until the effect has completed.
let audioRenderPending=0;
const offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
if(offline?.prototype?.startRendering){
 const start=offline.prototype.startRendering;
 offline.prototype.startRendering=function(...args){
  audioRenderPending++;let result;
  try{result=start.apply(this,args);}catch(error){audioRenderPending--;throw error;}
  if(result&&typeof result.then==='function')return result.finally(()=>{audioRenderPending--;});
  audioRenderPending--;return result;
 };
}
window.codiAudioRenderPending=()=>audioRenderPending>0;
window.codiAudio=PKAudioEditor.init('app');
