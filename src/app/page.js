import Invitation from "@/components/Invitation";
import { defaultGuest } from "@/data/wedding";

/** Generic invitation — anyone arriving without a personal link. */
export default function Page() {
  return <Invitation guest={defaultGuest} />;
}
