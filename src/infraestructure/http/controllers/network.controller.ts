import { Controller, Get, Query } from '@nestjs/common';
import { NetworkService } from 'src/application/use-cases/network/network.service';

@Controller('v1/network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('ping')
  async ping(@Query('host') host: string): Promise<string> {
    return this.networkService.testPing(host);
  }

  @Get('traceroute')
  async traceroute(@Query('host') host: string): Promise<string> {
    return this.networkService.testTraceroute(host);
  }
}
