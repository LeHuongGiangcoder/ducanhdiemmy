"use client";

import { useState } from "react";
import Ornament from "./Ornament";
import Reveal from "./Reveal";
import styles from "./Rsvp.module.css";

/**
 * RSVP. The guest's slug rides along with the submission so the response is
 * filed against their invitation automatically — no "who are you?" field for
 * anyone who arrived through a personal link.
 */
export default function Rsvp({ guest }) {
  const personalised = Boolean(guest.slug);
  const seats = guest.seats ?? 2;

  const [attending, setAttending] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (attending === null) {
      setError("Please let us know if you can join us.");
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
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <section id="rsvp" className="section section--screen section--pattern-navy">
      <Ornament src="/assets/cherub-tray.webp" place="o-tl" tone="ornament--soft" />
      <Ornament
        src="/assets/cherub-bucket.webp"
        place="o-br"
        tone="ornament--soft"
        flip
      />

      <div className="shell stack center">
        <Reveal className="masthead">
          <p className="eyebrow">Kindly Reply</p>
          <h2 className="h-1">R.S.V.P</h2>
          <p className="body">
            {personalised ? (
              <>
                This invitation is reserved for{" "}
                <span className="gold">{guest.name}</span>
                {seats > 1 ? ` and up to ${seats} seats.` : "."}
              </>
            ) : (
              "We would be delighted to know whether you can join us."
            )}
          </p>
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
                ? "Wonderful — a glass will be waiting for you."
                : "Thank you for letting us know. You will be missed."}
            </p>
            {guest.luckyNumber && attending ? (
              <p className="body">
                Your lucky number is{" "}
                <span className={styles.lucky}>{guest.luckyNumber}</span> — please
                keep it until the end of the celebration.
              </p>
            ) : null}
          </Reveal>
        ) : (
          <Reveal delay={120} className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit}>
              {!personalised && (
                <div className="field">
                  <label className="label" htmlFor="rsvp-name">
                    Your name
                  </label>
                  <input
                    id="rsvp-name"
                    className="input"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <fieldset className="field">
                <legend className="label">Will you be joining us?</legend>
                <div className="choices choices--2">
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      checked={attending === true}
                      onChange={() => setAttending(true)}
                    />
                    Joyfully accept
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      checked={attending === false}
                      onChange={() => setAttending(false)}
                    />
                    Regretfully decline
                  </label>
                </div>
              </fieldset>

              {attending === true && seats > 1 && (
                <div className="field">
                  <label className="label" htmlFor="rsvp-count">
                    How many of you?
                  </label>
                  <select
                    id="rsvp-count"
                    className="select"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                  >
                    {Array.from({ length: seats }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label className="label" htmlFor="rsvp-message">
                  A note for the couple <span className={styles.opt}>(optional)</span>
                </label>
                <textarea
                  id="rsvp-message"
                  className="textarea"
                  rows={3}
                  placeholder="Your wishes for Duc Anh & Diem My…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send Response"}
              </button>

              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="form-note">Kindly reply before 1 November.</p>
              )}
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}
