/**
 * @fileoverview useAIGateway
 * Hook to securely request AI map generation from the backend.
 * Uses Dependency Injection for addToast to avoid Context Provider conflicts at the root level.
 */
import { useState, useCallback } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";

// Accept addToast as an argument instead of using the context hook
export const useAIGateway = ({ addToast }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const functions = getFunctions(app);

  const requestMapGeneration = useCallback(
    async (userPrompt, generationType = "NEW") => {
      setIsGenerating(true);
      addToast("Initiating secure AI compute...", "grey");

      const generateFn = httpsCallable(functions, "generateNeuralMap");

      try {
        const response = await generateFn({ userPrompt, generationType });
        addToast(response.data.message, "green");
        return response.data;
      } catch (error) {
        console.error("[AI_GATEWAY_FAULT]", error);
        addToast(error.message || "Failed to generate map.", "red");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [functions, addToast],
  );

  return { requestMapGeneration, isGenerating };
};
