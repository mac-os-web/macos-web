import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";
import { logger } from "./logger";

export const api = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエストインターセプター（送る前の共通処理）
api.interceptors.request.use(
  (config) => {
    // 認証トークンなど、共通ヘッダーはここで追加する
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター（受け取った後の共通処理）
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (!error.response) {
      logger.error("ネットワークエラー", url);
    } else if (status && status >= 500) {
      logger.error(`サーバーエラー ${status}`, url);
    } else if (status === 429) {
      logger.warn("リクエスト制限", url);
    } else {
      logger.warn(`APIエラー ${status}`, url);
    }

    return Promise.reject(error);
  }
);

// オーバーライドできるGETヘルパー
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}
