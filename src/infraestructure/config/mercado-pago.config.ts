import { registerAs } from '@nestjs/config';

export const mercadoPagoConfig = registerAs('mercadoPago', () => ({
  apiKey: process.env.MERCADO_PAGO_API_KEY,
  apiUrl: process.env.MERCADO_PAGO_API_URL,
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
}));
