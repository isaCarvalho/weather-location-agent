import { createTool } from "@mastra/core";
import axios from "axios";
import z from "zod";

export const getCepFromAddress = async (address: string) => {
    const response = await axios.get(`https://viacep.com.br/ws/${encodeURIComponent(address)}/json/`);
    return response.data;
};

export const cepFromAddressTool = createTool({
    id: 'get-cep-from-address',
    description: 'Get the CEP from an address',
    inputSchema: z.object({
        address: z.string().describe('The address to get the CEP from')
    }),
    outputSchema: z.object({
        cep: z.string().describe('The CEP found for the address')
    }),
    execute: async ({ context }) => {
        const { address } = context;
        return getCepFromAddress(address);
    }
})
