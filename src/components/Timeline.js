"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { timelineTimes } from "@/data/wedding";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./Timeline.module.css";

/** Fraction of the viewport a dot must rise past before its mark lights up. */
const TRIGGER = 0.72;

/**
 * A running order, strung along a single gold rail.
 *
 * The rail is drawn per item rather than as one absolute element, so the
 * segments join seamlessly whatever the copy does: each item's segment runs
 * from its own dot down to the next one, and fills as the guest scrolls past.
 *
 * Two lists use it: the evening at the Fairmont, which is what every argument
 * below defaults to, and the afternoon of the family ceremonies (Ceremony.js).
 * Parameters rather than a second copy of the file — the rail, the scroll
 * trigger and the lit-dot logic are the whole component, and a duplicate is
 * the place where the two would quietly stop matching.
 *
 * `copy` carries eyebrow / title / items / note. Only the title and the items
 * are required: a list with no kicker and no footnote just leaves them out.
 */
export default function Timeline({
  id = "timeline",
  times = timelineTimes,
  copy,
  surface = "section--pattern-navy",
  /** Optional artwork above the heading — the monogram, on the agenda. */
  mark = null,
  /** The cherub that closes the evening list. Pass null to leave it off. */
  cherub = "/assets/cherub-bucket.webp",
}) {
  const { t } = useContent();
  const c = copy ?? t.timeline;
  // Times are language-neutral; titles are not. Zipped by position.
  const items = times.map((time, i) => ({ time, ...c.items[i] }));
  const dots = useRef([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.innerHeight * TRIGGER;
      let next = -1;
      dots.current.forEach((dot, i) => {
        if (dot && dot.getBoundingClientRect().top <= line) next = i;
      });
      setActive(next);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id={id} className={`section section--screen ${surface} ${styles.section}`}>
      <div className={`shell stack center ${styles.shell}`}>
        <Reveal className="masthead">
          {mark}
          {c.eyebrow ? <p className="eyebrow">{c.eyebrow}</p> : null}
          <h2 className={`h-1 ${fallbackFontClass(c.title)}`}>{c.title}</h2>
        </Reveal>

        <ol className={styles.list}>
          {items.map((item, i) => (
            <li
              key={item.time}
              className={styles.item}
              data-on={i <= active ? "true" : "false"}
              data-last={i === items.length - 1 ? "true" : "false"}
            >
              <span className={styles.time}>{item.time}</span>

              <span className={styles.marker} aria-hidden="true">
                <span className={styles.rail}>
                  <span className={styles.railFill} />
                </span>
                <span
                  className={styles.dot}
                  ref={(node) => {
                    dots.current[i] = node;
                  }}
                />
              </span>

              <span className={styles.detail}>
                <span className={`h-4 ${styles.title}`}>{item.title}</span>
                {item.subtitle ? (
                  <span className={styles.subtitle}>{item.subtitle}</span>
                ) : null}
                {item.note ? <span className="fine">({item.note})</span> : null}
              </span>
            </li>
          ))}
        </ol>

        {c.note ? (
          <Reveal delay={80} className={styles.note}>
            <p className="fine" style={{ whiteSpace: "pre-line" }}>{c.note}</p>
          </Reveal>
        ) : null}

        {cherub ? (
          <Reveal delay={120}>
            <Image
              src={cherub}
              alt=""
              aria-hidden="true"
              width={893}
              height={900}
              sizes="(max-width: 479px) 52vw, 224px"
              className={styles.cherub}
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
