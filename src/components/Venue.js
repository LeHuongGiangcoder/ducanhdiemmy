"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { wedding } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./Venue.module.css";

/**
 * Where it happens — the first stop after the hero.
 *
 * A gold line drawing of the hotel, set straight on the navy: the artwork is
 * screen-blended so its black ground drops out and only the gilt lines are
 * left standing on the section. Name, address and the map link follow it on
 * the navy rather than on a card, so nothing competes with the drawing.
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
          <Image
            src="/assets/venue-sketch.png"
            alt=""
            aria-hidden="true"
            width={1200}
            height={800}
            sizes="(max-width: 767px) 92vw, 34rem"
            className={styles.sketch}
            priority
          />

          <div className={styles.details}>
            <span className={styles.venueName}>{venue.name}</span>
            <span className={styles.venueHall}>{venue.hall}</span>
            <span className={styles.venueAddress}>{venue.address}</span>
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
