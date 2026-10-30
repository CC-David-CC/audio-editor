// Keep exports inside the account-file workflow; the frame cannot download files.
const nativeClick=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute('download')){window.alert('Use Save WAV above the editor to save audio in Files.');return;}return nativeClick.call(this);};
window.codiAudio=PKAudioEditor.init('app');
