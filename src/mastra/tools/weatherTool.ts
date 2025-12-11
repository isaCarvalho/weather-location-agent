import { createTool } from "@mastra/core/tools";
import axios from "axios";
import z from "zod";

export async function getWeatherFromCity(city: string) {
  const cleanCity = city.replace(/\s+/g, "");
  const url = `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${cleanCity}`;
  const res = await axios.get(url);
  return res.data;
}

export const weatherFromCityTool = createTool({
    id: 'get-weather-from-city',
    description: 'Get the weather from a city',
    inputSchema: z.object({
        city: z.string().describe('The city to get the weather from')
    }),
    outputSchema: z.object({
        weather: z.string().describe('The weather found for the city')
    }),
    execute: async ({ context }) => {
        const { city } = context;
        return getWeatherFromCity(city);
    }
})