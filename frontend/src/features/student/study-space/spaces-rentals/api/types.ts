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

export type RentalStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED";

export type AuthMeDto = {
  accountId: number;
  loginId: string;
  accountType: "STUDENT" | "ADMIN" | string;
  permissionCodes?: string[];
};

export type AuthMeResponse = ApiResponse<AuthMeDto, null>;

export type RentalListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type RentalRawDto = {
  rentalId: number;

  space?: {
    spaceId?: number;
    spaceName?: string;
  };

  room?: {
    roomId?: number;
    roomName?: string;
  };

  applicant?: {
    accountId?: number;
    name?: string;
    studentNo?: string;
    department?: string;
  };

  rentalDate: string; 
  startTime: string;  
  endTime: string;    
  status: RentalStatus;

  requestAt?: string;
  rejectionReason?: string | null;
};


export type RentalDto = {
  rentalId: number;

  applicantAccountId?: number;
  applicantName?: string;
  applicantStudentNo?: string;
  applicantDepartment?: string;

  spaceId?: number;
  spaceName?: string;

  roomId?: number;
  roomName?: string;

  date: string;      
  startTime: string;
  endTime: string;

  status: RentalStatus;
  requestAt?: string;

  rejectionReason?: string | null;
};

export type RentalListResponse = ApiResponse<RentalRawDto[], PageMeta>;
export type RentalDetailResponse = ApiResponse<RentalRawDto, null>;

export type CancelRentalResponse = ApiResponse<{ success: boolean }, null>;
