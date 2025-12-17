import { createTool } from "@mastra/core";
import axios from "axios";
import z from "zod";

export const getCityInformation = async (cityName: string) => {
    const response = await axios.get(`https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(cityName)}`);

    return response.data[0];
};

export const getCityInformationTool = createTool({
    id: 'get-city-information',
    description: 'Get the city code, name and state',
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
        }
    }
})