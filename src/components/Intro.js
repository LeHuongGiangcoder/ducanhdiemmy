"use client";

import Image from "next/image";
import { couple } from "@/data/wedding";
import styles from "./Intro.module.css";

/**
 * The gate. Deliberately bare: the photograph carries the whole screen, with
 * nothing over it but a small monogram and one button — names, date and venue
 * are already composed into the hero video behind it.
 *
 * The monogram, the button and the hint sit as one tight cluster so it reads
 * as a single object to act on, rather than two marks floating apart.
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
        src="/assets/intro.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className={styles.bg}
      />

      <div className={styles.body}>
        <div className={styles.cluster}>
          <Image
            src={couple.monogram}
            alt=""
            aria-hidden="true"
            width={220}
            height={226}
            priority
            className={styles.monogram}
          />

          <button
            type="button"
            className={`btn btn--primary ${styles.cta}`}
            onClick={onOpen}
          >
            Save the Date
          </button>

          {/* Tells the guest the button is the way in. */}
          <p className={styles.hint}>
            <span className={styles.hintChevron} aria-hidden="true" />
            Tap to open your invitation
          </p>
        </div>
      </div>
    </div>
  );
}
