import { createTool, Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import axios from 'axios';
import z from 'zod';
import { createTool as createTool$1 } from '@mastra/core/tools';
import { createOllama } from 'ollama-ai-provider-v2';
import { convertToModelMessages } from 'ai';
import { registerApiRoute } from '@mastra/core/server';

"use strict";
const getAddressFromCep = async (cep) => {
  const response = await axios.get(`https://viacep.com.br/ws/${encodeURIComponent(cep)}/json/`);
  return response.data;
};
const getAddressFromCepTool = createTool({
  id: "get-cep-from-address",
  description: "Get the address from the CEP",
  inputSchema: z.object({
    cep: z.string().describe("CEP to get the address from")
  }),
  outputSchema: z.object({
    cep: z.string(),
    logradouro: z.string(),
    complemento: z.string(),
    unidade: z.string(),
    bairro: z.string(),
    localidade: z.string(),
    uf: z.string(),
    estado: z.string(),
    regiao: z.string(),
    ibge: z.string(),
    gia: z.string(),
    ddd: z.string(),
    siafi: z.string()
  }),
  execute: async ({ context }) => {
    const { cep } = context;
    const response = await getAddressFromCep(cep);
    return {
      cep: response.cep,
      logradouro: response.logradouro,
      complemento: response.complemento,
      unidade: response.unidade,
      bairro: response.bairro,
      localidade: response.localidade,
      uf: response.uf,
      estado: response.estado,
      regiao: response.regiao,
      ibge: response.ibge,
      gia: response.gia,
      ddd: response.ddd,
      siafi: response.siafi
    };
  }
});

"use strict";
async function getWeatherFromCity(city) {
  const url = `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${encodeURIComponent(city)}`;
  console.log("================= URL =================", url);
  const res = await axios.get(url);
  return res.data;
}
const weatherFromCityTool = createTool$1({
  id: "get-weather-from-city",
  description: "Get the weather from a city",
  inputSchema: z.object({
    localidade: z.string()
  }),
  outputSchema: z.object({
    weather_summary: z.string().describe("The weather found for the city")
  }),
  execute: async ({ context }) => {
    const { localidade: city } = context;
    const response = await getWeatherFromCity(city);
    return {
      weather_summary: response
    };
  }
});

"use strict";
const getCityInformation = async (cityName) => {
  const response = await axios.get(`https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(cityName)}`);
  return response.data;
};
const getCityInformationTool = createTool({
  id: "get-city-information",
  description: "Get the city code, name and state",
  inputSchema: z.object({
    cityName: z.string()
  }),
  outputSchema: z.object({
    name: z.string(),
    id: z.string(),
    state: z.string()
  }),
  execute: async ({ context }) => {
    const { cityName } = context;
    const response = await getCityInformation(cityName);
    return {
      name: response.nome,
      id: response.id,
      state: response.estado
    };
  }
});

"use strict";
const ollama = createOllama({
  baseURL: "http://localhost:11434/api"
});
const model = ollama("mistral");
const operatorAgent = new Agent({
  name: "operator-agent",
  model,
  instructions: `
    You receive a user message with an address.
    Your job is:

    1. Get the address from the CEP passed on the input
    2. Get the weather from the response
    3. Respond the weather

    Respond with a JSON containing:
    - cep
    - weather_summary
  `,
  tools: {
    getAddressFromCepTool,
    getCityInformationTool,
    weatherFromCityTool
  }
  // workflows: {
  //     wheaterWorkflow
  // }
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
        const stream = await agent.streamVNext(modelMessages[0], {
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
