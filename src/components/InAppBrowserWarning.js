"use client";

import { useEffect, useState } from "react";
import styles from "./InAppBrowserWarning.module.css";

export default function InAppBrowserWarning() {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for common in-app browsers
    const inAppPatterns = [
      "FBAN", "FBAV", // Facebook
      "Instagram",    // Instagram
      "Zalo",         // Zalo
      "Messenger",    // Messenger
      "TikTok",       // TikTok
    ];
    
    const isApp = inAppPatterns.some(pattern => ua.includes(pattern));
    setIsInApp(isApp);
  }, []);

  if (!isInApp) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <h2 className={styles.title}>Mở bằng trình duyệt</h2>
        <p className={styles.text}>
          Để trải nghiệm hình ảnh và âm thanh của thiệp mời tốt nhất, vui lòng bấm vào nút <strong>... (ba chấm)</strong> ở góc trên bên phải hoặc bên dưới màn hình và chọn <strong>"Mở bằng trình duyệt" (Open in Safari / Chrome)</strong>.
        </p>
        <div className={styles.iconWrap}>
          ↗
        </div>
      </div>
    </div>
  );
}
