import { useQuery } from "convex/react";
import { useState, useEffect } from "react";

// A wrapper around useQuery that gracefully handles deployment errors
// This is useful when Convex functions may not be deployed yet
export function useSafeQuery<T>(
  queryFn: any,
  args: any,
  defaultValue: T | undefined = undefined
): T | undefined {
  const [hasError, setHasError] = useState(false);
  
  // If we've encountered an error, don't retry
  if (hasError) {
    return defaultValue;
  }
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useQuery(queryFn, args);
    return result;
  } catch (error: any) {
    // Check if this is a "function not found" error
    if (error?.message?.includes("Could not find public function")) {
      console.warn("Convex function not deployed:", error.message);
      setHasError(true);
      return defaultValue;
    }
    throw error;
  }
}
