import { createTool } from '@mastra/core';
import axios from 'axios';
import z from 'zod';

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

export { getAddressFromCep, getAddressFromCepTool };
