import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";
import { useGetSubscription } from "@/features/subscriptions/api/use-get-subscription";

export const usePaywall = () => {
  // No authentication required - all features are free
  return {
    isLoading: false,
    shouldBlock: false,
    triggerPaywall: () => {
      // No paywall - do nothing
    },
  };
};
