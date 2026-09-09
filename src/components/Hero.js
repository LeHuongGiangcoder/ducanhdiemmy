"use client";

import { useEffect, useRef, useState } from "react";
import { isDisplaySafe } from "@/lib/aegean";
import { useContent } from "./LanguageProvider";
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
 * The Vietnamese card is the same composition with its own type set into it,
 * so the slot lands in the same place. Measured against the footage — if a
 * future re-cut moves the line, these are the three numbers to re-measure,
 * and only the affected language changes.
 */
/*
 * The families' card no longer shares them.
 *
 * It used to: the first cut was the Vietnamese composition with the parents'
 * wording swapped in, and its blank line fell on the same rows to the pixel.
 * The card was then re-cut — the couple's full names now head it and the
 * wishes line reads "đến dự Lễ Thành Hôn của hai con chúng tôi" — and the gap
 * moved with it. Measured off the new footage the way the numbers above were,
 * at 0.3s and 5.0s, which agree to the pixel:
 *
 *   0.3974 – 0.4125   "Trân trọng kính mời"   (px 763–792)
 *   0.4125 – 0.5120    ← the slot              (px 792–983)
 *   0.5120 – 0.5281   "đến dự Lễ Thành Hôn…"  (px 983–1014)
 *
 * A shade lower than the couple's slot and a quarter taller. Left on the
 * shared constants the name would hang 25px high in it — inside the gap, but
 * visibly not centred in it, which on a card this still is what the eye picks
 * up first.
 */
const PARENTS_SLOT_TOP = 0.4125;
const PARENTS_SLOT_BOTTOM = 0.512;

const SLOT = {
  en: { top: SLOT_TOP, height: SLOT_HEIGHT, x: 0.5113 },
  vi: { top: SLOT_TOP, height: SLOT_HEIGHT, x: 0.5113 },
  /* `x` is unchanged: the re-cut card's lines centre on 0.506–0.511, the same
     nudge to the right, and re-measuring moved it by fewer pixels than the
     stroke of the type it hangs under. */
  parents: {
    top: PARENTS_SLOT_TOP,
    height: PARENTS_SLOT_BOTTOM - PARENTS_SLOT_TOP,
    x: 0.5113,
  },
};

/*
 * The card composed into the video is not centred in its own frame — it sits
 * slightly right. The "Dear" line spans px 508–597, a centre of 0.5113, so the
 * slot is nudged by the same 1.13% to hang the guest's name directly under it
 * (see the `x` in SLOT above).
 */
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

export default function Hero({ guest, started, revealing, preloadVideo = true }) {
  const { lang, t } = useContent();
  const slot = SLOT[lang] ?? SLOT.en;
  const stageRef = useRef(null);
  const nameRef = useRef(null);
  const videoRef = useRef(null);
  const [box, setBox] = useState(null);
  const nameSafe = isDisplaySafe(guest.name);

  /**
   * The card is 2.4 MB and it is behind a gate nobody has tapped yet, so it
   * waits until the intro photograph has painted (see `mediaReady` in
   * Invitation.js) before it starts downloading.
   *
   * `preload="none"` alone does not hold it: an `autoplay` element is allowed
   * to begin fetching whatever it needs to honour the autoplay, and Chrome
   * does — measured, the video still started at 77 ms, alongside the
   * photograph. So autoplay is withheld too, and playback is started here by
   * hand once the wait is over. `muted` is what makes that `play()` legal
   * without a gesture.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!preloadVideo || !video) return;
    if (video.readyState === 0) video.load();
    video.play().catch(() => {
      // A browser that refuses the programmatic start still has `autoplay`
      // set on the element by now, which is the same instruction again.
    });
  }, [preloadVideo, t.hero.src]);

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
      const budget = box.height * slot.height * SLOT_FILL;

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
  }, [box, guest.name, slot.height]);

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
        key={t.hero.src}
        ref={videoRef}
        className={styles.video}
        autoPlay={preloadVideo}
        loop
        muted
        playsInline
        /* A still of the card's first frame, so the hero is the invitation
           from the very first paint rather than a black rectangle waiting on
           a buffer. */
        poster={t.hero.poster}
        preload={preloadVideo ? "auto" : "none"}
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
        <source src={t.hero.src} type="video/mp4" />
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
                "--slot-shift": `${box.width * (slot.x - 0.5)}px`,
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
            top: `${slot.top * 100}%`,
            height: `${slot.height * 100}%`,
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
              {t.hero.salutation} {guest.name}.{" "}
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
