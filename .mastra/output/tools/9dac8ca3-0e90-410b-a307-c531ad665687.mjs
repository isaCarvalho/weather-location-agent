import { createTool } from '@mastra/core';
import axios from 'axios';
import z from 'zod';

const getCityInformation = async (cityName) => {
  const response = await axios.get(`https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(cityName)}`);
  return response.data[0];
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

export { getCityInformation, getCityInformationTool };
