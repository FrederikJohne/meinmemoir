import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (!process.env.POSTHOG_KEY) return null;

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.POSTHOG_KEY, {
      host: "https://eu.i.posthog.com",
    });
  }
  return posthogClient;
}
