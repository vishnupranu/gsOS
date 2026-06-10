import * as React from 'react';
import { cn } from '@ai-os/design-system';
import { ChevronDown, Check, Bot, Zap, Shield, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ai-os/design-system';
import { Model, ModelProvider, ModelPricing } from '@ai-os/shared';
import { MODEL_PRICING } from '@ai-os/shared';

interface ModelSelectorProps {
  models: Model[];
  selectedModel?: string;
  onSelect: (modelId: string) => void;
  showPricing?: boolean;
  className?: string;
}

const providerIcons: Record<ModelProvider, React.ReactNode> = {
  openai: <Sparkles className="h-4 w-4" />,
  anthropic: <Bot className="h-4 w-4" />,
  google: <Sparkles className="h-4 w-4" />,
  deepseek: <Zap className="h-4 w-4" />,
  qwen: <Zap className="h-4 w-4" />,
  mistral: <Zap className="h-4 w-4" />,
  grok: <Sparkles className="h-4 w-4" />,
  openrouter: <Zap className="h-4 w-4" />,
  ollama: <Shield className="h-4 w-4" />,
  lmstudio: <Shield className="h-4 w-4" />,
};

const providerNames: Record<ModelProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  deepseek: 'DeepSeek',
  qwen: 'Qwen',
  mistral: 'Mistral',
  grok: 'xAI',
  openrouter: 'OpenRouter',
  ollama: 'Ollama',
  lmstudio: 'LM Studio',
};

const providerColors: Record<ModelProvider, string> = {
  openai: 'text-green-500',
  anthropic: 'text-orange-500',
  google: 'text-blue-500',
  deepseek: 'text-cyan-500',
  qwen: 'text-purple-500',
  mistral: 'text-pink-500',
  grok: 'text-yellow-500',
  openrouter: 'text-red-500',
  ollama: 'text-gray-500',
  lmstudio: 'text-gray-500',
};

export function ModelSelector({
  models,
  selectedModel,
  onSelect,
  showPricing = true,
  className,
}: ModelSelectorProps) {
  const groupedModels = React.useMemo(() => {
    const groups: Record<ModelProvider, Model[]> = {} as Record<ModelProvider, Model[]>;
    models.forEach(model => {
      if (!groups[model.provider]) {
        groups[model.provider] = [];
      }
      groups[model.provider].push(model);
    });
    return groups;
  }, [models]);

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <Select value={selectedModel} onValueChange={onSelect}>
      <SelectTrigger className={cn('w-[280px]', className)}>
        <div className="flex items-center gap-2">
          {selectedModelData && (
            <>
              <span className={cn(providerColors[selectedModelData.provider])}>
                {providerIcons[selectedModelData.provider]}
              </span>
              <span className="font-medium">{selectedModelData.name}</span>
            </>
          )}
          {!selectedModelData && (
            <span className="text-foreground-tertiary">Select model...</span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <SelectGroup key={provider}>
            <SelectLabel className="flex items-center gap-2">
              <span className={cn(providerColors[provider as ModelProvider])}>
                {providerIcons[provider as ModelProvider]}
              </span>
              {providerNames[provider as ModelProvider]}
            </SelectLabel>
            {providerModels.map(model => {
              const pricing = MODEL_PRICING[model.id as keyof typeof MODEL_PRICING];
              return (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{model.name}</span>
                    {showPricing && pricing && (
                      <span className="text-xs text-foreground-tertiary">
                        ${pricing.input}/1M in • ${pricing.output}/1M out
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ModelSettingsProps {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onTopPChange: (value: number) => void;
  className?: string;
}

export function ModelSettings({
  model,
  temperature,
  maxTokens,
  topP,
  onTemperatureChange,
  onMaxTokensChange,
  onTopPChange,
  className,
}: ModelSettingsProps) {
  return (
    <div className={cn('space-y-4 p-4 bg-background-tertiary rounded-lg', className)}>
      <h4 className="text-sm font-medium">Model Settings</h4>
      
      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground-secondary">Temperature</label>
          <span className="text-sm font-mono">{temperature.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={e => onTemperatureChange(parseFloat(e.target.value))}
          className="w-full accent-accent-blue"
        />
        <p className="text-xs text-foreground-tertiary">
          Lower = more focused, Higher = more creative
        </p>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground-secondary">Max Tokens</label>
          <span className="text-sm font-mono">{maxTokens.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="256"
          max="128000"
          step="256"
          value={maxTokens}
          onChange={e => onMaxTokensChange(parseInt(e.target.value))}
          className="w-full accent-accent-blue"
        />
      </div>

      {/* Top P */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground-secondary">Top P</label>
          <span className="text-sm font-mono">{topP.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={topP}
          onChange={e => onTopPChange(parseFloat(e.target.value))}
          className="w-full accent-accent-blue"
        />
      </div>
    </div>
  );
}