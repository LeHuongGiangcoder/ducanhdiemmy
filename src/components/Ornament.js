import Image from "next/image";

/**
 * Decorative cherub / winged-cat line art. Purely presentational: always
 * `alt=""` and aria-hidden so screen readers skip straight to the invitation.
 *
 * Two modes:
 *   default   absolutely positioned via the corner helpers (.o-tl / .o-tr / …)
 *   inline    stays in the flow — use with `.mark` for a centred motif
 */
export default function Ornament({
  src,
  place = "",
  tone = "",
  flip = false,
  float = false,
  inline = false,
  width = 320,
  height = 320,
  style,
  className = "",
}) {
  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      sizes="(max-width: 479px) 40vw, 172px"
      className={[
        inline ? "" : "ornament",
        inline ? "" : place,
        tone,
        flip ? "ornament--flip" : "",
        float ? "float" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    />
  );
}
