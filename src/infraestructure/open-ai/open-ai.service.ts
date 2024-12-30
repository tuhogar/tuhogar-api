import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenAiService {
  constructor(private readonly configService: ConfigService) {}

  async getEmbedding(query: string): Promise<number[]> {
    const url = 'https://api.openai.com/v1/embeddings';
    const openaiKey = this.configService.get<string>('OPENAI_KEY');

    try {
      const response = await axios.post(url, {
        input: query,
        model: "text-embedding-ada-002"
      }, {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        return response.data.data[0].embedding;
      } else {
        throw new Error(`Failed to get embedding. Status code: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to get embedding. Error: ${error.message}`);
    }
  }
}
