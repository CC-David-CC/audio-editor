# Audio Editor

The Audio Editor embeds the upstream AudioMass editor in a per-window frame.
Use File → Open from My files and File → Save WAV for the account-scoped browser/server mirror. File → Save WAV as chooses a path; File → WAV save options provides the destination folder and precision controls. Saved audio can reopen from Files or the restored desktop layout. Import from a computer through Files first. The editor checks that the browser can decode a selected file before replacing the current track. Saving creates a separate WAV; existing files are version checked. Save options offers 16-bit PCM (the compatible default), 24-bit PCM, and 32-bit float. PCM clips samples outside −1 to 1; float retains finite values outside that range, though playback can clip. The browser processes audio as 32-bit float, so export cannot restore precision already lost in the source; PCM conversion does not apply dither. Conventional RIFF/WAVE input is decoded at its source sample rate when the browser supports it; if that rate is unsupported or the source rate cannot be determined (including compressed formats), the editor decodes at the browser audio rate and reports that the original rate may differ. Compressed inputs are exported as uncompressed WAV, and the original bit depth is not automatically retained. The embedded app's download actions are disabled. Close warns when supported edit operations have unsaved changes, when the microphone is active, or while its permission request is pending. Closing stops streams owned by that editor window; another editor window keeps its own streams. Stop recording and close its dialog before opening or saving a file. Audio decoding and effects
run in the browser; audio is not sent to a separate editing service.

Use the File menu's **Try 440 Hz tone** to begin without an existing file. For more than one track, switch to MultiTrack, add tracks from My files and use **Save MultiTrack project** to keep the editable session. **Save WAV** is for a single track; use **Export MultiTrack mixdown WAV** for combined audio. A mixdown is not an editable project. Input and encoded WAV output are limited to 128 MiB. WAV encoding runs in a worker and can be cancelled; decoding and effects can require much more memory than the compressed input, so large files may still fail on a device with limited memory. A compressed file can also expand beyond the WAV output limit.
Device audio codecs and memory limit which files can be decoded.

Only one account-file chooser can be pending in a window. If the audio changes
while choosing, the selection is not opened; choose the file again. Closing the
window invalidates a pending chooser result. This does not cancel a file write
already sent to storage.

AudioMass upstream and its bundled third-party notices are packaged with the
app. `python3 apps/system/audio-editor/prepare.py` fetches the exact upstream
commit and verifies its SHA-256 before assembling ignored local dependencies;
run it before building. The upstream source files and output bundles are not
committed. Source: https://github.com/pkalogiros/AudioMass/tree/21f5ee1362a47be6f0dbe6e4969a15e43d21b044

Local desktop, phone-sized and 4K-sized tests and live desktop and phone-sized tests check a 32 kHz WAV through upload, sample-checked reverse, 16-bit, 24-bit and float save and fresh-session reopen, invalid-file recovery, close warning, stale-save protection and sync. An earlier live phone-sized run encountered the server request limit during consecutive rapid sync tests; a later run passed after the limit cleared. Local 4K-sized and simulated unsupported-rate fallback tests also passed. An isolated local test also opens and saves an audio file larger than 32 MiB, verifies sample data and synchronizes it to the server. A separate worker test creates a 128 MiB WAV and verifies that larger output is rejected; that is not an end-to-end 128 MiB file test. Those checks do not cover every effect, multitrack saving, physical phone touch or codec. The separate MultiTrack tests below cover project save and mixdown.

A simulated-microphone lifecycle test covers two independent windows, the New Recording dialog, active and delayed capture, and declining or accepting the close warning on local desktop and phone-sized views and a live phone-sized view. It does not prove physical microphone behavior.

A separate notice reports when My files detects that the opened source, or the most recently saved WAV, has changed, is unavailable, or has conflicting copies. The loaded track stays open. Resolve a conflict in Files; save a separate copy or reopen a changed file as needed. Detection depends on the mirror checking the server. A conflict found during export is reported as a local copy needing resolution. Local desktop, emulated-phone and 4K and live emulated-phone account tests check source changes, a conflict during export, audio samples and fresh-session recovery; a local close test checks that the file listener is released.

Choose **Try 440 Hz tone** to generate a one-second mono example locally without uploading a file or granting microphone access. It uses the browser audio rate and a short fade at each end; it is unsaved until exported as WAV. Loading it asks before discarding unsaved audio. Local desktop, emulated-phone and 4K and live emulated-phone account tests cover reverse, sample-checked WAV output, sync and fresh-session reopening.

After a load error, a newly generated tone is still treated as unsaved. Local
desktop and emulated-phone tests inject a load failure and check the close
warning, sample-checked WAV save, server synchronization and reopening. This
does not reproduce every possible browser or decoder failure.

AudioMass effects that use asynchronous OfflineAudioContext rendering must finish before opening, replacing or saving the track; if one is still running, the editor asks you to wait and try again. A saved or opened file is the track restored with the desktop window. Starting a new unsaved example clears the prior file reference; the example itself is not recovered after a page reload unless saved. Local desktop, emulated-phone and 4K and live emulated-phone tests hold a Reverse render, verify Save waits, check the resulting WAV sample, and test both restored and unsaved window states. Other effects and physical touch remain unverified.

Closing a window while an effect or WAV save is still in progress asks for
confirmation, even if the track was clean when the operation began. Keep the
window open to let it finish. Closing during an already dispatched file write
does not guarantee that the write can be cancelled.

The current release moves account-file actions into AudioMass’s File menu and suppresses the delayed automatic welcome screen; Help retains the explicit welcome action. A fallback toolbar remains if the pinned editor menu cannot be found. Local desktop, emulated-phone and 4K-sized tests cover menu clicks, save options, replacement cancellation and stale-target protection, Save As, server sync and reopening. One parallel phone run timed out at login; a separate rerun passed. Physical touch remains unverified. The updated desktop and emulated-phone account workflow also covers upload, reverse, WAV precision and fresh-session recovery; independent simulated microphone cleanup passed in both sizes. Desktop layout restoration, source conflict handling and missing-menu fallback passed locally. The AudioMass, Tone and WaveSurfer integration test passed locally on desktop and emulated-phone views; its first run waited on a newly themed discard prompt until the test was updated. A local file larger than 32 MiB also opened, saved, synced and retained its samples.

Re-running prepare.py preserves the WAV worker declaration. The prepared build was retested for save and reopen on desktop and emulated phone; its phone File menu and actions now have 44 px targets, checked with emulated taps. Physical phone behavior remains unverified.

Live release 859caf0f2820d451752a6f213c7c5de4597a5f2c295813cb18efc2a9333ea9af serves the integrated File menu and touch sizing. Public registered-account desktop and emulated-phone tests passed menu actions, save options, cancel and concurrent-change checks, Save As, server sync and reopen. Their empty test homes were verified and both test accounts disabled. Physical phone touch remains unverified.

Ctrl/Command+S while focused in AudioMass saves a WAV through My files. Local
desktop and emulated-phone tests verified server-synced WAV samples; physical
touch and Mac shortcuts remain unverified.

In MultiTrack, **File → Add MultiTrack audio from My files** imports an audio
file from the account drive into a track. The app checks that it can be decoded
before handing it to AudioMass and asks before closing during the import. It
also keeps the separate drag-from-computer path. The upstream multitrack sample
link is omitted because its MP3 assets are not packaged; the empty view points
to My files instead. Save an editable MultiTrack project with **File → Save MultiTrack project** and reopen it with **File → Open MultiTrack project**. The AudioMass `.amss` format retains tracks, audio, clip positions and mixer settings, and this desktop also retains beat/snap enabled state in an additional metadata record. Other AudioMass tools may ignore or remove that record. Long UTF-8 names may be shortened. A separate stereo mixdown can be exported using **File → Export MultiTrack mixdown WAV**; the WAV contains rendered audio, not editable tracks. Local desktop and emulated-phone tests import WAV files, verify rendered timing and samples, check server synchronization, reject invalid input and exercise failure and close guards. They observed no third-party HTTP requests in those flows. Large files
can require much more memory during the two decodes. Physical touch, other
audio formats, full multitrack editing and hardware audio remain unverified.
No third-party account or cloud feature was removed in this review.

Changing the beat controls marks the session unsaved, so closing prompts before discarding changes. Saved tempo and beat/snap enabled state restore in an editable project. Desktop and emulated-phone account tests and a live emulated-phone test cover a tempo change, close cancellation, save and reopen. Physical touch remains unverified.

If an ordinary audio file used to restore a window is missing or cannot be
decoded, its failed restore reference is cleared; the original file is left
untouched. Local desktop and emulated-phone account tests cover invalid and
missing WAV files, generating and saving a tone, server sync and refresh.
Physical touch and audio hardware remain unverified.

WAV Save As and the save-folder chooser serialize with other file operations.
If the filename, audio content or buffer changes while either dialog is open,
the stale selection is rejected and the user can try again. Local registered-
account desktop and emulated-phone tests cover both stale choices, a successful
WAV save, server sync and fresh-session reopen. The audio edit in the race was
injected through an editor event; physical touch remains unverified.

The File menu places the 440 Hz example immediately after Open from My files,
and the initial status points to that example. Local registered-account desktop
and emulated-phone checks followed the example through an effect, WAV save,
server sync, and fresh-session reopen. The MultiTrack mixdown workflow also
passed in both layouts, including timed clips, mute and sampled WAV output.
Physical phone touch and audio hardware remain unverified.

The MultiTrack mode control is reachable with Tab and reports whether it is
pressed. Enter and Space keep focus on the control after switching modes. Local
registered-account desktop and phone-sized tests exercised keyboard activation,
adding a track from My files, saving and syncing an editable project, and
reopening it in a fresh session. Phone tests used simulated hardware keys;
physical touch and assistive technology behavior remain unverified.
