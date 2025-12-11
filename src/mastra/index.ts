import { Mastra } from "@mastra/core";
import { operatorAgent } from "./agents/operatorAgent";
import { convertToModelMessages } from "ai";
import { registerApiRoute } from "@mastra/core/server";

export const mastra = new Mastra({
    server: {
        port: 3000,
        host: '0.0.0.0',
        apiRoutes: [
            registerApiRoute("/v1/chat", {
                method: "POST",
                handler: async (c) => {
                    const { message } = await c.req.json();
                    const { agentId } = await c.req.json();
                    const { threadId: threadIdParam } = await c.req.json();
    
    
                    const agent = mastra.getAgentById(agentId || 'operatorAgent');
                    const modelMessages = convertToModelMessages(message);
    
                    const stream = await agent.streamVNext(modelMessages[0], {
                        format: "aisdk",
                        threadId: threadIdParam,
                    });
    
                    return stream.toUIMessageStreamResponse({
                        sendReasoning: true,
                        sendSources: true,
                        sendStart: true,
                        sendFinish: true,
                        onError: (error: unknown) => {
                            console.error("Error:", error);
                            return error instanceof Error ? error.message : "Unknown error";
                        },
                    });
                }
            }),
        ],
    },
    agents: {
        operatorAgent: operatorAgent,
    },
});
