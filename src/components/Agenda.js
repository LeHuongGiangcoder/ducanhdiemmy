import Image from "next/image";
import { timeline, wedding } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./Agenda.module.css";

/**
 * The evening: when it happens, then where.
 *
 * No cherub ornaments here — the venue card carries the decoration, sealed with
 * the wax stamp the way a printed invitation would be.
 */
export default function Agenda() {
  const { venue } = wedding;

  return (
    <section className="section section--screen section--pattern-navy">
      <div className="shell stack center">
        <Reveal className="masthead">
          <p className="eyebrow">The Evening</p>
          <h2 className="h-1">Timeline</h2>
        </Reveal>

        <ol className={styles.list}>
          {timeline.map((item, i) => (
            <Reveal as="li" key={item.time} delay={i * 110} className={styles.item}>
              <span className={styles.time}>{item.time}</span>
              <span className={styles.divider} aria-hidden="true" />
              <span className={styles.detail}>
                <span className={`h-4 ${styles.title}`}>{item.title}</span>
                {item.subtitle ? (
                  <span className={styles.subtitle}>{item.subtitle}</span>
                ) : null}
                {item.note ? <span className="fine">({item.note})</span> : null}
              </span>
            </Reveal>
          ))}
        </ol>

        {/* Venue, presented as a sealed card. */}
        <Reveal delay={140} className={styles.venue}>
          <div className={styles.card}>
            <Image
              src="/assets/seal.webp"
              alt=""
              aria-hidden="true"
              width={240}
              height={249}
              sizes="(max-width: 767px) 22vw, 110px"
              className={styles.seal}
            />
            <Image
              src="/assets/venue-card.webp"
              alt={`Illustration of ${venue.name}`}
              width={536}
              height={900}
              sizes="(max-width: 767px) 62vw, 300px"
              className={styles.cardImage}
            />

            {/* Sits in the card's blank band, between the drawing and the hand. */}
            <div className={styles.cardText}>
              <p className={styles.venueName}>{venue.name}</p>
              <p className={styles.venueAddress}>{venue.address}</p>
              <a
                className={styles.mapLink}
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
