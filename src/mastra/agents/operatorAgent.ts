import { Agent } from "@mastra/core/agent";
import { getAddressFromCepTool } from "../tools/cepTool";
import { getWeatherFromCityCodeTool } from "../tools/weatherTool";
import { createOllama } from "ollama-ai-provider-v2";
import { wheaterWorkflow } from "../workflows/getWheaterWorkflow";
import { getCityInformationTool } from "../tools/citiyTool";

const ollama = createOllama({
    baseURL: "http://localhost:11434/api"
});

const model = ollama('mistral')

export const operatorAgent = new Agent({
    name: "operator-agent",
    model,
    instructions: `
    You receive a user message with a CEP (Brazilian zip code).
    Your job is:

    Use the cepTool to get the address from the CEP. The response will be a field called 
    'localidade'. Pass this field to the getCityInformationTool to get the information on the city.
    This tool will return a field called id. Pass this field to the weatherFromCityTool. 
    The response from this tool is what you are going to respond to the user.
  `,
    tools: {
        getAddressFromCepTool,
        getCityInformationTool,
        getWeatherFromCityCodeTool
    },
    workflows: {
        wheaterWorkflow
    }
});