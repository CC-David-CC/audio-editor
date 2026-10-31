# Audio Editor

The Audio Editor embeds the upstream AudioMass editor in a per-window frame.
Use Open from My files and Save WAV for the account-scoped
browser/server mirror. Import from a computer through Files first. The editor checks that the browser can decode a selected file before replacing the current track. Saving creates a separate 16-bit WAV; existing files are
version checked. The embedded app's download actions are disabled. Close warns
when supported edit operations have unsaved changes. Audio decoding and effects
run in the browser; audio is not sent to a separate editing service.

The Files integration supports a single audio track. AudioMass's multitrack
session and its own session exports are not yet saved through Files; Save WAV
reports that limitation rather than silently dropping tracks. Files up to 32 MiB
can be opened, while the mirror may impose a lower server file limit. Saving an
encoded WAV also has a 32 MiB cap; the file service can impose a lower limit.
Device audio codecs and memory limit which files can be decoded.

AudioMass upstream and its bundled third-party notices are packaged with the
app. `python3 apps/system/audio-editor/prepare.py` fetches the exact upstream
commit and verifies its SHA-256 before assembling ignored local dependencies;
run it before building. The upstream source files and output bundles are not
committed. Source: https://github.com/pkalogiros/AudioMass/tree/21f5ee1362a47be6f0dbe6e4969a15e43d21b044
