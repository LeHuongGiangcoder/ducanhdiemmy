"use client";

import { useContent } from "./LanguageProvider";
import { fallbackFontClass } from "@/lib/aegean";
import styles from "./CelebrationSwitch.module.css";

/**
 * The switch between the two celebrations, for the guests asked to both.
 *
 * It appears in two places and is the same control in both: over the hero
 * video while the reception is showing, and at the head of the ceremony page
 * once it isn't — because that page replaces the hero, and a switch that
 * vanished when you used it would leave no way back.
 *
 * One component rather than two so the two never drift: the labels, the order
 * and the pressed state are the guest's only signpost between two days, and
 * they have to read identically wherever the switch turns up.
 */

/** The two celebrations, in the order the switch offers them. */
const CELEBRATIONS = ["thanhHon", "anHoi"];

export default function CelebrationSwitch({ value, onChange, className = "" }) {
  const { t } = useContent();

  return (
    <div
      className={`${styles.switch} ${className}`.trim()}
      role="radiogroup"
      aria-label={t.ceremony.toggle.label}
    >
      {CELEBRATIONS.map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          className={`${styles.segment} ${fallbackFontClass(t.ceremony.toggle[key])}`}
          data-on={value === key ? "true" : "false"}
          onClick={() => onChange?.(key)}
        >
          {t.ceremony.toggle[key]}
        </button>
      ))}
    </div>
  );
}
