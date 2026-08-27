"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { getContent, normaliseLang } from "@/data/content";

/**
 * The invitation's language, and the copy that goes with it.
 *
 * The language belongs to the *guest*, not to the URL: every guest has one
 * personal link, already printed and sent, and it must not need a /vi/ or /en/
 * segment bolted on. So the sheet decides, and this provider carries the answer
 * down to the sections.
 */

const LanguageContext = createContext(null);

/** The query string never changes while the invitation is open. */
const subscribe = () => () => {};
const readOverride = () =>
  new URLSearchParams(window.location.search).get("lang");
/** On the server there is no URL to read, so the guest's own language stands. */
const noOverride = () => null;

export function LanguageProvider({ lang, children }) {
  /**
   * `?lang=vi` previews the other version without editing a guest's row.
   *
   * Read through useSyncExternalStore rather than from the page's searchParams:
   * touching searchParams on the server makes the whole invitation render on
   * demand, which is the trade these pages exist to avoid. This keeps the page
   * static and resolves the override on the client, where the URL lives.
   */
  const override = useSyncExternalStore(subscribe, readOverride, noOverride);
  const active = normaliseLang(override ?? lang);

  useEffect(() => {
    document.documentElement.lang = active;
  }, [active]);

  return (
    <LanguageContext.Provider value={{ lang: active, t: getContent(active) }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Copy for the active language. Throws early rather than rendering blanks. */
export function useContent() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useContent must be used inside <LanguageProvider>");
  return value;
}
