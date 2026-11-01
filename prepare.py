#!/usr/bin/env python3
"""Fetch a pinned upstream source archive into ignored local dependencies."""
import hashlib, io, json, pathlib, tarfile, urllib.request
HERE=pathlib.Path(__file__).resolve().parent
COMMIT='21f5ee1362a47be6f0dbe6e4969a15e43d21b044'
SHA='de7ed18349e4caed8d0025d56a3d620cbe79244f1345b3728089f5b55f834bf3'
url='https://codeload.github.com/pkalogiros/AudioMass/tar.gz/'+COMMIT
raw=urllib.request.urlopen(url,timeout=60).read()
if hashlib.sha256(raw).hexdigest()!=SHA:raise RuntimeError('AudioMass archive hash mismatch')
archive=tarfile.open(fileobj=io.BytesIO(raw),mode='r:gz');prefix='AudioMass-'+COMMIT+'/'
names=['main.css','dist/wavesurfer.js','dist/plugin/wavesurfer.regions.js','oneup.js','app.js','keys.js','markers.js','contextmenu.js','lufs.js','ui-fx.js','ui.js','modal.js','state.js','engine.js','actions.js','drag.js','recorder.js','welcome.js','fx-pg-eq.js','fx-auto.js','local.js','id3.js','lzma.js','amss-format.js','multitrack.js','wav.js','lame.js','flac.js','libflac.js','libflac.wasm','lz4-block-codec-wasm.js','lz4-block-codec.wasm','rnn_denoise.js','rnn_denoise.wasm','recorder-worklet.js','tempo-worker.js','fonts/icomoon.ttf','fonts/icomoon.woff','fonts/icomoon.svg']
root=HERE/'node_modules/audiomass';root.mkdir(parents=True,exist_ok=True)
for name in names:
 member=archive.getmember(prefix+'src/'+name)
 if not member.isfile():raise RuntimeError('Invalid archive member')
 target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(archive.extractfile(member).read())
# Preserve the explicit Help → See Welcome Message action, but suppress the
# delayed automatic welcome modal, which otherwise interrupts desktop actions.
welcome=root/'welcome.js'
source=welcome.read_text()
needle='\tPKAudioEditor._deps.Wlc ();\n\n}, 320);'
if source.count(needle)!=1:raise RuntimeError('Unexpected AudioMass welcome startup')
welcome.write_text(source.replace(needle,'\t// The desktop opens without an unsolicited welcome modal.\n\n}, 320);'))
# AudioMass's original LoadSessionBuffer catches errors and returns success even
# after modifying the current session. Expose a checked, rollback-capable entry
# point for the desktop's already validated and decoded account projects.
multitrack=root/'multitrack.js'
source=multitrack.read_text()
needle='\t\tq.getState = cloneState;\n'
if source.count(needle)!=1:raise RuntimeError('Unexpected AudioMass multitrack API')
adapter=(HERE/'multitrack-transaction.js').read_text()
source=source.replace(needle,needle+'\n'+adapter+'\n')
# A failed OfflineAudioContext render must not silently export the upstream
# fallback mixer: its panning and resampling can produce different audio.
# Keep upstream behavior for other callers; the desktop opts into strict mode.
for old,new in [
 ('function MixdownAsync ( selection, done ) {','function MixdownAsync ( selection, done, strict ) {'),
 ('finish ( Mixdown ( selection ) );','finish ( strict ? null : Mixdown ( selection ) );'),
 ('done ( Mixdown ( selection ) );','done ( strict ? null : Mixdown ( selection ) );'),
 ('var pan = render_ctx.createStereoPanner ? render_ctx.createStereoPanner () : null;\n\t\t\t\tvar when', 'var pan = render_ctx.createStereoPanner ? render_ctx.createStereoPanner () : null;\n\t\t\t\tif (strict && !pan) return finish ( null );\n\t\t\t\tvar when')]:
 if source.count(old)!=1:raise RuntimeError('Unexpected AudioMass mixdown fallback')
 source=source.replace(old,new)
# Beat controls are persisted in part by AudioMass, but upstream does not send
# its change event when they are edited. The desktop must guard unsaved work.
patches=[
 ('\t\t\tbeat_on = !!val;\n','\t\t\tvar changed = beat_on !== !!val;\n\t\t\tbeat_on = !!val;\n'),
 ('\t\t\tif (!beat_on) beat_snap = false;\n\t\t\tupdateBeatUI ();','\t\t\tif (!beat_on) beat_snap = false;\n\t\t\tif (changed) app.fireEvent (\'DidUpdateMultitrack\');\n\t\t\tupdateBeatUI ();'),
 ('\t\t\tbeat_snap = beat_on && !!val;\n\t\t\tupdateBeatUI ();','\t\t\tvar next = beat_on && !!val;\n\t\t\tvar changed = beat_snap !== next;\n\t\t\tbeat_snap = next;\n\t\t\tif (changed) app.fireEvent (\'DidUpdateMultitrack\');\n\t\t\tupdateBeatUI ();'),
 ('\t\t\t\tbeat_bpm = next;\n\t\t\t\trequestBeatGrid ();','\t\t\t\tbeat_bpm = next;\n\t\t\t\tapp.fireEvent (\'DidUpdateMultitrack\');\n\t\t\t\trequestBeatGrid ();'),
 ('\t\t\t\t\tbeat_sig = beat_sigs[(i + 1) % beat_sigs.length];\n','\t\t\t\t\tbeat_sig = beat_sigs[(i + 1) % beat_sigs.length];\n\t\t\t\t\tapp.fireEvent (\'DidUpdateMultitrack\');\n'),
 ('\t\t\tbeat_sig = \'4/4\';\n\t\t\tupdateBeatUI ();','\t\t\tbeat_sig = \'4/4\';\n\t\t\tapp.fireEvent (\'DidUpdateMultitrack\');\n\t\t\tupdateBeatUI ();')]
for old,new in patches:
 if source.count(old)!=1:raise RuntimeError('Unexpected AudioMass beat controls')
 source=source.replace(old,new)
multitrack.write_text(source)
for name in ['LICENSE','THIRD_PARTY_NOTICES.md']:(root/(name+'.txt')).write_bytes(archive.extractfile(archive.getmember(prefix+name)).read())
scripts=names[1:25]
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="main.css"></head><body><div id="app"></div>'+''.join('<script src="'+s+'"></script>' for s in scripts)+'<script src="bootstrap.js"></script></body></html>'
html=html.replace('<link rel="stylesheet" href="main.css">','<link rel="stylesheet" href="main.css"><link rel="stylesheet" href="frame.css">')
(root/'index.html').write_text(html);(root/'bootstrap.js').write_bytes((HERE/'bootstrap.js').read_bytes());(root/'frame.css').write_bytes((HERE/'frame.css').read_bytes())
assets=['node_modules/audiomass/'+n for n in names+['LICENSE.txt','THIRD_PARTY_NOTICES.md.txt','index.html','bootstrap.js','frame.css']]
(HERE/'app.json').write_text(json.dumps({'assets':assets,'workers':{'wav':'wav-worker.mjs'}},indent=2)+'\n')
print('Prepared AudioMass',COMMIT)
