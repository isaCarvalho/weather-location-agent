import { createTool } from '@mastra/core';
import axios from 'axios';
import z from 'zod';

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

export { cityFromCepTool, getCityFromCep };
