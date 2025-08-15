// Checkout hook disabled - checkout endpoint not available
export const useCheckout = () => {
  return {
    mutate: () => {
      console.warn("Checkout feature is disabled");
    },
    isPending: false,
    isError: false,
    error: null,
  };
};
