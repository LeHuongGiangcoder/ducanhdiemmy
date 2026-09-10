"use client";

import { useCallback, useEffect, useState } from "react";
import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import styles from "./Menu.module.css";

/**
 * Targets only — the labels are per-language, matched by position.
 *
 * Two sets, because the invitation has two: the guests asked to both days can
 * switch the page under this menu (see Invitation.js), and a link to #venue
 * while the family ceremonies are showing would scroll to nothing at all.
 */
const LINKS = ["#home", "#venue", "#dress-code", "#timeline", "#rsvp"];
const CEREMONY_LINKS = ["#home", "#agenda"];

export default function Menu({ visible, ceremony = null }) {
  const { t } = useContent();
  const [open, setOpen] = useState(false);
  const showingCeremony = ceremony === "anHoi";
  const links = showingCeremony ? CEREMONY_LINKS : LINKS;
  const labels = showingCeremony ? t.ceremony.menuLinks : t.menu.links;

  const toggleMenu = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    closeMenu();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Lock scrolling when menu is open
  useEffect(() => {
    if (open) {
      // If the body is already locked by the gate, we don't need to do anything,
      // but this menu only appears after the gate is gone anyway.
      document.body.dataset.locked = "true";
    } else {
      // We rely on the gate logic handling its own lock, this just unsets it.
      document.body.dataset.locked = "false";
    }
    return () => {
      document.body.dataset.locked = "false";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={toggleMenu}
        className={`btn-icon ${styles.toggle} ${visible ? styles.on : ""}`}
        aria-label={open ? t.menu.close : t.menu.open}
        aria-expanded={open}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            {open ? (
              <>
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </span>
      </button>

      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} aria-hidden={!open}>
        <nav className={styles.nav}>
          {links.map((href, i) => (
            <a
              key={href}
              href={href}
              onClick={(e) => scrollTo(e, href)}
              className={`${styles.link} ${fallbackFontClass(labels[i])}`}
              tabIndex={open ? 0 : -1}
            >
              {labels[i]}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
