"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { wedding } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./Venue.module.css";

/**
 * Where it happens — the first stop after the hero.
 *
 * The card is presented rather than just placed: the map link lands first, the
 * gloved hand raises the card up out of it, and the wax seal is pressed on once
 * the card has settled. `.stage` clips the card until it rises, so the whole
 * move reads as one gesture coming from the line of type below.
 */
export default function Venue() {
  const { venue } = wedding;
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <section className="section section--screen section--pattern-navy">
      <div className={`shell stack center ${styles.shell}`}>
        <Reveal className="masthead">
          <p className="eyebrow">The Celebration</p>
          <h2 className="h-1">Venue</h2>
        </Reveal>

        <div ref={ref} className={styles.venue} data-in={shown ? "true" : "false"}>
          <div className={styles.stage}>
            <a
              className={styles.card}
              href={venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${venue.name}, ${venue.hall}, ${venue.address} — open in Google Maps`}
            >
              <Image
                src="/assets/seal.webp"
                alt=""
                aria-hidden="true"
                width={240}
                height={249}
                sizes="(max-width: 767px) 20vw, 100px"
                className={styles.seal}
              />
              <Image
                src="/assets/venue-hand.webp"
                alt=""
                aria-hidden="true"
                width={1000}
                height={2421}
                sizes="(max-width: 767px) 74vw, 320px"
                className={styles.cardImage}
                priority
              />

              {/* Sits in the card's blank band, below the drawing. */}
              <span className={styles.cardText}>
                <span className={styles.venueName}>{venue.name}</span>
                <span className={styles.venueHall}>{venue.hall}</span>
                <span className={styles.venueAddress}>{venue.address}</span>
              </span>
            </a>
          </div>

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
    </section>
  );
}
