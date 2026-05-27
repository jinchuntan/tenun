import { redirect } from "next/navigation";

// Search is now on the homepage — this route is no longer needed.
export default function IntentPage() {
  redirect("/");
}
