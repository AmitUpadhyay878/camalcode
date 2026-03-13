import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "@/functions/inngest";
import { generateReview } from "@/functions/inngest/review";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexRepo,
    generateReview
  ],
});