// Get subscription hook disabled - current endpoint not available
export const useGetSubscription = () => {
  return {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => {
      console.warn("Get subscription feature is disabled");
    },
  };
};
