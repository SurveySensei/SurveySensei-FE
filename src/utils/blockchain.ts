import { getContract, prepareContractCall } from 'thirdweb';
import { toWei } from 'thirdweb/utils';
import { client } from '@/config/thirdweb';
import abiJson from '@/utils/surveyRewardsAbi.json';
import { getBnbChain } from '@/config/chains';

export const SURVEY_CONTRACT_ADDRESS = '0xF01973c4A8eDC7B8173AdC8E097A1EfE479f4571';
const BNB_CHAIN = getBnbChain();

export interface SurveyParams {
  surveyId: string;
  totalReward: string;
  targetResponses: number;
}

export function buildCreateSurveyTransaction(
  account: any,
  surveyParams: SurveyParams
) {
  const amountStr = String(surveyParams.totalReward).trim().replace(/[^0-9.]/g, '');
  const totalRewardInWei = toWei(amountStr || '0');

  const contract = getContract({
    client,
    chain: BNB_CHAIN,
    address: SURVEY_CONTRACT_ADDRESS,
    abi: (abiJson as any).abi,
  });

  const tx = prepareContractCall({
    contract,
    method: 'createSurveyOnChain',
    params: [
      surveyParams.surveyId,
      account.address,
      totalRewardInWei,
      BigInt(surveyParams.targetResponses),
    ],
    value: totalRewardInWei,
  });

  return tx;
}
