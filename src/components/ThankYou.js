import Image from "next/image";
import { couple, thankYou, wedding } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./ThankYou.module.css";

/**
 * Closing section. Structured exactly like the others — `section--screen`,
 * a centred `shell stack`, the same masthead cluster — so its rhythm matches.
 * The champagne is lifted out of the flow and anchored to the bottom edge as a
 * bleed, so it decorates the screen without stretching the section past it.
 */
export default function ThankYou() {
  return (
    <section className={`section section--screen section--pattern-navy ${styles.section}`}>
      <div className="shell stack center">
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

      <Image
        src="/assets/ly.webp"
        alt=""
        aria-hidden="true"
        width={669}
        height={1000}
        sizes="(max-width: 767px) 46vw, 260px"
        className={styles.toast}
      />
    </section>
  );
}
