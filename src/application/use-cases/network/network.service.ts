import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as traceroute from 'traceroute';

@Injectable()
export class NetworkService {
  async testPing(host: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        if (error) {
            console.log('----error');
            console.log(error);
            console.log('----error');
          reject(`Erro ao executar ping: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async testTraceroute(host: string): Promise<string> {
    return new Promise((resolve, reject) => {
        traceroute.trace(host, (err, hops) => {
          if (err) {
            console.log('----err');
            console.log(err);
            console.log('----err');
            reject(`Erro ao executar traceroute: ${err.message}`);
          } else {
            resolve(hops);
          }
        });
      });
  }
}
