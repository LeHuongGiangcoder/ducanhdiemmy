import Invitation from "@/components/Invitation";
import { defaultGuest } from "@/data/wedding";

export default function RsvpPage() {
  return <Invitation guest={defaultGuest} bypassIntro={true} />;
}
