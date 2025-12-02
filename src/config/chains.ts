export const BNB_MAINNET_ID = 56;
export const BNB_TESTNET_ID = 97;

export function getBnbChainId() {
  const id = Number(import.meta.env.VITE_BNB_CHAIN_ID || BNB_TESTNET_ID);
  return id === BNB_MAINNET_ID ? BNB_MAINNET_ID : BNB_TESTNET_ID;
}

export function getBscScanBase() {
  const id = getBnbChainId();
  return id === BNB_MAINNET_ID ? 'https://bscscan.com/tx/' : 'https://testnet.bscscan.com/tx/';
}
