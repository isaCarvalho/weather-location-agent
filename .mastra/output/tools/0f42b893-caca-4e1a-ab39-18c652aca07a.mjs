import { createTool } from '@mastra/core/tools';
import axios from 'axios';
import z from 'zod';

async function getWeatherFromCity(city) {
  const url = `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${encodeURIComponent(city)}`;
  const res = await axios.get(url);
  return res.data;
}
const getWeatherFromCityCodeTool = createTool({
  id: "get-weather-from-city",
  description: "Get the weather from a city code",
  inputSchema: z.object({
    cityCode: z.string()
  }),
  outputSchema: z.object({
    weather_summary: z.string().describe("The weather found for the city code")
  }),
  execute: async ({ context }) => {
    const { cityCode } = context;
    const response = await getWeatherFromCity(cityCode);
    return {
      weather_summary: response
    };
  }
});

export { getWeatherFromCity, getWeatherFromCityCodeTool };
