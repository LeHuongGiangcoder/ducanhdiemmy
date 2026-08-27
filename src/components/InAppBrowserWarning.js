"use client";

import { useSyncExternalStore } from "react";
import styles from "./InAppBrowserWarning.module.css";

/**
 * Asks guests who opened the link inside Zalo, Facebook or Instagram to move to
 * a real browser.
 *
 * Those in-app webviews are where this invitation is weakest: autoplay and
 * audio are restricted, and the hero video is the whole card. Most guests will
 * arrive from exactly there, since that is where the link gets sent.
 */

/** Substrings these apps put in their user agent. */
const IN_APP = [
  "FBAN", // Facebook
  "FBAV", // Facebook
  "Instagram",
  "Zalo",
  "Messenger",
  "TikTok",
];

const TITLE = "Mở bằng trình duyệt";

/** The user agent cannot change while the page is open. */
const subscribe = () => () => {};
const detect = () => IN_APP.some((pattern) => navigator.userAgent.includes(pattern));
/** No user agent to read while rendering on the server. */
const notInApp = () => false;

export default function InAppBrowserWarning() {
  /*
   * Read through useSyncExternalStore rather than an effect that sets state:
   * the user agent is an external value React does not own, and this is the
   * API for exactly that. It also keeps the server render honest — nothing is
   * emitted into the static HTML, so the warning cannot flash for the guests
   * who are already in a real browser.
   */
  const isInApp = useSyncExternalStore(subscribe, detect, notInApp);
  if (!isInApp) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h2 className={styles.title}>{TITLE}</h2>
        <p className={styles.text}>
          Để trải nghiệm hình ảnh và âm thanh của thiệp mời tốt nhất, vui lòng
          bấm vào nút <strong>… (ba chấm)</strong> ở góc trên bên phải hoặc bên
          dưới màn hình và chọn{" "}
          <strong>“Mở bằng trình duyệt” (Open in Safari / Chrome)</strong>.
        </p>
        <div className={styles.iconWrap}>↗</div>
      </div>
    </div>
  );
}
