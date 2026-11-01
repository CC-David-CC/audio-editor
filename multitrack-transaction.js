		// Called only after the desktop has validated and decoded the account file.
		// Keep the existing editor mode, tracks and markers until application can
		// complete. A failure to restore is explicitly reported to the host.
		q.LoadDecodedSession = function ( next ) {
			var prior = cloneState (), was_on = IsOn (), old_editing = editing_clip;
			var old_markers = app.mrk ? app.mrk.serMt () : null, clearing = false;
			try {
				editing_clip = null;
				Toggle ( true );
				restoreState ( next );
				if (app.mrk) app.mrk.loadMt (next.markers, false);
				app.fireEvent ('DidUpdateMultitrack');
				clearing = true;
				app.fireEvent ('StateRequestClearAll');
			}
			catch (error) {
				try {
					restoreState ( prior );
					if (app.mrk) app.mrk.loadMt (old_markers, false);
					editing_clip = old_editing;
					if (!was_on) Toggle ( false );
				}
				catch (rollback) {
					var failure = new Error ('Project load failed and the previous session could not be fully restored. Save a copy of any remaining work.');
					failure.rollbackFailed = true;
					throw failure;
				}
				var failure = new Error (clearing ? 'Project load failed. The previous audio was restored, but undo history may have been lost.' : 'Project load failed. The previous session was restored.');
				failure.undoMayBeLost = clearing;
				throw failure;
			}
		};
