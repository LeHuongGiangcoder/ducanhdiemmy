"use client";

import Image from "next/image";
import { useState } from "react";
import Ornament from "./Ornament";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import Reveal from "./Reveal";
import styles from "./Rsvp.module.css";

/**
 * RSVP. The guest's slug rides along with the submission so the response is
 * filed against their invitation automatically — no "who are you?" field for
 * anyone who arrived through a personal link.
 */
export default function Rsvp({ guest }) {
  const { t } = useContent();
  const personalised = Boolean(guest.slug);
  const seats = guest.seats ?? 2;

  const [attending, setAttending] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [name, setName] = useState(personalised ? guest.name : "");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

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
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <section id="rsvp" className="section section--screen section--pattern-wine">
      <div className="shell stack center">
        <Reveal className="masthead">
          <p className={`eyebrow ${fallbackFontClass(t.rsvp.eyebrow)}`}>{t.rsvp.eyebrow}</p>
          <h2 className={`h-1 ${fallbackFontClass(t.rsvp.title)}`}>{t.rsvp.title}</h2>
          <p className="body">{t.rsvp.intro}</p>
        </Reveal>

        {status === "done" ? (
          <Reveal className={`${styles.thanks} stack stack--snug center`}>
            <Ornament
              src="/assets/seal.webp"
              className="mark"
              inline
              tone="ornament--strong"
            />
            <p className="lede">
              {attending
                ? t.rsvp.thanksAccept
                : t.rsvp.thanksDecline}
            </p>
            {guest.luckyNumber && attending ? (
              <p className="body">
                {t.rsvp.luckyPrefix}{" "}
                <span className={styles.lucky}>{guest.luckyNumber}</span>{" "}
                {t.rsvp.luckySuffix}
              </p>
            ) : null}
          </Reveal>
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
