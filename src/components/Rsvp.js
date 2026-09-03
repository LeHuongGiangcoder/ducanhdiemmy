"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import RsvpConfirmation from "./RsvpConfirmation";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./Rsvp.module.css";

/**
 * RSVP. The guest's slug rides along with the submission so the response is
 * filed against their invitation automatically — no "who are you?" field for
 * anyone who arrived through a personal link.
 *
 * The section has two faces. A guest who hasn't replied gets the form; one who
 * has gets their answer back, with their table on it. Which of the two is
 * decided by the sheet, not by this browser: the reply may have been sent from
 * a different phone, and the table is assigned by the couple days later. So the
 * row is re-read on mount and again after every send, uncached — see
 * /api/rsvp/status. The copy of the row that came down with the page is used
 * for the first paint, so the card is right immediately and only sharpens.
 */
export default function Rsvp({ guest }) {
  const { t } = useContent();
  const personalised = Boolean(guest.slug);
  const seats = guest.seats ?? 2;

  // The reply on file, as far as we know. null = none, so show the form.
  const [reply, setReply] = useState(() =>
    guest.attending === null || guest.attending === undefined
      ? null
      : {
          attending: guest.attending,
          guestCount: guest.guestCount || 1,
          table: guest.table ?? "",
          name: guest.name,
        },
  );
  // Set when the guest asks to change an answer already on file: the card gives
  // way to the form until they send again.
  const [editing, setEditing] = useState(false);

  const [attending, setAttending] = useState(guest.attending ?? null);
  const [guestCount, setGuestCount] = useState(guest.guestCount || 1);
  const [name, setName] = useState(personalised ? guest.name : "");
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [error, setError] = useState("");

  /**
   * The row as it stands right now — the only source for the table number.
   * Returns null when there is nothing newer to show (no reply on file, or the
   * read failed), in which case whatever came down with the page still stands.
   */
  const readStatus = useCallback(async () => {
    if (!personalised) return null;
    try {
      const res = await fetch(
        `/api/rsvp/status?slug=${encodeURIComponent(guest.slug)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data.attending === null || data.attending === undefined) return null;
      return {
        attending: data.attending,
        guestCount: data.guestCount || 1,
        table: data.table ?? "",
        name: data.name || guest.name,
      };
    } catch {
      // Offline, or the sheet is slow — not worth an error in front of a guest.
      return null;
    }
  }, [personalised, guest.slug, guest.name]);

  useEffect(() => {
    let cancelled = false;
    readStatus().then((fresh) => {
      if (!cancelled && fresh) setReply(fresh);
    });
    return () => {
      cancelled = true;
    };
  }, [readStatus]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (attending === null) {
      setError(t.rsvp.errorAttending);
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: guest.slug,
          name,
          attending,
          guestCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.rsvp.errorGeneric);

      setStatus("idle");
      setEditing(false);
      // Show the answer straight away, then let the sheet correct it — a table
      // may already be waiting on the row this reply just landed in.
      setReply({ attending, guestCount, table: guest.table ?? "", name });
      readStatus().then((fresh) => {
        if (fresh) setReply(fresh);
      });
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  const showCard = reply && !editing;

  return (
    <section id="rsvp" className="section section--screen section--pattern-wine">
      <div className="shell stack center">
        <Reveal className="masthead">
          <p className="eyebrow">{t.rsvp.eyebrow}</p>
          <h2 className={`h-1 display-caps ${fallbackFontClass(t.rsvp.title)}`}>{t.rsvp.title}</h2>
          <p className="body">{t.rsvp.intro}</p>
        </Reveal>

        {showCard ? (
          <RsvpConfirmation
            guest={guest}
            reply={reply}
            onEdit={() => {
              setEditing(true);
              setAttending(reply.attending);
              setGuestCount(reply.guestCount || 1);
            }}
          />
        ) : (
          <Reveal delay={120} className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit}>
              {personalised ? (
                // Arrived through their own link: the name is already known,
                // so it is shown as confirmation rather than asked for again.
                <p className={styles.replyingAs}>
                  {/* Vietnamese drops the prefix — the name stands alone. */}
                  {t.rsvp.forPrefix ? `${t.rsvp.forPrefix} ` : ""}
                  <strong>{guest.name}</strong>
                </p>
              ) : (
                <div className="field">
                  <label className="label" htmlFor="rsvp-name">
                    {t.rsvp.nameLabel}
                  </label>
                  <input
                    id="rsvp-name"
                    className="input"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <fieldset className="field">
                <legend className="label">{t.rsvp.attendingLegend}</legend>
                <div className="choices">
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      checked={attending === true}
                      onChange={() => setAttending(true)}
                    />
                    <span className="choice__mark" aria-hidden="true" />
                    {t.rsvp.accept}
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      checked={attending === false}
                      onChange={() => setAttending(false)}
                    />
                    <span className="choice__mark" aria-hidden="true" />
                    {t.rsvp.decline}
                  </label>
                </div>
              </fieldset>

              {attending === true && seats > 1 && (
                <fieldset className="field">
                  <legend className="label">{t.rsvp.guestsLegend}</legend>
                  <div className="choices">
                    {Array.from({ length: seats }, (_, i) => i + 1).map((count) => (
                      <label key={count} className="choice">
                        <input
                          type="radio"
                          name="guestCount"
                          checked={guestCount === count}
                          onChange={() => setGuestCount(count)}
                        />
                        <span className="choice__mark" aria-hidden="true" />
                        {String(count).padStart(2, "0")}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Cupid, aimed at the one thing left to do. */}
              <Image
                src="/assets/cherub-arrow.png"
                alt=""
                aria-hidden="true"
                width={800}
                height={758}
                sizes="(max-width: 479px) 28vw, 121px"
                className={styles.cherub}
              />

              <button
                type="submit"
                className={`btn btn--primary ${styles.submit}`}
                disabled={status === "sending"}
              >
                {status === "sending" ? t.rsvp.sending : t.rsvp.submit}
              </button>

              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="form-note">{t.rsvp.deadline}</p>
              )}
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}
