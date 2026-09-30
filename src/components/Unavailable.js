"use client";

/**
 * Shown when we could not read the guest list and the slug is not in the
 * committed snapshot either — so we genuinely do not know whether this guest
 * exists. In practice that is one narrow case: someone added to the sheet
 * since the last `npm run guests:snapshot`, opening their link during a sheet
 * outage.
 *
 * Deliberately NOT the 404 page. The 404 page offers the general invitation,
 * and the general invitation asks for a code — so a guest whose link is
 * perfectly good was being told to go and find a number off their card. That
 * is the fault this screen exists to stop. Their link is right; only our
 * reading of the sheet was late.
 *
 * Note this screen can be cached for a few minutes like any other render of
 * this route (`x-nextjs-stale-time: 300`), which is why the wording asks them
 * to come back rather than promising that one tap will fix it.
 */
export default function Unavailable() {
  return (
    <main className="section section--pattern-navy section--full">
      <div className="shell stack center">
        <div className="masthead">
          <p className="eyebrow">Một chút nữa thôi · One moment</p>
          <h1 className="h-2">Thiệp đang được mở</h1>
          <p className="body">
            Thiệp mời của bạn vẫn ở đây — chúng tôi chỉ chưa tải xong danh sách
            khách mời. Vui lòng thử lại sau ít phút.
            <br />
            Your invitation is here — we just could not load the guest list.
            Please try again in a few minutes.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => window.location.reload()}
        >
          Thử lại · Try again
        </button>
      </div>
    </main>
  );
}
