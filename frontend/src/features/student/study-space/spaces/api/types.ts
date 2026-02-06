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

/** 목록 카드에서 쓰는 DTO */
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

/* =========================================================
 * ✅ Student Rooms (조회 전용)
 * ========================================================= */
export type RoomDto = {
  roomId: number;
  roomName: string;
  minPeople: number;
  maxPeople: number;
  description?: string | null;

  operationStartDate: string;
  operationEndDate: string; 
  availableStartTime: string;
  availableEndTime: string;
};

export type RoomListResponse = ApiResponse<RoomDto[], null>;
export type RoomDetailResponse = ApiResponse<RoomDto, null>;

// ✅ 학생 예약 신청 DTO
export type CreateRentalRequestDto = {
  spaceId: number;
  roomId: number;
  retnaldate: string;
  startTime: string; 
  endTime: string;   
};


export type CreateRentalResponseDto = {
  rentalId: number;
  status: string;
};

export type CreateRentalResponse = ApiResponse<CreateRentalResponseDto, null>;

export type CreateRoomReservationRequestDto = {
  roomId: number;
  rentalDate: string;      
  startTime: string; 
  endTime: string;   
};

export type CreateRoomReservationResponseDto = {
  success: boolean;
  rentalId?: number;
  status?: string;
};

export type CreateRoomReservationResponse = ApiResponse<CreateRoomReservationResponseDto, null>;