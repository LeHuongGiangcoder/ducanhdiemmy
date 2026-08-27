"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./Menu.module.css";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#venue", label: "Venue" },
  { href: "#dress-code", label: "Dress Code" },
  { href: "#timeline", label: "Timeline" },
  { href: "#rsvp", label: "R.S.V.P." },
];

export default function Menu({ visible }) {
  const [open, setOpen] = useState(false);

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
        aria-label={open ? "Close menu" : "Open menu"}
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
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className={styles.link}
              tabIndex={open ? 0 : -1}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
