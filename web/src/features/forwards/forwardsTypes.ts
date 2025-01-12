export type Forward = {
  alias: string;
  channelId: number;
  channelPoint: string;
  pubKey: string;
  shortChannelId: string;
  lndShortChannelId: string;
  fundingOutputIndex: number;
  fundingTransactionHash: string;
  color: string;
  open: boolean;
  capacity: number;
  amountOut: number;
  amountIn: number;
  amountTotal: number;
  revenueOut: number;
  revenueIn: number;
  revenueTotal: number;
  countOut: number;
  countIn: number;
  countTotal: number;
  turnoverOut: number;
  turnoverIn: number;
  turnoverTotal: number;
};
