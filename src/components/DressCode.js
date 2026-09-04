import Image from "next/image";
import { dressPalette } from "@/data/wedding";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./DressCode.module.css";

/**
 * Dress Code. The palette is held up on the card rather than laid on a panel:
 * the gloved hand presents the paper, the wax seal is pressed on its top edge,
 * and the four swatches are printed in the blank of the paper itself.
 *
 * This is the one section that is not held to a single screen: the arm needs
 * its full length to read as an arm, so the section is as tall as the artwork
 * and the wrist runs on under the silk at the foot. The silk carries the wine
 * of this section down into the navy of the timeline below.
 */
export default function DressCode() {
  const { t } = useContent();
  return (
    <section id="dress-code" className={`section section--pattern-wine ${styles.section}`}>
      <div className={`shell stack center ${styles.shell}`}>
        <Reveal className="masthead">
          <p className="eyebrow">{t.dressCode.eyebrow}</p>
          <h2 className={`h-1 ${fallbackFontClass(t.dressCode.title)}`}>{t.dressCode.title}</h2>
          <p className={styles.headline}>{t.dressCode.headline}</p>
        </Reveal>

        <Reveal delay={120} className={styles.palette}>
          <div className={styles.card}>
            <Image
              src="/assets/seal.webp"
              alt=""
              aria-hidden="true"
              width={240}
              height={249}
              sizes="(max-width: 479px) 20vw, 86px"
              className={styles.seal}
            />

            <div className={styles.paper}>
              <Image
                src="/assets/dress-hand.png"
                alt=""
                aria-hidden="true"
                width={1100}
                height={1069}
                sizes="(max-width: 479px) 88vw, 378px"
                className={styles.cardImage}
              />

              {/* Printed in the blank of the paper, above the glove. */}
              <div className={styles.printed}>
                <h3 className={styles.paletteHeading}>
                  {t.dressCode.paletteHeading}
                </h3>

                <ul className={styles.swatches}>
                  {/* Colour and name are held apart: the hex is the same in
                      every language, the name is not. */}
                  {dressPalette.map((hex, i) => (
                    <li key={hex} className={styles.swatch}>
                      <span
                        className={styles.chip}
                        style={{ background: hex }}
                        aria-hidden="true"
                      />
                      <span className={styles.swatchName}>
                        {t.dressCode.swatches[i]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* The silk — the hand-off into the timeline. */}
      <div className={styles.finale} aria-hidden="true">
        <Image
          src="/assets/drape.webp"
          alt=""
          width={1600}
          height={523}
          sizes="(max-width: 479px) 140vw, 602px"
          className={styles.drape}
        />
      </div>
    </section>
  );
}
