import OpenAi from 'openai';

export class ChatgtpUtil {
  private openai;
  constructor(apiKey: string) {
    this.openai = new OpenAi({
      apiKey,
    });
  }

  get openAiClient() {
    return this.openai;
  }

  async chat(content: string, model: string = 'gpt-3.5-turbo'): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
      model,
    });

    if (!completion && !completion.choices[0] && !completion.choices[0].message) {
      throw new Error('openai res error')
    }
    return completion.choices[0].message.content;
  }
}