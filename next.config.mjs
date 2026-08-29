/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Next 16 narrowed the allowed qualities to [75] and silently coerces any
     * other `quality` prop to the nearest allowed entry — so the two
     * full-screen photographs (Intro, ThankYou) were asking for 100 and being
     * served at 75, which is where a good part of their softness came from.
     * 90 keeps 97% of the source's detail at under half the bytes of 100.
     */
    qualities: [75, 90],
  },
};

export default nextConfig;
