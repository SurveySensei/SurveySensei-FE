import { defineChain } from 'thirdweb/chains';

export const BNB_MAINNET = defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpc: ['https://bsc-dataseed.binance.org/'],
  slug: 'bnb-smart-chain',
  testnet: false,
});

export const BNB_TESTNET = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'BNB Test', symbol: 'TBNB', decimals: 18 },
  rpc: ['https://bsc-testnet.publicnode.com'],
  slug: 'bnb-smart-chain-testnet',
  testnet: true,
});

export function getBnbChain() {
  const id = Number(import.meta.env.VITE_BNB_CHAIN_ID || 97);
  return id === 56 ? BNB_MAINNET : BNB_TESTNET;
}
