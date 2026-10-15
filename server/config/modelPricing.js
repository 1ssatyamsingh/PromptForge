const MODEL_PRICING = {
  "openai/gpt-oss-120b": {
    label: "GPT-OSS 120B",
    inputPerMillion: 0.50,
    outputPerMillion: 0.70,
  },
  "openai/gpt-oss-20b": {
    label: "GPT-OSS 20B",
    inputPerMillion: 0.10,
    outputPerMillion: 0.15,
  },
  "qwen/qwen3.8-27b": {
    label: "Qwen 3.8 27B",
    inputPerMillion: 0.20,
    outputPerMillion: 0.20,
  },
  "llama-3.3-70b-versatile": {
    label: "Llama 3.3 70B",
    inputPerMillion: 0.59,
    outputPerMillion: 0.79,
  },
  "llama-3.1-8b-instant": {
    label: "Llama 3.1 8B",
    inputPerMillion: 0.05,
    outputPerMillion: 0.08,
  },
  "gpt-4.1": {
    label: "GPT-4.1 (Legacy)",
    inputPerMillion: 2.0,
    outputPerMillion: 8.0,
  },
};

export const DEFAULT_MODEL = "openai/gpt-oss-120b";

// Map models that might not exist on the user's Groq tier to DEFAULT_MODEL
const MODEL_FALLBACKS = {
  "gpt-4.1": DEFAULT_MODEL,
  "llama-3.3-70b-versatile": DEFAULT_MODEL,
  "llama-3.1-8b-instant": "openai/gpt-oss-20b",
  "mixtral-8x7b-32768": DEFAULT_MODEL,
};

export const normalizeModel = (model) => {
  if (!model) return DEFAULT_MODEL;
  if (MODEL_FALLBACKS[model]) return MODEL_FALLBACKS[model];
  if (Object.prototype.hasOwnProperty.call(MODEL_PRICING, model)) return model;
  return DEFAULT_MODEL;
};

export const isSupportedModel = (model) =>
  Object.prototype.hasOwnProperty.call(MODEL_PRICING, model) ||
  Object.prototype.hasOwnProperty.call(MODEL_FALLBACKS, model);

export const getSupportedModels = () => Object.keys(MODEL_PRICING);

export const calculateCost = (model, usage) => {
  const normalized = normalizeModel(model);
  const pricing = MODEL_PRICING[model] || MODEL_PRICING[normalized] || MODEL_PRICING[DEFAULT_MODEL];
  if (!pricing || !usage) return null;

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  const inputCost = (promptTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPerMillion;

  return Number((inputCost + outputCost).toFixed(6));
};
