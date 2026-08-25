import Image from "next/image";
import { dressCode } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./DressCode.module.css";

/**
 * Dress code. The palette is held up on the card rather than laid on a panel:
 * the gloved hand presents the paper, the wax seal is pressed on its top edge,
 * and the four swatches are printed in the blank of the paper itself.
 *
 * The foot of the section is a set piece rather than an ornament: the glasses
 * stand on the section's floor and the silk sweeps over their stems, carrying
 * the wine of this section down into the navy of the timeline below.
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
          <div className={styles.card}>
            <Image
              src="/assets/seal.webp"
              alt=""
              aria-hidden="true"
              width={240}
              height={249}
              sizes="(max-width: 767px) 20vw, 100px"
              className={styles.seal}
            />

            <div className={styles.paper}>
              <Image
                src="/assets/dress-hand.png"
                alt=""
                aria-hidden="true"
                width={1100}
                height={1069}
                sizes="(max-width: 767px) 88vw, 26rem"
                className={styles.cardImage}
              />

              {/* Printed in the blank of the paper, above the glove. */}
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
            </div>
          </div>
        </Reveal>
      </div>

      {/* The toast, then the silk over it — the hand-off into the timeline. */}
      <div className={styles.finale} aria-hidden="true">
        <Image
          src="/assets/glasses.webp"
          alt=""
          width={700}
          height={1218}
          sizes="(max-width: 767px) 42vw, 240px"
          className={styles.glasses}
        />
        <Image
          src="/assets/drape.webp"
          alt=""
          width={1600}
          height={523}
          sizes="140vw"
          className={styles.drape}
        />
      </div>
    </section>
  );
}
