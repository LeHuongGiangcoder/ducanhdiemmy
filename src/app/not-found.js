import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section section--pattern-navy section--full">
      <div className="shell stack center">
        <div className="masthead">
          <p className="eyebrow">Not Found</p>
          <h1 className="h-2">This invitation could not be opened</h1>
          <p className="body">
            Please check the link you were sent, or open the general invitation
            below.
          </p>
        </div>
        <Link href="/" className="btn btn--outline">
          Open Invitation
        </Link>
      </div>
    </main>
  );
}
