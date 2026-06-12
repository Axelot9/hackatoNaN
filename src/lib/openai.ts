import OpenAI from "openai";
import { getOpenAIConfig } from "./openai-config";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getClient() {
  const { apiKey, baseURL } = getOpenAIConfig();
  return new OpenAI({ apiKey, baseURL });
}

function getModel() {
  return getOpenAIConfig().model;
}

/**
 * Stream a chat completion as a ReadableStream of characters.
 */
export async function streamChat(
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
  const client = getClient();
  const model = getModel();

  const stream = await client.chat.completions.create({
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 512,
  });

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(content);
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/**
 * Non-streaming chat completion. Returns the full response text.
 */
export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const client = getClient();
  const model = getModel();

  const completion = await client.chat.completions.create({
    model,
    messages,
    stream: false,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

/**
 * Multimodal chat completion for image + text.
 * Returns the full response text.
 */
export async function chatCompletionWithImage(
  textPrompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const client = getClient();
  const model = getModel();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: textPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    stream: false,
    temperature: 0.3,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}
