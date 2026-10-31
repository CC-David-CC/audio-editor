# Audio Editor

The Audio Editor embeds the upstream AudioMass editor in a per-window frame.
Use Open from My files and Save WAV for the account-scoped browser/server mirror. Choose a destination folder under Save location. Saved audio can reopen from Files or the restored desktop layout. Import from a computer through Files first. The editor checks that the browser can decode a selected file before replacing the current track. Saving creates a separate 16-bit WAV; existing files are
version checked. Conventional RIFF/WAVE input is decoded at its source sample rate when the browser supports it; if that rate is unsupported or the source rate cannot be determined (including compressed formats), the editor decodes at the browser audio rate and reports that the original rate may differ. Output is 16-bit WAV, so bit depth and compressed formats are not preserved. The embedded app's download actions are disabled. Close warns
when supported edit operations have unsaved changes. Audio decoding and effects
run in the browser; audio is not sent to a separate editing service.

The Files integration supports a single audio track. AudioMass's multitrack
session and its own session exports are not yet saved through Files; Save WAV
reports that limitation rather than silently dropping tracks. Input and encoded WAV output are limited to 128 MiB. WAV encoding runs in a worker and can be cancelled; decoding and effects can require much more memory than the compressed input, so large files may still fail on a device with limited memory. A compressed file can also expand beyond the WAV output limit.
Device audio codecs and memory limit which files can be decoded.

AudioMass upstream and its bundled third-party notices are packaged with the
app. `python3 apps/system/audio-editor/prepare.py` fetches the exact upstream
commit and verifies its SHA-256 before assembling ignored local dependencies;
run it before building. The upstream source files and output bundles are not
committed. Source: https://github.com/pkalogiros/AudioMass/tree/21f5ee1362a47be6f0dbe6e4969a15e43d21b044

Local and live desktop and phone-sized tests check a 32 kHz WAV through upload, sample-checked reverse, save and fresh-session reopen, invalid-file recovery, close warning, stale-save protection and sync. Local 4K-sized and simulated unsupported-rate fallback tests also passed. An isolated local test also opens and saves an audio file larger than 32 MiB, verifies sample data and synchronizes it to the server. A separate worker test creates a 128 MiB WAV and verifies that larger output is rejected; that is not an end-to-end 128 MiB file test. Tests do not cover every effect, multitrack saving, physical phone touch or codecs.
