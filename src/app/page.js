import Invitation from "@/components/Invitation";
import { defaultGuest } from "@/data/wedding";

/**
 * The master link — the one address printed on every card.
 *
 * It carries no name, so the gate asks for the guest's code and swaps in the
 * invitation it resolves to. Guests who were sent their own /slug link skip all
 * of this and open straight into their invitation.
 */
export default function Page() {
  return <Invitation guest={defaultGuest} codeGate={true} />;
}
