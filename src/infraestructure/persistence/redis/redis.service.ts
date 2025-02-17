import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private static client: RedisClientType | null = null;

  constructor() {
    if (!RedisService.client) {
      RedisService.client = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD
      });
    }
  }

  async onModuleInit() {
    if (!RedisService.client?.isOpen) {
      await RedisService.client?.connect();
    }
  }

  async onModuleDestroy() {
    if (RedisService.client?.isOpen) {
      await RedisService.client?.disconnect();
    }
  }

  async set(id: string, object: object): Promise<void> {
    await RedisService.client?.set(id, JSON.stringify(object));
  }

  async get(id: string): Promise<object | null> {
    const data = await RedisService.client?.get(id);
    return data ? JSON.parse(data) : null;
  }

  async delete(id: string): Promise<void> {
    await RedisService.client?.del(id);
  }

  async getAll(ids: string[]): Promise<object[]> {
    if (!ids.length) return [];
    const data = await RedisService.client?.mGet(ids);
    return data?.map((item) => (item ? JSON.parse(item) : null)).filter(Boolean) ?? [];
  }
}
