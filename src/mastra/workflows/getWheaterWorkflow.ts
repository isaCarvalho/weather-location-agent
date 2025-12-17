import { createStep, createWorkflow } from "@mastra/core/workflows";
import z from "zod";
import { getAddressFromCepTool } from "../tools/cepTool";
import { getCityInformationTool } from "../tools/citiyTool";
import { getWeatherFromCityCodeTool } from "../tools/weatherTool";

const getCepFromAddressStep = createStep({
    id: 'get-address-from-cep',
    inputSchema: z.object({ cep: z.string() }),
    outputSchema: z.object({
        cityName: z.string()
    }),
    execute: async ({inputData, state, setState}) => {
        // @ts-ignore
        setState({ ...state, counter: state.counter + 1});

        //@ts-ignore
        const response = await getAddressFromCepTool.execute({
            context: {
                cep: inputData.cep
            }
        });

        return {
            cityName: response.localidade
        };
    }
});

const getCityInformationStep = createStep({
    id: 'get-city-information',
    inputSchema: z.object({
        cityName: z.string()
    }),
    outputSchema: z.object({ cityCode: z.string() }),
    execute: async ({inputData, state, setState}) => {
        // @ts-ignore
        setState({ ...state, counter: state.counter + 1});

        //@ts-ignore
        const response = await getCityInformationTool.execute({
            context: {
                cityName: inputData.cityName
            }
        });

        return {
            cityCode: response.id
        };
    }
});

const getWeatherByCityCodeStep = createStep({
    id: 'get-weather-from-city-code',
    inputSchema: z.object({
        cityCode: z.string()
    }),
    outputSchema: z.object({ weather_summary: z.string() }),
    execute: async ({inputData, state, setState}) => {
        // @ts-ignore
        setState({ ...state, counter: state.counter + 1});

        //@ts-ignore
        const response = await getWeatherFromCityCodeTool.execute({
            context: {
                cityCode: inputData.cityCode
            }
        });

        console.log("Response =============", response);

        return {
            weather_summary: response.weather_summary
        };
    }
});

export const wheaterWorkflow = createWorkflow({
    id: 'weather-workflow',
    inputSchema: z.object({
        cep: z.string()
    }),
    outputSchema: z.object({
        weather_summary: z.string()
    })
})
.then(getCepFromAddressStep)
.then(getCityInformationStep)
.then(getWeatherByCityCodeStep)
.commit()