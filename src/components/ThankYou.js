import Image from "next/image";
import { couple, thankYou, wedding } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./ThankYou.module.css";

/**
 * Closing section. Structured exactly like the others — `section--screen`,
 * a centred `shell stack`, the same masthead cluster — so its rhythm matches.
 *
 * The damask gives way here: the last screen is the sunset photograph, shown
 * untinted — no scrim over it — with the couple's monogram at the head. The
 * photograph is framed so its dark water, not its horizon, falls behind the
 * copy.
 */
export default function ThankYou() {
  return (
    <section className={`section section--screen ${styles.section}`}>
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src="/assets/thankyou-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className={styles.backdropImage}
        />
      </div>

      <div className="shell stack center">
        <Reveal className={styles.crest}>
          <Image
            src="/assets/monogram-couple.png"
            alt={`${couple.initials} monogram`}
            width={876}
            height={900}
            sizes="(max-width: 767px) 12vw, 60px"
            className="monogram"
          />
        </Reveal>

        <Reveal className="masthead">
          <p className="eyebrow">{thankYou.signoff}</p>
          <h2 className="h-1">{thankYou.headline}</h2>
          <p className="body">{thankYou.body}</p>
        </Reveal>

        <Reveal delay={140} className="stack stack--snug center">
          <div className="rule-mark" aria-hidden="true">
            <span className="rule-mark__dot" />
          </div>
          <p className={`h-2 ${styles.signature}`}>{couple.initials}</p>
          <p className="eyebrow">{wedding.dateShort}</p>
        </Reveal>
      </div>
    </section>
  );
}
