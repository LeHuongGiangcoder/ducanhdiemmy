"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DressCode from "./DressCode";
import { LanguageProvider } from "./LanguageProvider";
import Hero from "./Hero";
import Intro from "./Intro";
import Menu from "./Menu";
import MusicToggle from "./MusicToggle";
import Rsvp from "./Rsvp";
import ThankYou from "./ThankYou";
import Timeline from "./Timeline";
import Venue from "./Venue";

/*
 * Audio-only AAC, not the .mp4 the track was delivered in — that carried an
 * H.264 video track interleaved with the sound, so the browser had to pull
 * megabytes of unused video frames before it had enough audio to start.
 */
const MUSIC_SRC = "/audio/rewrite-the-stars.m4a";
/** Must match --dur-gate in globals.css (the cross-dissolve length). */
const GATE_MS = 1600;

/**
 * Owns the entrance sequence.
 *
 * Mobile browsers only allow audio to start inside a real user gesture, so
 * "Save the Date" is doing three jobs at once: it starts the music, lifts the
 * intro curtain, and releases the scroll lock on the body.
 */
export default function Invitation({ guest, bypassIntro = false }) {
  const [opened, setOpened] = useState(bypassIntro); // gesture received
  const [gateGone, setGateGone] = useState(bypassIntro); // curtain finished lifting
  const [playing, setPlaying] = useState(false);
  // Until the audio file is supplied there is nothing to toggle, so the
  // control hides itself rather than sitting there doing nothing.
  const [hasAudio, setHasAudio] = useState(true);
  const audioRef = useRef(null);

  /**
   * `preload="auto"` starts fetching before React hydrates, so a missing file
   * can fail before the onError prop is ever attached. Re-check the element on
   * mount to catch that case.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio?.error) setHasAudio(false);
  }, []);

  // Lock scrolling behind the gate.
  useEffect(() => {
    document.body.dataset.locked = gateGone ? "false" : "true";
    return () => {
      document.body.dataset.locked = "false";
    };
  }, [gateGone]);

  const open = useCallback(() => {
    if (opened) return;
    setOpened(true);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          fadeTo(audio, 0.55, 2200);
        })
        .catch(() => {
          // No music file yet, or the browser refused — the invitation still opens.
          setPlaying(false);
        });
    }

    window.setTimeout(() => {
      setGateGone(true);
      window.scrollTo({ top: 0, behavior: "auto" });
    }, GATE_MS);
  }, [opened]);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, []);

  return (
    <LanguageProvider lang={guest.lang}>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        onError={() => setHasAudio(false)}
      />

      {!gateGone && <Intro onOpen={open} closing={opened} />}

      <main aria-hidden={!gateGone}>
        <Hero guest={guest} started={gateGone} revealing={opened} />
        <Venue />
        <DressCode />
        <Timeline />
        <Rsvp guest={guest} />
        <ThankYou />
      </main>

      <MusicToggle
        playing={playing}
        onToggle={toggleMusic}
        visible={gateGone && hasAudio}
      />
      <Menu visible={gateGone} />
    </LanguageProvider>
  );
}

/** Gentle volume ramp so the music doesn't slam in at full level. */
function fadeTo(audio, target, ms) {
  const steps = 30;
  const step = target / steps;
  let i = 0;
  const timer = window.setInterval(() => {
    i += 1;
    audio.volume = Math.min(target, step * i);
    if (i >= steps) window.clearInterval(timer);
  }, ms / steps);
}
