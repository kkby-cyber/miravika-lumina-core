import { useState } from "react";
import { toast } from "sonner";
import { trackGenerateLead, trackSignUp } from "@/lib/analytics";
import { NexusApiError, subscribeToNewsletter } from "@/lib/nexus";

/**
 * Shared newsletter capture. The subscription is saved in Nexus before the visitor sees a
 * confirmation, and lead/sign-up analytics fire only for a subscription that was stored.
 */
export function useNewsletterSignup(source: string) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    const value = email.trim();
    if (!value || submitting) return false;
    setSubmitting(true);
    try {
      await subscribeToNewsletter(value);
      trackGenerateLead(source);
      trackSignUp("newsletter");
      toast.success("Welcome to The Miravika List", {
        description: "You'll be the first to hear about new arrivals.",
      });
      setEmail("");
      return true;
    } catch (error) {
      toast.error("We couldn't add you just yet", {
        description:
          error instanceof NexusApiError ? error.message : "Please try again in a moment.",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { email, setEmail, submitting, submit };
}
