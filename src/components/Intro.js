"use client";

import Image from "next/image";
import { couple, wedding } from "@/data/wedding";
import styles from "./Intro.module.css";

/**
 * The gate. The sunset photograph carries the whole screen; over it sits one
 * centred cluster — the monogram, the save-the-date line, the couple's names,
 * the single way in, and a hint that says so.
 *
 * Three tones carry the hierarchy, since everything here is light type on a
 * bright photograph: white for the names, beige for the line above them, and
 * a dimmer beige for the hint below the button.
 *
 * Pressing the button also unlocks audio playback, so the music and the reveal
 * are the same gesture.
 */
export default function Intro({ onOpen, closing }) {
  return (
    <div
      className={`${styles.intro} ${closing ? styles.closing : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Wedding invitation — ${couple.groom} and ${couple.bride}`}
    >
      <Image
        src="/assets/intro-sunset.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="(max-width: 479px) 100vw, 430px"
        className={styles.bg}
      />

      <div className={styles.body}>
        <div className={styles.cluster}>
          <Image
            src={couple.monogram}
            alt=""
            aria-hidden="true"
            width={876}
            height={900}
            sizes="(max-width: 479px) 12vw, 52px"
            priority
            className="monogram"
          />

          <p className={styles.eyebrow}>Save the Date</p>

          <p className={styles.names}>
            <span>{couple.groom}</span>
            <span className={styles.amp}>&</span>
            <span>{couple.bride}</span>
          </p>

          {/* The date itself — the promise the gate is asking to be kept. */}
          <p className={styles.date}>
            <span className={styles.dateRule} aria-hidden="true" />
            <span>{wedding.dateShort}</span>
            <span className={styles.dateRule} aria-hidden="true" />
          </p>

          <button
            type="button"
            className={`btn btn--primary ${styles.cta}`}
            onClick={onOpen}
          >
            Open Invitation
          </button>

          {/* Tells the guest the button is the way in. */}
          <p className={styles.hint}>
            <span className={styles.hintChevron} aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  );
}
