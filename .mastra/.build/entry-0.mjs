import { createTool, Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import axios from 'axios';
import z from 'zod';
import { createTool as createTool$1 } from '@mastra/core/tools';
import { createOllama } from 'ollama-ai-provider-v2';
import { convertToModelMessages } from 'ai';
import { registerApiRoute } from '@mastra/core/server';

"use strict";
const getCepFromAddress = async (address) => {
  const response = await axios.get(`https://viacep.com.br/ws/${encodeURIComponent(address)}/json/`);
  return response.data;
};
const cepFromAddressTool = createTool({
  id: "get-cep-from-address",
  description: "Get the CEP from an address",
  inputSchema: z.object({
    address: z.string().describe("The address to get the CEP from")
  }),
  outputSchema: z.object({
    cep: z.string().describe("The CEP found for the address")
  }),
  execute: async ({ context }) => {
    const { address } = context;
    return getCepFromAddress(address);
  }
});

"use strict";
const getCityFromCep = async (cep) => {
  const res = await axios.get(`https://brasilapi.com.br/api/cep/v2/${cep}`);
  return res.data;
};
const cityFromCepTool = createTool({
  id: "get-city-from-cep",
  description: "Get the city from a CEP",
  inputSchema: z.object({
    cep: z.string().describe("The CEP to get the city from")
  }),
  outputSchema: z.object({
    city: z.string().describe("The city found for the CEP")
  }),
  execute: async ({ context }) => {
    const { cep } = context;
    return getCityFromCep(cep);
  }
});

"use strict";
async function getWeatherFromCity(city) {
  const cleanCity = city.replace(/\s+/g, "");
  const url = `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${cleanCity}`;
  const res = await axios.get(url);
  return res.data;
}
const weatherFromCityTool = createTool$1({
  id: "get-weather-from-city",
  description: "Get the weather from a city",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather from")
  }),
  outputSchema: z.object({
    weather: z.string().describe("The weather found for the city")
  }),
  execute: async ({ context }) => {
    const { city } = context;
    return getWeatherFromCity(city);
  }
});

"use strict";
const ollama = createOllama({
  baseURL: "http://localhost:11434"
});
const model = ollama("mistral");
const operatorAgent = new Agent({
  name: "operator-agent",
  model,
  instructions: `
    You receive a user message with an address.
    Your job is:

    1. Extract the address.
    2. Convert it to a CEP (correios API).
    3. Get city & state (BrasilAPI).
    4. Get weather (BrasilAPI CPTEC).
    5. Based on the weather + city, pick the best Brazilian operator:
        - Claro \u2192 Melhor em capitais, \xF3timo 4G/5G.
        - Vivo \u2192 Melhor cobertura em clima inst\xE1vel e chuva.
        - TIM \u2192 Boa cobertura em cidades pequenas e interior.

    Respond with a JSON containing:
    - address
    - cep
    - city
    - weather_summary
    - recommended_operator
  `,
  tools: {
    cepFromAddressTool,
    cityFromCepTool,
    weatherFromCityTool
  }
});

"use strict";
const mastra = new Mastra({
  server: {
    port: 3e3,
    host: "0.0.0.0",
    apiRoutes: [registerApiRoute("/v1/chat", {
      method: "POST",
      handler: async (c) => {
        const {
          message
        } = await c.req.json();
        const {
          agentId
        } = await c.req.json();
        const {
          threadId: threadIdParam
        } = await c.req.json();
        const agent = mastra.getAgentById(agentId || "operatorAgent");
        const modelMessages = convertToModelMessages(message);
        const stream = await agent.streamVNext(modelMessages, {
          format: "aisdk",
          threadId: threadIdParam
        });
        return stream.toUIMessageStreamResponse({
          sendReasoning: true,
          sendSources: true,
          sendStart: true,
          sendFinish: true,
          onError: (error) => {
            console.error("Error:", error);
            return error instanceof Error ? error.message : "Unknown error";
          }
        });
      }
    })]
  },
  agents: {
    operatorAgent
  }
});

export { mastra };
