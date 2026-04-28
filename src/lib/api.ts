export type ApiResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

export function normalizeBase(url: string): string {
  return (url || "").replace(/\/+$/, "");
}
