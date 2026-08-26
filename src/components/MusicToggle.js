"use client";

import styles from "./MusicToggle.module.css";

/**
 * Music control. Playback itself is owned by Invitation.js — the audio element
 * has to be started by the same user gesture that opens the invitation, or
 * mobile browsers refuse it.
 */
export default function MusicToggle({ playing, onToggle, visible }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`btn-icon ${styles.toggle} ${visible ? styles.on : ""}`}
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      <span
        className={styles.disc}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          {playing ? (
            <>
              <path d="M9 18V5l10-2v13" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.3" />
            </>
          ) : (
            <>
              <path d="M9 18V5l10-2v13" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.3" />
              <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.3" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}
