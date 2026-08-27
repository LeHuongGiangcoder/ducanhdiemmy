"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { timeline, timelineNote } from "@/data/wedding";
import Reveal from "./Reveal";
import styles from "./Timeline.module.css";

/** Fraction of the viewport a dot must rise past before its mark lights up. */
const TRIGGER = 0.72;

/**
 * The running order of the evening, strung along a single gold rail.
 *
 * The rail is drawn per item rather than as one absolute element, so the
 * segments join seamlessly whatever the copy does: each item's segment runs
 * from its own dot down to the next one, and fills as the guest scrolls past.
 */
export default function Timeline() {
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
    <section id="timeline" className={`section section--screen section--pattern-navy ${styles.section}`}>
      <div className={`shell stack center ${styles.shell}`}>
        <Reveal className="masthead">
          <p className="eyebrow">The Evening</p>
          <h2 className="h-1">Timeline</h2>
        </Reveal>

        <ol className={styles.list}>
          {timeline.map((item, i) => (
            <li
              key={item.time}
              className={styles.item}
              data-on={i <= active ? "true" : "false"}
              data-last={i === timeline.length - 1 ? "true" : "false"}
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

        <Reveal delay={80} className={styles.note}>
          <p className="fine">{timelineNote}</p>
        </Reveal>

        <Reveal delay={120}>
          <Image
            src="/assets/cherub-bucket.webp"
            alt=""
            aria-hidden="true"
            width={893}
            height={900}
            sizes="(max-width: 479px) 52vw, 224px"
            className={styles.cherub}
          />
        </Reveal>
      </div>
    </section>
  );
}
