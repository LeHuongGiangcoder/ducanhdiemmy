"use client";

import Image from "next/image";
import { useState } from "react";
import { couple, engagement, engagementTimes, families } from "@/data/wedding";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import Timeline from "./Timeline";
import styles from "./Ceremony.module.css";

/**
 * The family ceremonies — the invitation behind the toggle.
 *
 * One afternoon at two addresses: the ăn hỏi and vu quy at the bride's house,
 * the thành hôn at the groom's, with the rước dâu in between carrying everyone
 * from one to the other. So the guest picks a household rather than a
 * ceremony, and the running order underneath is deliberately not tabbed with
 * it — it is one sequence that crosses both houses, and splitting it would
 * leave each half describing a journey that ends nowhere.
 *
 * The card is the printed one, set in the design system's own parts: the wine
 * damask the section surfaces already provide, the display face for the rite,
 * TAN Pearl for the couple. Two things the paper does that the screen does
 * not — the floral border, which is artwork we do not have as an asset, and
 * "xin vui lòng xem ở mặt sau", which is a line about a card having a back.
 *
 * Whichever household is selected leads: its block sits on the left of the
 * pair and its child's name is the first of the two, exactly as each printed
 * card is laid out for the family sending it.
 */

/** Selected household first, then the other one. */
const ORDER = { groom: ["groom", "bride"], bride: ["bride", "groom"] };

export default function Ceremony() {
  const { t } = useContent();
  const [side, setSide] = useState("groom");
  const card = t.ceremony.sides[side];
  const households = ORDER[side];
  // The child of the selected house is named first, matching their card.
  const names =
    side === "groom"
      ? [couple.groomFullVn, couple.brideFullVn]
      : [couple.brideFullVn, couple.groomFullVn];

  return (
    <>
      <section
        id="ceremony"
        className={`section section--screen section--pattern-wine ${styles.section}`}
      >
        <div className={`shell stack center ${styles.shell}`}>
          {/*
           * Two tabs over one panel. `radiogroup` rather than `tablist`: the
           * panel is a single region that re-renders, not two panels being
           * shown and hidden, and announcing tabs the guest cannot arrow
           * between would promise a keyboard model this does not implement.
           */}
          <Reveal
            className={styles.tabs}
            role="radiogroup"
            aria-label={t.ceremony.toggle.anHoi}
          >
            {["groom", "bride"].map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={side === key}
                className={`${styles.tab} ${fallbackFontClass(t.ceremony.tabs[key])}`}
                data-on={side === key ? "true" : "false"}
                onClick={() => setSide(key)}
              >
                {t.ceremony.tabs[key]}
              </button>
            ))}
          </Reveal>

          {/*
           * Keyed on the household, so React rebuilds the card rather than
           * editing it in place — that is what lets the fade below run again
           * on every switch instead of only the first time.
           */}
          <article key={side} className={styles.card}>
            <div className={styles.households}>
              {households.map((key) => (
                <div className={styles.household} key={key}>
                  <p className={styles.householdLabel}>
                    {t.ceremony.households[key]}
                  </p>
                  <ul className={styles.householdNames}>
                    {families[key].map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <span className={`rule-mark ${styles.divider}`} aria-hidden="true">
              <span className="rule-mark__dot" />
            </span>

            <p className={`eyebrow ${styles.announce}`}>{t.ceremony.announce}</p>
            <p className={styles.line}>{card.line}</p>

            <h2
              className={`h-1 display-caps ${styles.rite} ${fallbackFontClass(
                card.title,
              )}`}
            >
              {card.title}
            </h2>

            {/*
             * No fallbackFontClass here, unlike everywhere else a name is set.
             * Both of these carry tone marks TAN Pearl does not have (ũ, ễ, ấ),
             * so the swap to DFVN is not conditional — and the size correction
             * that comes with it has to be declared where the font-size is,
             * which is .couple and not these spans. See the note there.
             */}
            <p className={styles.couple}>
              <span>{names[0]}</span>
              <span className={styles.amp}>&</span>
              <span>{names[1]}</span>
            </p>

            <p className={styles.lead}>{t.ceremony.heldOn}</p>

            {/* Weekday · date · hour, divided the way the card divides them. */}
            <p className={styles.when}>
              <span>{t.ceremony.weekday}</span>
              <span className={styles.whenRule} aria-hidden="true" />
              <span className={styles.date}>{engagement.dateShort}</span>
              <span className={styles.whenRule} aria-hidden="true" />
              <span>{engagement.timeLabel}</span>
            </p>

            <p className={styles.lunar}>({engagement.lunar})</p>

            <p className={styles.lead}>{t.ceremony.at}</p>
            <p
              className={`${styles.home} display-caps ${fallbackFontClass(card.home)}`}
            >
              {card.home}
            </p>
            <p className={styles.address}>{engagement.homes[side].address}</p>
          </article>
        </div>
      </section>

      {/*
       * The running order, on the same rail the evening timeline uses. Shared
       * by both tabs and given its own screen, because it is the part a guest
       * comes back to on the day.
       */}
      <Timeline
        id="agenda"
        times={engagementTimes}
        copy={t.ceremony.agenda}
        surface="section--pattern-wine"
        cherub={null}
        mark={
          <Image
            src={couple.monogram}
            alt=""
            aria-hidden="true"
            width={876}
            height={900}
            sizes="(max-width: 479px) 16vw, 68px"
            className="monogram"
          />
        }
      />
    </>
  );
}
