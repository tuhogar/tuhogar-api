import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class NetworkService {
  async testPing(host: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        if (error) {
          reject(`Erro ao executar ping: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async testTraceroute(host: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`traceroute ${host}`, (error, stdout, stderr) => {
        if (error) {
          reject(`Erro ao executar traceroute: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
