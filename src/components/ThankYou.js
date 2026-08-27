import Image from "next/image";
import { couple, wedding } from "@/data/wedding";
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
 */
export default function ThankYou() {
  const { t } = useContent();
  return (
    <section className={`section section--screen ${styles.section}`}>
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src="/assets/thankyou-bg.jpg"
          alt=""
          fill
          sizes="(max-width: 479px) 100vw, 430px"
          className={styles.backdropImage}
        />
      </div>

      {/* Sunk into the lower third, behind the sign-off. */}
      <Image
        src="/assets/monogram-couple.png"
        alt=""
        aria-hidden="true"
        width={876}
        height={900}
        sizes="(max-width: 479px) 46vw, 198px"
        className={styles.watermark}
      />

      <div className="shell stack center">
        <Reveal className="masthead">
          <h2 className={`h-1 ${fallbackFontClass(t.thankYou.headline)}`}>{t.thankYou.headline}</h2>
          <p className="body" style={{ whiteSpace: "pre-line", textWrap: "auto" }}>{t.thankYou.body}</p>
        </Reveal>

        {/* The sign-off block: the closing words, the names, the date. */}
        <Reveal delay={140} className={`stack stack--snug center ${styles.signoff}`}>
          <div className="rule-mark" aria-hidden="true">
            <span className="rule-mark__dot" />
          </div>
          <p className={`eyebrow ${fallbackFontClass(t.thankYou.signoff)}`}>{t.thankYou.signoff}</p>
          <p className={`h-2 ${styles.signature}`}>{couple.initials}</p>
          <p className="eyebrow">{wedding.dateShort}</p>
        </Reveal>
      </div>
    </section>
  );
}
