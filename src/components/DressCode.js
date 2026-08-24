import { dressCode } from "@/data/wedding";
import Ornament from "./Ornament";
import Reveal from "./Reveal";
import styles from "./DressCode.module.css";

export default function DressCode() {
  return (
    <section className="section section--screen section--pattern-wine">
      <Ornament src="/assets/cherub-glass.webp" place="o-tl" tone="ornament--soft" />
      <Ornament
        src="/assets/cherub-coupe.webp"
        place="o-br"
        tone="ornament--soft"
        flip
      />

      <div className="shell stack center">
        <Reveal className="masthead">
          <p className="eyebrow">For the Occasion</p>
          <h2 className="h-1">Dress code</h2>
        </Reveal>

        <Reveal delay={120} className="stack stack--snug center">
          <p className="lede">{dressCode.headline}</p>
          <p className="body">{dressCode.body}</p>
        </Reveal>

        <Reveal delay={220}>
          <ul className={styles.swatches}>
            {dressCode.swatches.map((s) => (
              <li key={s.name} className={styles.swatch}>
                <span
                  className={styles.chip}
                  style={{ background: s.hex }}
                  aria-hidden="true"
                />
                <span className="fine">{s.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={300}>
          <Ornament
            src="/assets/cat-heart.webp"
            className="mark"
            tone="ornament--strong"
            inline
            float
          />
        </Reveal>
      </div>
    </section>
  );
}
