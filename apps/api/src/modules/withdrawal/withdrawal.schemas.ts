import { z } from 'zod';
import { TokenSymbol } from '@prisma/client';
import Decimal from 'decimal.js';

const PixKeySchema = z.string().min(1).refine((val) => {
  // Regex para Email, CPF (11), Telefone (13) ou UUID (aleatória)
  return /.+@.+\..+|^\d{11}$|^\d{13}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(val);
}, { message: 'Chave PIX inválida' });

const CryptoAddressSchema = z.string().min(26).max(62);

const AmountSchema = z.string().refine((val) => {
  try {
    const d = new Decimal(val);
    return d.greaterThan(0);
  } catch {
    return false;
  }
}, { message: 'Valor deve ser um decimal positivo' });

export const WithdrawalInputSchema = z.discriminatedUnion('token', [
  z.object({
    token: z.literal(TokenSymbol.BRL),
    amount: AmountSchema,
    address: PixKeySchema,
    externalId: z.string().uuid(),
  }),
  z.object({
    token: z.literal(TokenSymbol.BTC),
    amount: AmountSchema,
    address: CryptoAddressSchema,
    externalId: z.string().uuid(),
  }),
  z.object({
    token: z.literal(TokenSymbol.ETH),
    amount: AmountSchema,
    address: CryptoAddressSchema,
    externalId: z.string().uuid(),
  }),
]);

export type WithdrawalInput = z.infer<typeof WithdrawalInputSchema>;
