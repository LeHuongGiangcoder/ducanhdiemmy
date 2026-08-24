import Image from "next/image";
import { dressCode } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./DressCode.module.css";

/**
 * Dress code. The palette sits straight on the damask — no card behind it, so
 * the swatches themselves are the only thing to look at.
 *
 * A silk drape bleeds off the bottom edge, carrying the wine of this section
 * into the navy of the RSVP below it.
 */
export default function DressCode() {
  return (
    <section className={`section section--screen section--pattern-wine ${styles.section}`}>
      <div className={`shell stack center ${styles.shell}`}>
        <Reveal className="masthead">
          <p className="eyebrow">For the Occasion</p>
          <h2 className="h-1">Dress code</h2>
          <p className="lede">{dressCode.headline}</p>
        </Reveal>

        <Reveal delay={120} className={styles.palette}>
          <p className="body">{dressCode.body}</p>

          <ul className={styles.swatches}>
            {dressCode.swatches.map((s) => (
              <li key={s.name} className={styles.swatch}>
                <span
                  className={styles.chip}
                  style={{ background: s.hex }}
                  aria-hidden="true"
                />
                <span className={styles.swatchName}>{s.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220}>
          <Image
            src="/assets/cherub-tower.webp"
            alt=""
            aria-hidden="true"
            width={768}
            height={900}
            sizes="(max-width: 767px) 32vw, 170px"
            className={styles.cherub}
          />
        </Reveal>
      </div>

      {/* Bleeds off the bottom edge — the hand-off into the RSVP section. */}
      <Image
        src="/assets/silk.webp"
        alt=""
        aria-hidden="true"
        width={1400}
        height={633}
        sizes="100vw"
        className={styles.silk}
      />
    </section>
  );
}
