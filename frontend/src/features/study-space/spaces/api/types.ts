export type ApiResponse<T, M = null> = {
  data: T;
  meta: M;
};

export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sort: string[];
};

export type SpaceListParams = {
  page?: number;
  size?: number;
  keyword?: string;
  isActive?: boolean;
  isRentable?: boolean;
};

/** 목록 카드에서 쓰는 공통 DTO */
export type SpaceDto = {
  spaceId: number;
  spaceName: string;
  location: string;
  isActive: boolean;
  mainImageUrl: string;
  isRentable: boolean;
  minPeople: number;
  maxPeople: number;
};

export type SpaceListItemDto = SpaceDto;

/** 상세 이미지 DTO */
export type SpaceImageDto = {
  imageId: number;
  imageUrl: string;
  sortOrder: number;
};

/** 상세 규칙 DTO */
export type SpaceRuleDto = {
  ruleId: number;
  content: string;
  sortOrder: number;
};

/** 상세 DTO */
export type SpaceDetailDto = {
  spaceId: number;
  spaceName: string;
  location: string;
  description: string;
  isRentable: boolean;
  images: SpaceImageDto[];
  rules: SpaceRuleDto[];
};

/** Response */
export type SpaceListResponse = ApiResponse<SpaceListItemDto[], PageMeta>;
export type SpaceDetailResponse = ApiResponse<SpaceDetailDto, null>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;
export type DeleteSpaceResponse = SuccessResponse;

/** 룰 upsert */
export type SpaceRuleUpsertDto = {
  ruleId?: number;
  content: string;
  sortOrder: number;
};

/** ✅ 수정 요청(멀티파트 data JSON) */
export type UpdateSpaceDetailRequestDto = {
  spaceName: string;
  location: string;
  description: string;
  isRentable: boolean;
  rules: SpaceRuleUpsertDto[];
  deleteMainImage?: boolean;
};
export type UpdateSpaceDetailResponse = ApiResponse<SpaceDetailDto, null>;

/** ✅ 등록 요청(멀티파트 data JSON) */
export type CreateSpaceDetailRequestDto = {
  spaceName: string;
  location: string;
  description: string;
  isRentable: boolean;
  rules: SpaceRuleUpsertDto[];
};
export type CreateSpaceDetailResponse = ApiResponse<SpaceDetailDto, null>;

/* =========================================================
 * ✅ Admin Rooms (백엔드 응답: roomName/operationStartDate...)
 * ========================================================= */
export type AdminRoomDto = {
  roomId: number;
  roomName: string;
  minPeople: number;
  maxPeople: number;
  description?: string | null;

  operationStartDate: string; // YYYY-MM-DD
  operationEndDate: string;   // YYYY-MM-DD
  availableStartTime: string; // HH:mm
  availableEndTime: string;   // HH:mm
};

export type AdminRoomListResponse = ApiResponse<AdminRoomDto[], null>;
export type AdminRoomDetailResponse = ApiResponse<AdminRoomDto, null>;

export type CreateAdminRoomRequestDto = Omit<AdminRoomDto, "roomId">;
export type UpdateAdminRoomRequestDto = Partial<Omit<AdminRoomDto, "roomId">>;

export type SpaceRoomDto = {
  roomId?: number;     // 신규는 없을 수 있음
  name: string;

  minPeople: number;
  maxPeople: number;

  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
};