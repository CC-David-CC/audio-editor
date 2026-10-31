# Audio Editor

The Audio Editor embeds the upstream AudioMass editor in a per-window frame.
Use Open from My files and Save WAV for the account-scoped browser/server mirror. Choose a destination folder under Save location. Saved audio can reopen from Files or the restored desktop layout. Import from a computer through Files first. The editor checks that the browser can decode a selected file before replacing the current track. Saving creates a separate WAV; existing files are version checked. Save options offers 16-bit PCM (the compatible default), 24-bit PCM, and 32-bit float. PCM clips samples outside −1 to 1; float retains finite values outside that range, though playback can clip. The browser processes audio as 32-bit float, so export cannot restore precision already lost in the source; PCM conversion does not apply dither. Conventional RIFF/WAVE input is decoded at its source sample rate when the browser supports it; if that rate is unsupported or the source rate cannot be determined (including compressed formats), the editor decodes at the browser audio rate and reports that the original rate may differ. Compressed inputs are exported as uncompressed WAV, and the original bit depth is not automatically retained. The embedded app's download actions are disabled. Close warns when supported edit operations have unsaved changes, when the microphone is active, or while its permission request is pending. Closing stops streams owned by that editor window; another editor window keeps its own streams. Stop recording and close its dialog before opening or saving a file. Audio decoding and effects
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

Local desktop, phone-sized and 4K-sized tests and live desktop and phone-sized tests check a 32 kHz WAV through upload, sample-checked reverse, 16-bit, 24-bit and float save and fresh-session reopen, invalid-file recovery, close warning, stale-save protection and sync. An earlier live phone-sized run encountered the server request limit during consecutive rapid sync tests; a later run passed after the limit cleared. Local 4K-sized and simulated unsupported-rate fallback tests also passed. An isolated local test also opens and saves an audio file larger than 32 MiB, verifies sample data and synchronizes it to the server. A separate worker test creates a 128 MiB WAV and verifies that larger output is rejected; that is not an end-to-end 128 MiB file test. Tests do not cover every effect, multitrack saving, physical phone touch or codecs.

A simulated-microphone lifecycle test covers two independent windows, the New Recording dialog, active and delayed capture, and declining or accepting the close warning on local desktop and phone-sized views and a live phone-sized view. It does not prove physical microphone behavior.
