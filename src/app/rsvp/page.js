import Rsvp from "@/components/Rsvp";
import { defaultGuest } from "@/data/wedding";

export default function RsvpPage() {
  return (
    <main>
      <Rsvp guest={defaultGuest} />
    </main>
  );
}
