import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { buildArtemisSystemPrompt, toolHelpers } from "@/lib/ai-context";
import { tripPlannerUrl } from "@/lib/site";

export const maxDuration = 60;

const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_GATEWAY_API_KEY
    ? "https://ai-gateway.vercel.sh/v1"
    : undefined,
});

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "AI is not configured. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY. Meanwhile call +30 22840 33333 or use the booking form.",
      },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { messages: UIMessage[]; locale?: string };
  const helpers = toolHelpers();

  const result = streamText({
    model: openai(process.env.AI_MODEL ?? "gpt-4o-mini"),
    system: buildArtemisSystemPrompt(),
    messages: await convertToModelMessages(body.messages),
    stopWhen: stepCountIs(3),
    tools: {
      checkVehicleFit: tool({
        description: "Look up an Artemis vehicle by slug",
        inputSchema: z.object({ slug: z.string() }),
        execute: async ({ slug }) => helpers.checkVehicleFit(slug),
      }),
      estimateSeasonRate: tool({
        description: "Estimate indicative daily car rate for a date using seasonal matrix",
        inputSchema: z.object({
          rateKey: z.string(),
          isoDate: z.string(),
        }),
        execute: async ({ rateKey, isoDate }) =>
          helpers.estimateSeasonRate(rateKey, isoDate),
      }),
      startBooking: tool({
        description: "Return a booking form deep link with optional vehicle slug",
        inputSchema: z.object({
          vehicleSlug: z.string().optional(),
          locale: z.enum(["en", "el"]).optional(),
        }),
        execute: async ({ vehicleSlug, locale }) => {
          const loc = locale ?? "en";
          const q = vehicleSlug ? `?vehicle=${encodeURIComponent(vehicleSlug)}` : "";
          return { url: `/${loc}/book${q}` };
        },
      }),
      openTripPlanner: tool({
        description: "Open Discover Cyclades Touristas AI full trip planner",
        inputSchema: z.object({
          locale: z.enum(["en", "el"]).optional(),
          prompt: z.string().optional(),
        }),
        execute: async ({ locale, prompt }) => ({
          url: tripPlannerUrl(locale ?? "en", prompt),
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
