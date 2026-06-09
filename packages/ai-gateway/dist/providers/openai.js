import { BaseProvider } from './base.js';
export class OpenAIProvider extends BaseProvider {
    name = 'openai';
    defaultBaseURL = 'https://api.openai.com/v1';
    defaultModel = 'gpt-4o';
    supportsStreaming() {
        return true;
    }
    mapModelName(model) {
        const modelMap = {
            'gpt-4': 'gpt-4',
            'gpt-4-turbo': 'gpt-4-turbo',
            'gpt-3.5': 'gpt-3.5-turbo',
            'gpt-3.5-turbo': 'gpt-3.5-turbo',
        };
        return modelMap[model] ?? model;
    }
    buildUrl(config) {
        const baseURL = config.baseURL ?? this.defaultBaseURL;
        return `${baseURL}/chat/completions`;
    }
    transformRequest(request) {
        return {
            model: request.model ?? this.defaultModel,
            messages: request.messages,
            temperature: request.temperature,
            top_p: request.topP,
            max_tokens: request.maxTokens,
            stream: request.stream ?? false,
            stop: request.stop,
            presence_penalty: request.presencePenalty,
            frequency_penalty: request.frequencyPenalty,
        };
    }
    transformResponse(data) {
        const d = data;
        return {
            id: d.id,
            object: d.object,
            created: d.created,
            model: d.model,
            choices: d.choices.map((choice, index) => ({
                index,
                message: choice.message,
                finishReason: choice.finish_reason,
            })),
            usage: d.usage,
        };
    }
    transformStreamingChunk(data) {
        const d = data;
        return {
            id: d.id,
            object: 'chat.completion.chunk',
            created: d.created,
            model: d.model,
            choices: d.choices.map((choice) => ({
                index: choice.index,
                delta: choice.delta,
                finishReason: choice.finish_reason,
            })),
        };
    }
}
//# sourceMappingURL=openai.js.map