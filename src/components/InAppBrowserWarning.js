"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./InAppBrowserWarning.module.css";

/**
 * Gets guests out of the Zalo / Facebook / Instagram in-app browser.
 *
 * Those webviews are where this invitation is weakest: the hero is a video that
 * has to autoplay, the music needs an audio context, and older ones lay the
 * sections out wrong. Most guests arrive from exactly there, because that is
 * where the link gets sent.
 *
 * What is actually possible differs by platform, and it is worth being precise
 * because the difference is not a bug we can fix:
 *
 *   Android — a webview can hand a URL to Chrome through an `intent://` URL.
 *             This works, and it is attempted automatically.
 *   iOS     — there is no supported way for an app's webview to open Safari.
 *             Apple does not expose one. The `x-safari-https:` scheme is
 *             honoured by some hosts and ignored by others; it is tried once
 *             because it costs nothing, and then the guest is asked.
 *
 * So the button is not a fallback for the automatic path — on iOS it *is* the
 * path, and it has to be a real tap either way, since webviews block
 * navigation to another app that no gesture asked for.
 */

/** Substrings these apps put in their user agent. */
const IN_APP = ["FBAN", "FBAV", "Instagram", "Zalo", "Messenger", "TikTok"];

const TITLE = "Mở bằng trình duyệt";
/** Only ever attempt the hand-off once per tab, or a failed one loops. */
const TRIED_KEY = "invitation:left-in-app";

const subscribe = () => () => {};
const detect = () => IN_APP.some((pattern) => navigator.userAgent.includes(pattern));
/** No user agent to read while rendering on the server. */
const notInApp = () => false;

const isAndroid = () => /Android/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Hand the current URL to a real browser. Returns nothing useful: a webview
 * gives no signal either way, which is why the overlay stays up regardless.
 */
function openInBrowser() {
  const { href, host, pathname, search } = window.location;

  if (isAndroid()) {
    // S.browser_fallback_url keeps a device without Chrome on the page it was
    // already showing rather than dropping it on an error screen.
    window.location.href =
      `intent://${host}${pathname}${search}#Intent;scheme=https;` +
      `package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(href)};end`;
    return;
  }

  if (isIOS()) {
    window.location.href = `x-safari-https://${host}${pathname}${search}`;
    return;
  }

  window.open(href, "_blank", "noopener");
}

export default function InAppBrowserWarning() {
  /*
   * Read through useSyncExternalStore rather than an effect that sets state:
   * the user agent is an external value React does not own. It also keeps the
   * server render honest — nothing is emitted into the static HTML, so this
   * cannot flash for the guests who are already in a real browser.
   */
  const isInApp = useSyncExternalStore(subscribe, detect, notInApp);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isInApp) return;
    let tried = null;
    try {
      tried = sessionStorage.getItem(TRIED_KEY);
      sessionStorage.setItem(TRIED_KEY, "1");
    } catch {
      // Private mode — fall through and simply do not auto-attempt.
      return;
    }
    // Android only: iOS ignores an untapped scheme change, and a guest who
    // came back on purpose should not be thrown out again.
    if (!tried && isAndroid()) openInBrowser();
  }, [isInApp]);

  if (!isInApp) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h2 className={styles.title}>{TITLE}</h2>
        <p className={styles.text}>
          Thiệp có video và nhạc nền, xem trong ứng dụng {isIOS() ? "sẽ" : "có thể"}{" "}
          bị vỡ khung hình hoặc mất tiếng.
        </p>

        <button type="button" className={styles.action} onClick={openInBrowser}>
          {isAndroid() ? "Mở bằng Chrome" : "Mở bằng Safari"}
        </button>

        <p className={styles.hint}>
          Nếu nút trên không mở được, bấm nút <strong>… (ba chấm)</strong> ở góc
          màn hình rồi chọn <strong>“Mở bằng trình duyệt”</strong>.
        </p>

        <button type="button" className={styles.copy} onClick={copyLink}>
          {copied ? "Đã chép link ✓" : "Chép link để dán vào trình duyệt"}
        </button>
      </div>
    </div>
  );
}
