import { BaseProvider } from './base.js';
export class QwenProvider extends BaseProvider {
    name = 'qwen';
    defaultBaseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    defaultModel = 'qwen-plus';
    supportsStreaming() {
        return true;
    }
    mapModelName(model) {
        const modelMap = {
            'qwen-turbo': 'qwen-turbo',
            'qwen-plus': 'qwen-plus',
            'qwen-max': 'qwen-max',
            'qwen-max-longcontext': 'qwen-max-longcontext',
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
//# sourceMappingURL=qwen.js.map