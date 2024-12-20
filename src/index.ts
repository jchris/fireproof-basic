import { WorkerEntrypoint } from 'cloudflare:workers'
import { ProxyToSelf } from 'workers-mcp'

const GREETING_STYLES = [
  "witty",
  "poetic",
  "philosophical",
  "scientific",
  "dramatic"
];

const PROMPTS: Record<string, any> = {
  "clever-hello": {
    name: "clever-hello",
    description: "Generate a clever greeting message",
    arguments: [
      {
        name: "name",
        description: "Name of the person to greet",
        required: true
      },
      {
        name: "style",
        description: `Style of greeting (${GREETING_STYLES.join(", ")})`,
        required: false
      }
    ]
  }
};

export default class MyWorker extends WorkerEntrypoint<Env> {
  /**
   * List available prompts
   */
  async listPrompts() {
    return {
      prompts: Object.values(PROMPTS)
    };
  }

  /**
   * Get a specific prompt
   */
  async getPrompt(name: string, args: any) {
    const prompt = PROMPTS[name];
    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }

    if (name === "clever-hello") {
      const style = args?.style || GREETING_STYLES[Math.floor(Math.random() * GREETING_STYLES.length)];
      const userName = args?.name;
      
      if (!userName) {
        throw new Error("Name argument is required");
      }

      const stylePrompts: Record<string, string> = {
        witty: `Create a clever and witty greeting for ${userName} that includes a playful pun or wordplay.`,
        poetic: `Compose a brief poetic greeting for ${userName} that uses vivid imagery or metaphor.`,
        philosophical: `Generate a greeting for ${userName} that includes a thought-provoking philosophical observation.`,
        scientific: `Formulate a greeting for ${userName} that cleverly incorporates scientific concepts or terminology.`,
        dramatic: `Create a theatrical, over-the-top greeting for ${userName} with dramatic flair.`
      };

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: stylePrompts[style]
            }
          }
        ]
      };
    }

    throw new Error("Prompt implementation not found");
  }

  /**
   * A warm, friendly greeting from your new Workers MCP server.
   * @param name {string} the name of the person we are greeting.
   * @return {string} the contents of our greeting.
   */
  sayHello(name: string) {
    return `Hello from an MCP Worker, ${name}!`
  }

  /**
   * @ignore
   */
  async fetch(request: Request): Promise<Response> {
    return new ProxyToSelf(this).fetch(request)
  }
}