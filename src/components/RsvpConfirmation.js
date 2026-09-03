"use client";

import Ornament from "./Ornament";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./RsvpConfirmation.module.css";

/**
 * What stands in place of the form once a reply is in — a single card, in one
 * of three states:
 *
 *   seated    the couple have assigned a table; the number is the card
 *   pending   they are coming, but seating isn't finished yet
 *   declined  they can't make it
 *
 * All three share one shape — eyebrow, title, one line at display size, the
 * thank-you — so the card doesn't reflow into a different thing when a table
 * number lands on it. The table is read from the sheet on every visit, not
 * stored from the reply, because seating is decided long after the RSVP.
 */
export default function RsvpConfirmation({ guest, reply, onEdit }) {
  const { t } = useContent();
  const c = t.rsvp.confirm;

  const attending = reply.attending;
  const table = attending ? String(reply.table ?? "").trim() : "";
  const state = !attending ? c.declined : table ? c.seated : c.pending;
  const name = reply.name || guest.name;

  return (
    <Reveal className={`${styles.card} stack stack--snug center`}>
      <Ornament src="/assets/seal.webp" className="mark" inline tone="ornament--strong" />

      <p className="eyebrow">{state.eyebrow}</p>
      <h3 className={`h-2 display-caps ${styles.title} ${fallbackFontClass(state.title)}`}>
        {state.title}
      </h3>

      {/* The one line at display size: the number when there is one, and the
          words that stand in its place when there isn't. */}
      {table ? (
        <p className={`${styles.table} ${fallbackFontClass(table)}`}>{table}</p>
      ) : (
        <p className={styles.pending}>{state.headline}</p>
      )}

      <div className="rule-mark" aria-hidden="true">
        <span className="rule-mark__dot" />
      </div>

      <p className="body" style={{ whiteSpace: "pre-line", textWrap: "pretty" }}>
        {state.body(name)}
      </p>

      {state.note ? <p className={styles.note}>{state.note}</p> : null}

      {guest.luckyNumber && attending ? (
        <p className="body">
          {t.rsvp.luckyPrefix}{" "}
          <span className={styles.lucky}>{guest.luckyNumber}</span>{" "}
          {t.rsvp.luckySuffix}
        </p>
      ) : null}

      {/* A guest who changes their mind edits the same row, never a second one. */}
      <button type="button" className={`btn btn--primary ${styles.edit}`} onClick={onEdit}>
        {c.edit}
      </button>
    </Reveal>
  );
}
