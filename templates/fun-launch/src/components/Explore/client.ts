import ky, { Options } from 'ky';
import {
  GetChartRequest,
  GetChartResponse,
  GetGemsTokenListIndividualResponse,
  GetGemsTokenListRequest,
  GetTokenDescriptionResponse,
  GetTokenRequest,
  GetTokenResponse,
  GetTopHoldersResponse,
  GetTxsRequest,
  GetTxsResponse,
} from './types';
import { serializeParams } from '@/lib/utils';

const BASE_URL = 'https://datapi.jup.ag';

export class ApeClient {
  static async getGemsTokenList<T extends GetGemsTokenListRequest>(
    req: T,
    options?: Options
  ): Promise<{
    [K in keyof T]: undefined extends T[K]
      ? GetGemsTokenListIndividualResponse | undefined
      : GetGemsTokenListIndividualResponse;
  }> {
    return ky
      .post(`${BASE_URL}/v1/pools/gems`, {
        json: req,
        ...options,
      })
      .json();
  }
  static async getToken(req: GetTokenRequest, options?: Options): Promise<GetTokenResponse> {
    return ky
      .get(`${BASE_URL}/v1/pools`, {
        searchParams: serializeParams({
          assetIds: [req.id],
        }),
        ...options,
      })
      .json();
  }

  static async getTokenHolders(assetId: string, options?: Options): Promise<GetTopHoldersResponse> {
    return ky.get(`${BASE_URL}/v1/holders/${assetId}`, options).json();
  }

  static async getChart(
    assetId: string,
    params: GetChartRequest,
    options?: Options
  ): Promise<GetChartResponse> {
    return ky
      .get(`${BASE_URL}/v2/charts/${assetId}`, {
        searchParams: serializeParams(params),
        ...options,
      })
      .json();
  }

  static async getTokenTxs(
    assetId: string,
    req: GetTxsRequest,
    options?: Options
  ): Promise<GetTxsResponse> {
    return ky
      .get(`${BASE_URL}/v1/txs/${assetId}`, {
        searchParams: serializeParams(req),
        ...options,
      })
      .json();
  }

  static async getTokenDescription(
    assetId: string,
    options?: Options
  ): Promise<GetTokenDescriptionResponse> {
    return ky.get(`${BASE_URL}/v1/assets/${assetId}/description`, options).json();
  }
}
