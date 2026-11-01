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
for name in ['LICENSE','THIRD_PARTY_NOTICES.md']:(root/(name+'.txt')).write_bytes(archive.extractfile(archive.getmember(prefix+name)).read())
scripts=names[1:25]
html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="main.css"></head><body><div id="app"></div>'+''.join('<script src="'+s+'"></script>' for s in scripts)+'<script src="bootstrap.js"></script></body></html>'
(root/'index.html').write_text(html);(root/'bootstrap.js').write_bytes((HERE/'bootstrap.js').read_bytes())
assets=['node_modules/audiomass/'+n for n in names+['LICENSE.txt','THIRD_PARTY_NOTICES.md.txt','index.html','bootstrap.js']]
(HERE/'app.json').write_text(json.dumps({'assets':assets},indent=2)+'\n')
print('Prepared AudioMass',COMMIT)
