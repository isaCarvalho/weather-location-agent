import { Agent } from "@mastra/core/agent";
import { cepFromAddressTool } from "../tools/cepTool";
import { cityFromCepTool } from "../tools/cityTool";
import { weatherFromCityTool } from "../tools/weatherTool";
import { createOllama } from "ollama-ai-provider-v2";

const ollama = createOllama({
    baseURL: "http://localhost:11434/api"
});

const model = ollama('mistral')

export const operatorAgent = new Agent({
    name: "operator-agent",
    model,
    instructions: `
    You receive a user message with an address.
    Your job is:

    1. Extract the address.
    2. Convert it to a CEP (correios API).
    3. Get city & state (BrasilAPI).
    4. Get weather (BrasilAPI CPTEC).

    Respond with a JSON containing:
    - address
    - cep
    - city
    - weather_summary
  `,
    tools: {
        cepFromAddressTool, 
        cityFromCepTool, 
        weatherFromCityTool
    },
});