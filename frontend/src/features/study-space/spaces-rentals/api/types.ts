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

export type RentalStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELED";

export type RentalDto = {
    rentalId: number;
    space: {
        spaceId: number;
        spaceName: string;
    };
    room: {
        roomId: number;
        roomName: string;
    };
    applicant: {
        accountId: number;
        name: string | null;
        studentNo: string | null;
        department: string | null;
    };
    rentalDate: string; // YYYY-MM-DD
    startTime: string;  // HH:mm
    endTime: string;    // HH:mm
    status: RentalStatus; // APPROVED, REQUESTED, etc.
    requestedAt: string; // YYYY-MM-DD HH:mm:ss
};

export type RentalListParams = {
    page?: number;
    size?: number;
    keyword?: string; // 검색어
};

export type RentalListResponse = ApiResponse<RentalDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;
