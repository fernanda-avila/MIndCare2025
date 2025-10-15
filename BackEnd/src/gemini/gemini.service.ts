import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  async generate(prompt: string): Promise<string> {

    // Se OPENAI_API_KEY estiver setada, chamar a API do OpenAI (Chat Completions v1)
    if (process.env.OPENAI_API_KEY) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
          }),
        });
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
        return text || 'Sem resposta do provedor de IA.';
      } catch (err) {
        this.logger.error('Erro ao chamar OpenAI', err as any);
        return 'Erro ao gerar resposta (OpenAI).';
      }
    }

    // Se GOOGLE_API_KEY estiver setada, usar Google Generative Language API
    if (process.env.GOOGLE_API_KEY) {
      const model = process.env.GOOGLE_MODEL || 'text-bison-001';
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText?key=${process.env.GOOGLE_API_KEY}`;
        const body = {
          prompt: { text: prompt },
          // Opcional: ajuste do tamanho da resposta
          maxOutputTokens: 300,
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        // Estrutura esperada: { candidates: [ { content: '...' } ] }
        const text = data?.candidates?.[0]?.content || data?.candidates?.[0]?.output || data?.text;
        return text || 'Sem resposta do provedor Google.';
      } catch (err) {
        this.logger.error('Erro ao chamar Google Generative API', err as any);
        return 'Erro ao gerar resposta (Google).';
      }
    }

  // Fallback final: se HUGGINGFACE_API_KEY estiver setada, tentar usar Hugging Face Inference API
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const hfModel = process.env.HUGGINGFACE_MODEL || 'google/flan-t5-small';
        const res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: prompt }),
        });

        const textBody = await res.text();
        let data: any = null;
        try { data = JSON.parse(textBody); } catch (e) { data = textBody; }

        if (!res.ok) {
          // Retornar erro detalhado para facilitar debugging no frontend
          const errMsg = `HuggingFace error: status=${res.status} body=${typeof data === 'string' ? data : JSON.stringify(data)}`;
          this.logger.error(errMsg);
          return `Erro ao gerar resposta (HuggingFace): ${res.status} - ${typeof data === 'string' ? data : (data?.error ?? JSON.stringify(data))}`;
        }

        // A resposta pode vir em formatos diferentes dependendo do modelo
        if (typeof data === 'string') return data;
        if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
        if (data?.generated_text) return data.generated_text;
        if (data?.error) return `Erro HuggingFace: ${data.error}`;
        return 'Sem resposta do provedor HuggingFace.';
      } catch (err) {
        this.logger.error('Erro ao chamar HuggingFace', err as any);
        return 'Erro ao gerar resposta (HuggingFace).';
      }
    }

    // Nenhum provedor configurado/encontrado -> retornar mock
    this.logger.warn('Nenhum provedor de IA configurado (OpenAI/Google/HuggingFace). Retornando mock.');
    return `Resposta mock (fallback): ${prompt.slice(0, 200)}`;
  }
}
