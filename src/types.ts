export interface OrderBookData {
  data: {
    asks: [string, string][];
    bids: [string, string][];
    prevSeqNum: number;
    seqNum: number;
    symbol: string;
    timestamp: number;
    type: string;
  };
  topic: string;
}
