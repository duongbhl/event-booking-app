import axios from "axios";

type SuggestEventContentInput = {
  category: string;
  location?: string;
  date?: string;
  existingTitle?: string;
  existingDescription?: string;
  userPrompt?: string;
  language?: "en" | "vi";
};

export type SuggestedTicketTier = {
  name: string;
  price: number;
  quota: number;
};

export type SuggestedEventContent = {
  title: string;
  description: string;
  ticketTiers: SuggestedTicketTier[];
};

type OpenAIContentItem = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAIContentItem[];
};

type OpenAIResponse = {
  output?: OpenAIOutputItem[];
};

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const DEFAULT_OLLAMA_MODEL = "llama3.1:8b";

const eventSuggestionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "ticketTiers"],
  properties: {
    title: {
      type: "string",
      minLength: 5,
      maxLength: 120,
    },
    description: {
      type: "string",
      minLength: 40,
      maxLength: 1200,
    },
    ticketTiers: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "price", "quota"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 40,
          },
          price: {
            type: "number",
            minimum: 0,
          },
          quota: {
            type: "number",
            minimum: 1,
          },
        },
      },
    },
  },
} as const;

const buildPrompt = ({
  category,
  location,
  date,
  existingTitle,
  existingDescription,
  userPrompt,
  language = "en",
}: SuggestEventContentInput) => {
  const outputLanguage = language === "vi" ? "Vietnamese" : "English";

  return [
    "Create event content suggestions for a mobile event-booking app.",
    `Return all text in ${outputLanguage}.`,
    "The result must be practical, concise, and ready to display in the app.",
    "Generate 1 compelling event title, 1 event description, and 1-3 ticket tiers.",
    "Ticket tiers must be realistic for the event category and location.",
    "Do not include markdown, explanations, or extra keys.",
    "",
    `Category: ${category}`,
    `Location: ${location || "Not provided"}`,
    `Event date: ${date || "Not provided"}`,
    `Current title: ${existingTitle || "Not provided"}`,
    `Current description: ${existingDescription || "Not provided"}`,
    `Organizer brief: ${userPrompt || "Not provided"}`,
  ].join("\n");
};

const extractOutputText = (response: OpenAIResponse) => {
  const texts =
    response.output
      ?.flatMap((item) => item.content || [])
      .filter((content) => content.type === "output_text" && content.text)
      .map((content) => content.text?.trim() || "") || [];

  return texts.join("\n").trim();
};

const sanitizeSuggestion = (
  parsed: SuggestedEventContent
): SuggestedEventContent => {
  const title = parsed.title.trim();
  const description = parsed.description.trim();
  const ticketTiers = parsed.ticketTiers
    .map((tier) => ({
      name: String(tier.name).trim(),
      price: Number(tier.price),
      quota: Number(tier.quota),
    }))
    .filter(
      (tier) =>
        tier.name &&
        Number.isFinite(tier.price) &&
        tier.price >= 0 &&
        Number.isFinite(tier.quota) &&
        tier.quota > 0
    )
    .slice(0, 3);

  if (!title || !description || ticketTiers.length === 0) {
    throw new Error("AI returned incomplete event suggestions");
  }

  return { title, description, ticketTiers };
};

const buildSystemPrompt = (language: "en" | "vi" = "en") => {
  const outputLanguage = language === "vi" ? "Vietnamese" : "English";

  return [
    "You are an assistant that writes polished event content and ticket tier suggestions.",
    `Return all text in ${outputLanguage}.`,
    "You must return valid JSON only.",
    "Do not wrap the JSON in markdown fences.",
    "Generate practical, concise content for a mobile event-booking app.",
  ].join(" ");
};

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildTemplateSuggestion = (
  input: SuggestEventContentInput
): SuggestedEventContent => {
  const categoryLabel = titleCase(input.category || "Event");
  const city = input.location?.trim() || (input.language === "vi" ? "thành phố của bạn" : "your city");
  const brief = input.userPrompt?.trim();

  if (input.language === "vi") {
    return sanitizeSuggestion({
      title:
        input.existingTitle?.trim() ||
        `${categoryLabel} Experience tại ${city}`,
      description:
        input.existingDescription?.trim() ||
        [
          `Tham gia ${categoryLabel.toLowerCase()} được thiết kế dành cho cộng đồng yêu thích trải nghiệm mới tại ${city}.`,
          brief
            ? `Điểm nhấn chương trình: ${brief}.`
            : "Sự kiện tập trung vào nội dung hấp dẫn, không gian chỉn chu và trải nghiệm thân thiện cho người tham dự.",
          "Phù hợp để kết nối, học hỏi và tận hưởng một buổi gặp gỡ chất lượng cùng bạn bè hoặc đồng nghiệp.",
        ].join(" "),
      ticketTiers: [
        { name: "Standard", price: 199000, quota: 80 },
        { name: "VIP", price: 399000, quota: 30 },
      ],
    });
  }

  return sanitizeSuggestion({
    title: input.existingTitle?.trim() || `${categoryLabel} Experience in ${city}`,
    description:
      input.existingDescription?.trim() ||
      [
        `Join a curated ${categoryLabel.toLowerCase()} event built for people looking for a fresh experience in ${city}.`,
        brief
          ? `Key direction: ${brief}.`
          : "The event is designed with engaging content, a polished atmosphere, and a friendly guest experience.",
        "It works well for networking, learning, and enjoying a memorable session with friends or colleagues.",
      ].join(" "),
    ticketTiers: [
      { name: "Standard", price: 19, quota: 80 },
      { name: "VIP", price: 39, quota: 30 },
    ],
  });
};

const generateWithOpenAI = async (input: SuggestEventContentInput) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await axios.post<OpenAIResponse>(
    OPENAI_API_URL,
    {
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: buildSystemPrompt(input.language),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt(input),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "event_content_suggestion",
          strict: true,
          schema: eventSuggestionSchema,
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const rawText = extractOutputText(response.data);

  if (!rawText) {
    throw new Error("OpenAI returned an empty response");
  }

  return sanitizeSuggestion(JSON.parse(rawText) as SuggestedEventContent);
};

const generateWithOllama = async (input: SuggestEventContentInput) => {
  const response = await axios.post<OllamaChatResponse>(
    process.env.OLLAMA_API_URL || DEFAULT_OLLAMA_URL,
    {
      model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
      stream: false,
      format: eventSuggestionSchema,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(input.language),
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
      options: {
        temperature: 0.7,
      },
    },
    {
      timeout: 60000,
    }
  );

  const rawText = response.data.message?.content?.trim();

  if (!rawText) {
    throw new Error("Ollama returned an empty response");
  }

  return sanitizeSuggestion(JSON.parse(rawText) as SuggestedEventContent);
};

export const generateEventContentSuggestion = async (
  input: SuggestEventContentInput
) => {
  const preferredProvider = process.env.AI_PROVIDER || "openai";
  const allowOllamaFallback = process.env.ENABLE_OLLAMA_FALLBACK !== "false";
  const allowTemplateFallback =
    process.env.ENABLE_TEMPLATE_FALLBACK !== "false";

  if (preferredProvider === "ollama") {
    try {
      const suggestion = await generateWithOllama(input);
      console.log("Event suggestion provider: ollama");
      return suggestion;
    } catch (ollamaError: any) {
      console.error(
        "Ollama suggestion failed:",
        ollamaError?.response?.data || ollamaError?.message || ollamaError
      );

      if (!allowTemplateFallback) {
        throw ollamaError;
      }

      const suggestion = buildTemplateSuggestion(input);
      console.log("Event suggestion provider: template (fallback from ollama)");
      return suggestion;
    }
  }

  try {
    const suggestion = await generateWithOpenAI(input);
    console.log("Event suggestion provider: openai");
    return suggestion;
  } catch (openAiError: any) {
    console.error(
      "OpenAI suggestion failed:",
      openAiError?.response?.data || openAiError?.message || openAiError
    );

    if (!allowOllamaFallback) {
      if (!allowTemplateFallback) {
        throw openAiError;
      }

      const suggestion = buildTemplateSuggestion(input);
      console.log("Event suggestion provider: template (fallback from openai)");
      return suggestion;
    }

    try {
      const suggestion = await generateWithOllama(input);
      console.log("Event suggestion provider: ollama (fallback)");
      return suggestion;
    } catch (ollamaError: any) {
      console.error(
        "Ollama suggestion failed:",
        ollamaError?.response?.data || ollamaError?.message || ollamaError
      );

      if (!allowTemplateFallback) {
        throw ollamaError;
      }

      const suggestion = buildTemplateSuggestion(input);
      console.log("Event suggestion provider: template (final fallback)");
      return suggestion;
    }
  }
};
