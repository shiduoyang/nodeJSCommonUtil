import OpenAi from 'openai';

export class ChatgtpUtil {
  private openai;
  constructor(apiKey: string) {
    this.openai = new OpenAi({
      apiKey,
    });
  }

  async chat(content): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
      model: 'gpt-3.5-turbo',
    });

    if (!completion && !completion.choices[0] && !completion.choices[0].message) {
      throw new Error('openai res error')
    }
    return completion.choices[0].message.content;
  }
}