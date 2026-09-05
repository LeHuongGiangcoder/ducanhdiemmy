"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { wedding } from "@/data/wedding";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./Venue.module.css";

/**
 * Where it happens — the first stop after the hero.
 *
 * A cherub raises a glass at the head of the section; below it, a gold line
 * drawing of the hotel set straight on the navy — the artwork is
 * screen-blended so its black ground drops out and only the gilt lines are
 * left standing. Name, address and the map link follow it on the navy rather
 * than on a card, so nothing competes with the drawing.
 */
export default function Venue() {
  const { t } = useContent();
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
    <section id="venue" className={`section section--screen section--pattern-navy ${styles.section}`}>
      <div className={`shell stack center ${styles.shell}`}>
        <Reveal className="masthead">
          <p className="eyebrow">{t.venue.eyebrow}</p>
          <h2 className={`h-1 ${fallbackFontClass(t.venue.title)}`}>{t.venue.title}</h2>
        </Reveal>


        <div ref={ref} className={styles.venue} data-in={shown ? "true" : "false"}>
          <div className={styles.sketchGlow}>
            <Image
              src="/assets/venue-sketch.png"
              alt=""
              aria-hidden="true"
              width={1200}
              height={800}
              sizes="(max-width: 479px) 100vw, 430px"
              className={styles.sketch}
              /*
               * Eager but low priority, rather than `priority`.
               *
               * This sketch is the next screen down and it sits behind the
               * intro gate, so nobody is looking at it yet — but `priority`
               * had it racing the intro photograph for the connection, the
               * same contention the hero video was taken out of (see
               * `mediaReady` in Invitation.js).
               *
               * Plain lazy would be the obvious answer and it is the wrong
               * one here: the reveal below fades this in on intersection, so
               * a lazy fetch would only start as the guest arrives and the
               * sketch would fade in empty. Eager keeps the fetch guaranteed
               * and early; `fetchPriority="low"` is what tells the scheduler
               * to queue it behind the photograph instead of alongside it.
               */
              loading="eager"
              fetchPriority="low"
            />
          </div>

          <div className={styles.details}>
            <span className={styles.venueName}>{venue.name}</span>
            <span className={styles.venueHall}>{venue.hall}</span>
            <span className={styles.venueAddress}>{t.venue.address}</span>
          </div>

          <a
            className={styles.mapLink}
            href={venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.venue.mapLink}
          </a>
        </div>
      </div>
    </section>
  );
}
