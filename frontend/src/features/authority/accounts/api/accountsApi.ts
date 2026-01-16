import { bffRequest } from "@/lib/bffClient";
import { AccountStatus, AccountType } from "../types";
import { AccountsListResponseDto, UpdateAccountRequestDto } from "./dto";
import type { CreateAccountRequestDto } from "./dto";

const BASE = "/api/v1/admin/accounts";

type AccountsListParams = {
  accountType?: AccountType;
  keyword?: string;
  page?: number;
  size?: number;
};

export const accountsApi = {
  list(params?: AccountsListParams) {
    const qs = new URLSearchParams();
    if (params?.accountType) qs.set("accountType", params.accountType);
    if (params?.keyword) qs.set("keyword", params.keyword);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.size) qs.set("size", String(params.size));

    const url = qs.toString() ? `${BASE}?${qs.toString()}` : BASE;
    return bffRequest<AccountsListResponseDto>(url);
  },

  create(body: CreateAccountRequestDto) {
    return bffRequest<{ accountId: number }>(BASE, { method: "POST", body });
  },

  update(accountId: number, body: UpdateAccountRequestDto) {
    return bffRequest<void>(`${BASE}/${accountId}`, { method: "PUT", body });
  },

  updateStatus(accountId: number, status: AccountStatus) {
    return bffRequest<void>(`${BASE}/${accountId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  resetPassword(accountId: number) {
    return bffRequest<void>(`${BASE}/${accountId}/password/reset`, {
      method: "POST",
      body: {},
    });
  },
};
