import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DisclaimerBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
        <strong>Educational Tool:</strong> This chatbot provides general information about IVF. 
        Always consult with your healthcare provider for personalized medical advice and treatment decisions.
      </AlertDescription>
    </Alert>
  );
}
