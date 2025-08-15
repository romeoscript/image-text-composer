import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api.projects)["$post"], 200>;
type RequestType = InferRequestType<(typeof client.api.projects)["$post"]>["json"];

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      try {
        console.log("Creating project with data:", json);
        
        const response = await client.api.projects.$post({ json });
        
        console.log("API response:", response);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("API success result:", result);
        return result;
      } catch (error) {
        console.error("Project creation error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Project created.");

      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Project creation error:", error);
      toast.error(
        "Failed to create project. Please try again."
      );
    },
  });

  return mutation;
};
