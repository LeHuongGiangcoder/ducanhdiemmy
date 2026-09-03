"use client";

import Image from "next/image";
import { useState } from "react";
import { couple, wedding } from "@/data/wedding";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
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
 *
 * On a personal invitation the button is preceded by the guest's code — the
 * three-digit number from their row of the sheet, printed on what they were
 * sent. The code is checked on the server (POST /api/access), so it is never
 * part of this page and a forwarded link doesn't open by itself.
 *
 * The audio is primed before that check, not after: iOS only lets playback
 * start inside the gesture itself, and an `await` in between loses it.
 */
export default function Intro({ onOpen, onPrimeAudio, closing, slug, requireCode = false }) {
  const { t } = useContent();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (closing || checking) return;

    // Same gesture as the tap — anything after the first await is too late.
    onPrimeAudio?.();

    if (!requireCode) {
      onOpen();
      return;
    }

    const typed = code.trim();
    if (!typed) {
      setError(t.intro.codeErrorEmpty);
      return;
    }

    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code: typed }),
      });
      if (res.ok) {
        onOpen();
        return;
      }
      setError(res.status === 401 ? t.intro.codeErrorWrong : t.intro.codeErrorNetwork);
    } catch {
      setError(t.intro.codeErrorNetwork);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div
      className={`${styles.intro} ${closing ? styles.closing : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${t.intro.groom} & ${t.intro.bride}`}
    >
      <Image
        src="/assets/intro-sunset.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        quality={90}
        sizes="(max-width: 479px) 100vw, (max-height: 1000px) 100vh, 100vw"
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

          <p className={styles.eyebrow}>{t.intro.eyebrow}</p>

          <p className={styles.names}>
            <span className={fallbackFontClass(t.intro.groom)}>{t.intro.groom}</span>
            <span className={styles.amp}>&</span>
            <span className={fallbackFontClass(t.intro.bride)}>{t.intro.bride}</span>
          </p>

          {/* The date itself — the promise the gate is asking to be kept. */}
          <p className={styles.date}>
            <span className={styles.dateRule} aria-hidden="true" />
            <span>{wedding.dateShort}</span>
            <span className={styles.dateRule} aria-hidden="true" />
          </p>

          <form className={styles.gate} onSubmit={submit} noValidate>
            {requireCode && (
              <div className={styles.codeField}>
                <label className={styles.codeLabel} htmlFor="intro-code">
                  {t.intro.codeLabel}
                </label>
                <input
                  id="intro-code"
                  className={styles.codeInput}
                  type="text"
                  /* Numeric keypad on a phone, without the spinner and the
                     leading-zero stripping a number input would bring. */
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={6}
                  placeholder={t.intro.codePlaceholder}
                  aria-describedby="intro-code-note"
                  aria-invalid={error ? "true" : undefined}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              className={`btn btn--primary ${styles.cta}`}
              disabled={checking}
            >
              {checking ? t.intro.codeChecking : t.intro.cta}
            </button>

            {requireCode && (
              <p
                id="intro-code-note"
                className={error ? styles.codeError : styles.codeNote}
                role={error ? "alert" : undefined}
              >
                {error || t.intro.codeHint}
              </p>
            )}
          </form>

          {/* Tells the guest the button is the way in. */}
          {!requireCode && (
            <p className={styles.hint}>
              <span className={styles.hintChevron} aria-hidden="true" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
