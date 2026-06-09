import { BaseProvider } from './base.js';
export class AnthropicProvider extends BaseProvider {
    name = 'anthropic';
    defaultBaseURL = 'https://api.anthropic.com/v1';
    defaultModel = 'claude-3-5-sonnet-20241022';
    apiVersion = '2023-06-01';
    supportsStreaming() {
        return true;
    }
    mapModelName(model) {
        const modelMap = {
            'claude-3': 'claude-3-5-sonnet-20241022',
            'claude-3.5': 'claude-3-5-sonnet-20241022',
            'claude-3-opus': 'claude-3-opus-20240229',
            'claude-3-sonnet': 'claude-3-sonnet-20240229',
            'claude-3-haiku': 'claude-3-haiku-20240307',
        };
        return modelMap[model] ?? model;
    }
    buildUrl(config) {
        const baseURL = config.baseURL ?? this.defaultBaseURL;
        return `${baseURL}/messages`;
    }
    transformRequest(request) {
        const systemMessage = request.messages.find((m) => m.role === 'system');
        const otherMessages = request.messages.filter((m) => m.role !== 'system');
        const anthropicMessages = otherMessages.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
        }));
        return {
            model: request.model ?? this.defaultModel,
            messages: anthropicMessages,
            system: systemMessage?.content,
            max_tokens: request.maxTokens ?? 4096,
            temperature: request.temperature,
            stream: request.stream ?? false,
            stop_sequence: request.stop?.[0],
        };
    }
    transformResponse(data) {
        const d = data;
        const content = d.content;
        const usage = d.usage;
        return {
            id: `anthropic-${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: d.model,
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: content[0]?.text ?? '',
                    },
                    finishReason: d.stop_reason ?? 'stop',
                },
            ],
            usage: usage ? {
                promptTokens: usage.input_tokens ?? 0,
                completionTokens: usage.output_tokens ?? 0,
                totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
            } : undefined,
        };
    }
    transformStreamingChunk(data) {
        const d = data;
        const content = d.content;
        return {
            id: d.id,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: d.model,
            choices: [
                {
                    index: 0,
                    delta: content[0] ? { content: content[0].text } : {},
                    finishReason: d.stop_reason,
                },
            ],
        };
    }
    getHeaders(config) {
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey ?? '',
            'anthropic-version': this.apiVersion,
        };
        return headers;
    }
}
//# sourceMappingURL=anthropic.js.map