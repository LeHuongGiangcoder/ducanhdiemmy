Drop the ceremony track here as `music.mp3`.

It is started by the "Save the Date" press on the intro screen — browsers only
allow audio to begin inside a real user gesture, which is why the music and the
reveal are the same tap.

Until the file exists the site behaves normally: the invitation opens silently
and the music toggle hides itself (see src/components/Invitation.js).

Suggested: 2–4 min, loops cleanly, exported at 128–160 kbps to keep it under
about 4 MB on mobile data.
