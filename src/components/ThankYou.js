import Image from "next/image";
import { couple, wedding } from "@/data/wedding";
import { getContent } from "@/data/content";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./ThankYou.module.css";

/**
 * Closing section. Structured exactly like the others — `section--screen`,
 * a centred `shell stack`, the same masthead cluster — so its rhythm matches.
 *
 * The damask gives way here: the last screen is the sunset photograph, shown
 * untinted — no scrim over it. The photograph is framed so its dark water, not
 * its horizon, falls behind the copy.
 *
 * The monogram is deliberately not repeated at the head the way the opening
 * does it — it is sunk into the lower third of the screen as a watermark
 * behind the sign-off, so the closing screen reads as an echo of the gate
 * rather than a second copy of it.
 *
 * Behind the celebration toggle it becomes a third wine screen instead — see
 * `families` below.
 */

/**
 * The closing words in the two families' voice.
 *
 * Read off the `parents` dictionary rather than copied, because it is the same
 * paragraph the families' own invitation closes with and one of them editing
 * it must change both. Deliberately NOT the active language's version: the
 * whole of the ceremonies screen speaks for the parents — it is their card,
 * their two households announcing it — so a closing screen signed "D.A & D.M"
 * put the couple's own thanks at the foot of a page nobody said they were
 * speaking on. That holds whatever language the guest reads the reception in,
 * which is why this is a fixed lookup and not `t.thankYou`.
 */
const FAMILIES_THANKS = getContent("parents").thankYou;

export default function ThankYou({ ceremony = null }) {
  const { t } = useContent();
  /**
   * The family ceremonies replace the whole page, and this screen with it: the
   * two screens above it are the wine damask, and the photograph closing them
   * read as the reception's ending pasted onto the afternoon.
   */
  const families = ceremony === "anHoi";
  const copy = families ? FAMILIES_THANKS : t.thankYou;

  return (
    <section
      className={[
        "section section--screen",
        families ? "section--pattern-wine" : "",
        styles.section,
        families ? "" : styles.photo,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {families ? null : (
        <div className={styles.backdrop} aria-hidden="true">
          <Image
            src="/assets/thankyou-bg.jpg"
            alt=""
            fill
            quality={90}
            sizes="(max-width: 479px) 100vw, (max-height: 1000px) 100vh, 100vw"
            className={styles.backdropImage}
          />
        </div>
      )}

      {/*
       * Sunk into the lower third, behind the sign-off — on the photograph
       * only. At 6% it is a watermark in still water; over the damask there is
       * already a pattern in that band and a second one under it reads as a
       * smudge rather than a mark. The lily at the head is this screen's
       * ornament when it is wine.
       */}
      {families ? null : (
        <Image
          src="/assets/monogram-couple.png"
          alt=""
          aria-hidden="true"
          width={876}
          height={900}
          sizes="(max-width: 479px) 46vw, 198px"
          className={styles.watermark}
        />
      )}

      <div className="shell stack center">
        <Reveal className="masthead">
          {/*
           * The same mark that divides the ceremony card from its running
           * order, dividing that from this. It is the one thing standing
           * between two wine screens, so it does the work the change of
           * ground used to do by itself.
           */}
          {families ? (
            <span className={`calla ${styles.calla}`} aria-hidden="true" />
          ) : null}
          <h2 className={`h-1 ${fallbackFontClass(copy.headline)}`}>{copy.headline}</h2>
          <p className="body" style={{ whiteSpace: "pre-line", textWrap: "auto" }}>{copy.body}</p>
        </Reveal>

        {/* The sign-off block: the closing words, the names, the date. */}
        <Reveal delay={140} className={`stack stack--snug center ${styles.signoff}`}>
          <div className="rule-mark" aria-hidden="true">
            <span className="rule-mark__dot" />
          </div>
          <p className="eyebrow">{copy.signoff}</p>
          {/*
           * The couple sign with their initials; the families sign with their
           * name. `display-caps` and the nowrap that goes with it belong to the
           * initials only — they are two letters and an ampersand, which is what
           * both were cut for. A signature of real words takes the ordinary
           * heading treatment and is allowed to wrap.
           */}
          {copy.signature ? (
            <p
              className={`h-2 ${styles.signature} ${styles.signatureWords} ${fallbackFontClass(
                copy.signature,
              )}`}
            >
              {copy.signature}
            </p>
          ) : (
            <p className={`h-2 display-caps ${styles.signature}`}>{couple.initials}</p>
          )}
          <p className="eyebrow date-text">{wedding.dateShort}</p>
        </Reveal>
      </div>
    </section>
  );
}
