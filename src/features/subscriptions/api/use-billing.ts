// Billing hook disabled - billing endpoint not available
export const useBilling = () => {
  return {
    mutate: () => {
      console.warn("Billing feature is disabled");
    },
    isPending: false,
    isError: false,
    error: null,
  };
};
