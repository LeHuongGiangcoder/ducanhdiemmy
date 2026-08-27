"use client";

import { useEffect, useRef, useState } from "react";
import { isDisplaySafe } from "@/lib/aegean";
import styles from "./Hero.module.css";

/**
 * Hero — the looping invitation video with the guest's name set into it.
 *
 * "hero final.mp4" is already a finished card: monogram, both full names, the
 * wishes line, the date and the Fairmont lockup are composed into the footage,
 * and a blank line is left under "Dear" for the guest. So this component adds
 * exactly one thing — that name — and nothing else. Anything more would double
 * up on type the video already carries.
 *
 * The name uses TAN Aegean, which has no Vietnamese tone marks; a name it can't
 * set falls back wholly to Cormorant italic rather than breaking glyph by
 * glyph (see src/lib/aegean.js).
 */

const VIDEO_W = 1080;
const VIDEO_H = 1920;

/*
 * The blank line the video leaves for the guest — the run of empty frame
 * between "Dear" and the wishes line, measured off the footage itself (ink
 * bounding boxes at 0.3s and 5.0s, which agree to the pixel):
 *
 *   0.3927 – 0.4089   "Dear"            (px 754–785)
 *   0.4089 – 0.4891    ← the slot        (px 785–939)
 *   0.4891 – 0.5115   "We would be honored by your presence"
 *
 * Fractions of the video frame, not of the viewport, so they hold on any screen
 * once the slot is positioned against the video's rendered box.
 */
const SLOT_TOP = 0.4089;
const SLOT_BOTTOM = 0.4891;
const SLOT_HEIGHT = SLOT_BOTTOM - SLOT_TOP;

/*
 * The card composed into the video is not centred in its own frame — it sits
 * slightly right. The "Dear" line spans px 508–597, a centre of 0.5113, so the
 * slot is nudged by the same 1.13% to hang the guest's name directly under it.
 */
const SLOT_X = 0.5113;
/** Name size as a fraction of the frame, so it tracks the video's own type. */
const NAME_SIZE = 0.025;

/*
 * How much of the slot a name may occupy. The slot is the whole gap between
 * "Dear" and the wishes line, and it was cut for one line of type. A two-line
 * name that merely *fits* it still reads as colliding, because the video's own
 * lines sit right against the edges — measured on screen, 0.82 of the slot put
 * "Bà Trần Thị Phương Loan" a descender away from the wishes line. 0.7 leaves
 * the name visibly clear of both.
 */
const SLOT_FILL = 0.7;
/** Never shrink past this — below it the name stops reading as the same card. */
const MIN_FIT = 0.62;

export default function Hero({ guest, started, revealing }) {
  const stageRef = useRef(null);
  const nameRef = useRef(null);
  const [box, setBox] = useState(null);
  const nameSafe = isDisplaySafe(guest.name);

  /**
   * The video is `object-fit: cover`, so its rendered frame rarely matches the
   * stage. Recompute that frame and hang the slot off it — otherwise the name
   * drifts off its line on any viewport that isn't 9:16.
   *
   * `offsetWidth/offsetHeight` rather than `getBoundingClientRect()` on
   * purpose: during the reveal the stage carries `scale(1.08)`, which the rect
   * includes and the layout size does not. Measuring the rect sizes the frame
   * for a video 8% larger than the one actually painted — and ResizeObserver
   * never corrects it afterwards, because a transform doesn't change layout
   * size and so never fires a callback.
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const width = stage.offsetWidth;
      const height = stage.offsetHeight;
      if (!width || !height) return;

      const scale = Math.max(width / VIDEO_W, height / VIDEO_H);
      const w = VIDEO_W * scale;
      const h = VIDEO_H * scale;
      setBox({ left: (width - w) / 2, top: (height - h) / 2, width: w, height: h });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /**
   * Shrink a name that outgrows its slot.
   *
   * "Mr. Jason Lau & Ms. Dung Dang" is two and a half times the length of
   * "James Carter" and wraps to two lines, which fills the gap the video left
   * for one. Rather than guess a size from character count — which breaks the
   * moment a name is in the other typeface, or carries a wide glyph — the
   * rendered height is measured and the size divided down until it fits.
   *
   * Two passes: shrinking can un-wrap a line, which changes the height it was
   * solving for. It converges immediately in practice; the loop is the guard.
   */
  useEffect(() => {
    const name = nameRef.current;
    if (!name || !box) return;

    let cancelled = false;

    const fit = () => {
      if (cancelled || !nameRef.current) return;
      const el = nameRef.current;
      const budget = box.height * SLOT_HEIGHT * SLOT_FILL;

      let scale = 1;
      el.style.setProperty("--name-fit", "1");
      for (let pass = 0; pass < 2; pass++) {
        const height = el.scrollHeight;
        if (height <= budget) break;
        scale = Math.max(MIN_FIT, scale * (budget / height));
        el.style.setProperty("--name-fit", String(scale));
      }
    };

    fit();
    // Metrics change when the real face swaps in for the fallback, so measure
    // again once it has — otherwise a long name is fitted to the wrong font.
    document.fonts?.ready.then(fit).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [box, guest.name]);

  return (
    <section id="home"
      ref={stageRef}
      className={[
        styles.hero,
        revealing ? styles.heroIn : "",
        started ? styles.heroSettled : "",
        "section section--flush",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <video
        className={styles.video}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        {/*
         * One source, the full-resolution one, on every device.
         *
         * There used to be a 320x568 file behind `media="(max-width: 768px)"`.
         * A phone that reports 393pt of width paints it on ~1170 physical
         * pixels, so that file arrived upscaled nearly 4x and the card read as
         * soft — the couple's own names among the worst of it. The saving was
         * real (0.9 MB against 7 MB) but it was being taken out of the one
         * thing a guest looks at.
         */}
        <source src="/hero%20final.mp4" type="video/mp4" />
      </video>

      {/* A frame-locked layer: percentages inside it are video coordinates. */}
      <div
        className={styles.frame}
        style={
          box
            ? {
                left: `${box.left}px`,
                top: `${box.top}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
                // Type scales with the footage, not the viewport, so the name
                // keeps the same relationship to the video's own lettering.
                "--name-size": `${box.height * NAME_SIZE}px`,
                "--slot-shift": `${box.width * (SLOT_X - 0.5)}px`,
              }
            : undefined
        }
      >
        {/*
         * The slot is the empty line itself, sized and placed in video
         * coordinates. The name is centred inside it by layout — no
         * translate(-50%) for the entrance animation to fight over.
         */}
        <div
          className={styles.slot}
          style={{
            top: `${SLOT_TOP * 100}%`,
            height: `${SLOT_HEIGHT * 100}%`,
          }}
        >
          <h1
            ref={nameRef}
            className={[
              styles.guestName,
              nameSafe ? styles.guestDisplay : styles.guestFallback,
              started ? styles.nameIn : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="sr-only">
              {guest.salutation} {guest.name}.{" "}
            </span>
            <span aria-hidden="true">{guest.name}</span>
          </h1>
        </div>
      </div>

      {guest.note ? <p className={`${styles.note} fine`}>{guest.note}</p> : null}

      <div
        className={`${styles.scrollHint} ${started ? styles.hintOn : ""}`}
        aria-hidden="true"
      >
        <span className={styles.hintLine} />
      </div>
    </section>
  );
}
