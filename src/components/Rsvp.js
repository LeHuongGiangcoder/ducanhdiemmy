"use client";

import Image from "next/image";
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
  const [name, setName] = useState(personalised ? guest.name : "");
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
    <section id="rsvp" className="section section--screen section--pattern-wine">
      <div className="shell stack center">
        <Reveal className="masthead">
          <p className="eyebrow">Kindly Reply</p>
          <h2 className="h-1">R.S.V.P.</h2>
          <p className="body">We would be delighted to have you join us.</p>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <fieldset className="field">
                <legend className="label">Will you be joining us?</legend>
                <div className="choices">
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      checked={attending === true}
                      onChange={() => setAttending(true)}
                    />
                    <span className="choice__mark" aria-hidden="true" />
                    Joyfully accept
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      checked={attending === false}
                      onChange={() => setAttending(false)}
                    />
                    <span className="choice__mark" aria-hidden="true" />
                    Regretfully decline
                  </label>
                </div>
              </fieldset>

              {attending === true && seats > 1 && (
                <div className="field">
                  <label className="label" htmlFor="rsvp-count">
                    Number of guests?
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

              {/* Cupid, aimed at the one thing left to do. */}
              <Image
                src="/assets/cherub-arrow.png"
                alt=""
                aria-hidden="true"
                width={800}
                height={758}
                sizes="(max-width: 767px) 28vw, 130px"
                className={styles.cherub}
              />

              <button
                type="submit"
                className={`btn btn--primary ${styles.submit}`}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send Response"}
              </button>

              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="form-note">Kindly reply by 20 September.</p>
              )}
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}
