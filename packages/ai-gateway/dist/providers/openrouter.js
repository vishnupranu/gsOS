import { BaseProvider } from './base.js';
export class OpenRouterProvider extends BaseProvider {
    name = 'openrouter';
    defaultBaseURL = 'https://openrouter.ai/api/v1';
    defaultModel = 'anthropic/claude-3.5-sonnet';
    supportsStreaming() {
        return true;
    }
    mapModelName(model) {
        // OpenRouter uses full model IDs like "anthropic/claude-3.5-sonnet"
        const modelMap = {
            'gpt-4': 'openai/gpt-4',
            'gpt-4-turbo': 'openai/gpt-4-turbo',
            'gpt-3.5': 'openai/gpt-3.5-turbo',
            'claude-3': 'anthropic/claude-3.5-sonnet',
            'claude': 'anthropic/claude-3.5-sonnet',
            'gemini': 'google/gemini-pro',
            'mistral': 'mistralai/mistral-medium',
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
//# sourceMappingURL=openrouter.js.map