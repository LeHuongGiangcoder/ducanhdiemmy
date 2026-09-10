"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Ceremony from "./Ceremony";
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
 *
 * At the master link the gate also asks for a code, and resolving it is a round
 * trip to the server — which is why priming the audio is a separate step the
 * gate calls before it awaits anything. The invitation that comes back replaces
 * the generic one in place, so the code, the music and the curtain are still a
 * single gesture rather than a second page load.
 */
export default function Invitation({ guest: initialGuest, bypassIntro = false, codeGate = false }) {
  // Swapped for the real invitation once the master link's code resolves.
  const [guest, setGuest] = useState(initialGuest);
  /**
   * Which of the two celebrations is on screen.
   *
   * Only the guests whose sheet row says so are asked to the family
   * ceremonies, and for everyone else this stays null — which is also what
   * hides the toggle, so the invitation is exactly what it was before.
   *
   * It is reset when the master link's code resolves to a different guest:
   * the person who just identified themselves may not be invited to the same
   * days as the placeholder they replaced.
   */
  const [ceremony, setCeremony] = useState(initialGuest.anHoi ? "thanhHon" : null);
  const skip = bypassIntro && !codeGate;
  const [opened, setOpened] = useState(skip); // gesture received
  const [gateGone, setGateGone] = useState(skip); // curtain finished lifting
  /*
   * The hero video and the music are ~5 MB between them, and neither is on
   * screen while the gate is up — but a `preload="auto"` on both starts them
   * fetching at first paint, which put the intro photograph behind megabytes
   * of media it has no reason to wait for. On a phone that was three seconds
   * of blank gate.
   *
   * So the media holds at `preload="none"` until the photograph has actually
   * painted, and only then starts. The gate is read for a few seconds before
   * anyone taps it, which is plenty of runway for the video to buffer.
   */
  const [mediaReady, setMediaReady] = useState(skip);
  /* Stable, so Intro's already-complete check isn't an effect that re-runs on
     every render of the gate. */
  const markMediaReady = useCallback(() => setMediaReady(true), []);
  const [playing, setPlaying] = useState(false);
  // Until the audio file is supplied there is nothing to toggle, so the
  // control hides itself rather than sitting there doing nothing.
  const [hasAudio, setHasAudio] = useState(true);
  const audioRef = useRef(null);

  /**
   * The fetch can begin before React hydrates, so a missing file can fail
   * before the onError prop is ever attached. Re-check the element on mount to
   * catch that case.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio?.error) setHasAudio(false);
  }, []);

  /*
   * `onLoad` on the intro photograph is the signal, but it is not guaranteed:
   * a decode failure, or a browser that never fires it for a cached image,
   * would strand the media at `preload="none"` and leave the tap waiting on a
   * cold video. The timer is the floor — worst case the media starts a beat
   * late, which is still later than the photograph.
   */
  useEffect(() => {
    if (mediaReady) return;
    const timer = window.setTimeout(() => setMediaReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, [mediaReady]);

  /*
   * Flipping the `preload` attribute is not enough on its own — once resource
   * selection has concluded under `none`, most browsers need an explicit
   * `load()` to go back and fetch. Skipped once the gate is open, where
   * `load()` would tear down the playback that just started.
   */
  useEffect(() => {
    if (!mediaReady || opened) return;
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.load();
  }, [mediaReady, opened]);

  // Lock scrolling behind the gate.
  useEffect(() => {
    document.body.dataset.locked = gateGone ? "false" : "true";
    return () => {
      document.body.dataset.locked = "false";
    };
  }, [gateGone]);

  /**
   * Starts the track silently, and must be called synchronously inside the tap:
   * iOS ties permission to the gesture, and the code check that follows is an
   * await, by which point the gesture is spent. Volume comes up later, in
   * open(), so nothing is audible if the code turns out to be wrong.
   */
  const primeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.volume = 0;
    audio.play().catch(() => {
      // No music file yet, or the browser refused — the invitation still opens.
    });
  }, []);

  const open = useCallback((resolved) => {
    if (opened) return;
    setOpened(true);

    if (resolved?.slug) {
      setGuest(resolved);
      setCeremony(resolved.anHoi ? "thanhHon" : null);
      // The address bar catches up with who this is, without a navigation that
      // would reload the page and take the music's gesture with it. A refresh
      // then lands on their own invitation, which opens without the code.
      window.history.replaceState(null, "", `/${resolved.slug}`);
    }

    const audio = audioRef.current;
    if (audio) {
      // Already playing at zero if the gate primed it; play() again is a no-op.
      audio
        .play()
        .then(() => {
          setPlaying(true);
          fadeTo(audio, 0.55, 2200);
        })
        .catch(() => {
          setPlaying(false);
        });
    }

    // Nothing to dissolve when the curtain was skipped — go straight through.
    if (bypassIntro) {
      setGateGone(true);
      return;
    }

    window.setTimeout(() => {
      setGateGone(true);
      window.scrollTo({ top: 0, behavior: "auto" });
    }, GATE_MS);
  }, [opened, bypassIntro]);

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
        preload={mediaReady ? "auto" : "none"}
        onError={() => setHasAudio(false)}
      />

      {!gateGone && (
        <Intro
          onOpen={open}
          onPrimeAudio={primeAudio}
          onBackdropLoad={markMediaReady}
          closing={opened}
          requireCode={codeGate}
        />
      )}

      <main aria-hidden={!gateGone}>
        {/*
         * The two celebrations are two different days at two different places,
         * so they get the page rather than sharing it — the hero included. The
         * video card names the Fairmont evening and nothing else, so it has no
         * business heading the afternoon at the family homes; Ceremony opens
         * with a screen of its own instead, and takes over "#home" while it is
         * showing.
         *
         * The reply form stays with the reception. That is the seated dinner,
         * the one with a table to assign.
         */}
        {ceremony === "anHoi" ? (
          <Ceremony ceremony={ceremony} onCeremony={setCeremony} />
        ) : (
          <>
            <Hero
              guest={guest}
              started={gateGone}
              revealing={opened}
              preloadVideo={mediaReady}
              ceremony={ceremony}
              onCeremony={setCeremony}
            />
            <Venue />
            <DressCode />
            <Timeline />
            <Rsvp guest={guest} />
          </>
        )}

        <ThankYou />
      </main>

      <MusicToggle
        playing={playing}
        onToggle={toggleMusic}
        visible={gateGone && hasAudio}
      />
      {/* The menu lists whatever is actually on the page — see Menu.js. */}
      <Menu visible={gateGone} ceremony={ceremony} />
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
