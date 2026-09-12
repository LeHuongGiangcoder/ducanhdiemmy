"use client";

import { useState } from "react";
import CelebrationSwitch from "./CelebrationSwitch";
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

/**
 * The households, selected family first.
 *
 * Each printed card leads with the family sending it, and this screen follows
 * it: on the bride's tab the bride's parents are the left-hand column, on the
 * groom's tab the groom's are.
 *
 * There is a cost, and it is worth naming rather than rediscovering. The tab
 * row directly above reads "Nhà Trai | Nhà Gái" in a fixed order, so on the
 * bride's tab the two rows show the same two words in opposite orders about
 * forty pixels apart — which is why an earlier cut of this screen pinned the
 * columns to the tabs' order instead. The couple asked for the paper's
 * arrangement back: the card is what a guest reads on the day, and the family
 * sending it leads. So the columns swap with the tab, the way the couple's
 * names below them already did.
 */
const householdOrder = (side) =>
  side === "bride" ? ["bride", "groom"] : ["groom", "bride"];

export default function Ceremony({ ceremony, onCeremony }) {
  const { t } = useContent();
  const [side, setSide] = useState("groom");
  const card = t.ceremony.sides[side];
  // The child of the selected house is named first, matching their card.
  const names =
    side === "groom"
      ? [couple.groomFullVn, couple.brideFullVn]
      : [couple.brideFullVn, couple.groomFullVn];

  return (
    <>
      {/*
       * This section stands in for the hero, so it carries the hero's job as
       * well as its own: it is what "#home" means while the ceremonies are
       * showing, and it opens with the couple's mark at the size the video
       * sets it, so the two screens read as the same invitation rather than
       * two different ones.
       */}
      <section
        id="home"
        className={`section section--screen section--pattern-wine ${styles.section}`}
      >
        <div className={`shell stack center ${styles.shell}`}>
          <Reveal className={styles.masthead}>
            {/*
             * The couple's mark, in gold rather than the cream it is drawn in
             * — so it and the lily at the head of the running order are the
             * same metal, and this screen has one ornament colour rather than
             * two. Masked for the same reason the lily is: see .monogram in
             * the stylesheet.
             */}
            <span className={styles.monogram} aria-hidden="true" />
          </Reveal>

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
          {/*
           * data-side, because the two printed cards do not size their rite
           * the same way: the groom's sets "LỄ THÀNH HÔN" a shade under the
           * couple's names, the bride's sets "LỄ ĂN HỎI & VU QUY" well above
           * them and over two lines. See .rite in the stylesheet.
           */}
          <article key={side} data-side={side} className={styles.card}>
            <div className={styles.households}>
              {householdOrder(side).map((key) => (
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

            {/*
             * Directions to the house on the tab that is showing — the one
             * thing on this card a guest acts on rather than reads. Same
             * control as the reception's, down to its wording: `venue.mapLink`
             * is "view directions", which is what this is, and a second string
             * saying the same thing in the same language is a second string to
             * keep in step.
             */}
            <a
              className={styles.mapLink}
              href={engagement.homes[side].mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.venue.mapLink}
            </a>
          </article>

          {/*
           * The way back to the reception — see CelebrationSwitch.js.
           *
           * At the foot of this screen rather than its head, so it sits where
           * the hero video's copy of it sits: the two celebrations are one
           * control in one place, and a guest who has just read a card should
           * find the other day directly under it. It is in the flow rather
           * than pinned to the viewport because this screen is taller than
           * one — pinned, it would cover the card it belongs to.
           */}
          <CelebrationSwitch
            value={ceremony}
            onChange={onCeremony}
            className={styles.switch}
          />
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
        className={styles.agenda}
        cherub={null}
        heading="h-2"
        mark={
          <span className={`calla ${styles.agendaOrnament}`} aria-hidden="true" />
        }
      />
    </>
  );
}
