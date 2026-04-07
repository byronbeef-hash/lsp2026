interface BetfairRpcRequest<TParams> {
  jsonrpc: "2.0";
  method: string;
  params: TParams;
  id: number;
}

interface BetfairRpcError {
  code: number;
  message: string;
}

interface BetfairRpcResponse<TResult> {
  result?: TResult;
  error?: BetfairRpcError;
}

export interface BetfairMarketCatalogue {
  marketId: string;
  marketName: string;
  description?: {
    marketTime?: string;
  };
  event?: {
    id?: string;
    name?: string;
    venue?: string;
  };
  runners?: Array<{
    selectionId: number;
    runnerName: string;
  }>;
}

export interface BetfairRunnerBook {
  selectionId: number;
  lastPriceTraded?: number;
  totalMatched?: number;
  ex?: {
    availableToBack?: Array<{ price: number; size: number }>;
    availableToLay?: Array<{ price: number; size: number }>;
  };
}

export interface BetfairMarketBook {
  marketId: string;
  totalMatched?: number;
  runners?: BetfairRunnerBook[];
}

interface PlaceInstruction {
  selectionId: number;
  side: "BACK" | "LAY";
  orderType: "LIMIT";
  limitOrder: {
    size: number;
    price: number;
    persistenceType?: "LAPSE" | "PERSIST" | "MARKET_ON_CLOSE";
  };
}

export class BetfairClient {
  private readonly baseUrl =
    process.env.BETFAIR_API_URL ??
    "https://api.betfair.com/exchange/betting/json-rpc/v1";

  private readonly appKey =
    process.env.BETFAIR_APP_KEY ??
    process.env.BETFAIR_DELAY_APP_KEY ??
    process.env.BETFAIR_LIVE_APP_KEY;
  private readonly sessionToken = process.env.BETFAIR_SESSION_TOKEN;

  isConfigured(): boolean {
    return Boolean(this.appKey && this.sessionToken);
  }

  getConfigurationStatus() {
    return {
      hasSessionToken: Boolean(this.sessionToken),
      hasAppKey: Boolean(this.appKey),
      usingKeySource: process.env.BETFAIR_APP_KEY
        ? "BETFAIR_APP_KEY"
        : process.env.BETFAIR_DELAY_APP_KEY
          ? "BETFAIR_DELAY_APP_KEY"
          : process.env.BETFAIR_LIVE_APP_KEY
            ? "BETFAIR_LIVE_APP_KEY"
            : "missing",
    } as const;
  }

  async listMarketCatalogue(params: {
    filter: Record<string, unknown>;
    maxResults?: number;
    marketProjection?: string[];
    sort?: string;
  }): Promise<BetfairMarketCatalogue[]> {
    return this.rpcCall("SportsAPING/v1.0/listMarketCatalogue", params);
  }

  async listMarketBook(params: {
    marketIds: string[];
    priceProjection?: Record<string, unknown>;
    orderProjection?: string;
    matchProjection?: string;
  }): Promise<BetfairMarketBook[]> {
    return this.rpcCall("SportsAPING/v1.0/listMarketBook", params);
  }

  async placeOrders(params: {
    marketId: string;
    instructions: PlaceInstruction[];
    customerRef?: string;
  }): Promise<unknown> {
    return this.rpcCall("SportsAPING/v1.0/placeOrders", params);
  }

  private async rpcCall<TResult, TParams>(
    method: string,
    params: TParams
  ): Promise<TResult> {
    if (!this.appKey || !this.sessionToken) {
      throw new Error("Betfair credentials are not configured.");
    }

    const payload: BetfairRpcRequest<TParams> = {
      jsonrpc: "2.0",
      method,
      params,
      id: Date.now(),
    };

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Application": this.appKey,
        "X-Authentication": this.sessionToken,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Betfair request failed with status ${response.status}.`);
    }

    const body = (await response.json()) as BetfairRpcResponse<TResult>;

    if (body.error) {
      throw new Error(`Betfair RPC error ${body.error.code}: ${body.error.message}`);
    }

    if (body.result === undefined) {
      throw new Error("Betfair RPC response was missing a result.");
    }

    return body.result;
  }
}
