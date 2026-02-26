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

export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type MentoringRole = "MENTOR" | "MENTEE";
export type MentoringStatus = "APPLIED" | "APPROVED" | "REJECTED" | "MATCHED" | "CANCELED";
export type RecruitmentStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface MentoringRecruitment {
    recruitmentId: number;
    semesterId: number;
    semesterName: string;
    title: string;
    description: string;
    recruitStartAt: string;
    recruitEndAt: string;
    status: RecruitmentStatus;
    appliedRole?: string;
    applyStatus?: MentoringStatus;
}

export interface MentoringApplication {
    applicationId: number;
    recruitmentId: number;
    accountId: number;
    loginId: string;
    name: string;
    role: MentoringRole;
    status: MentoringStatus;
    appliedAt: string;
    applyReason?: string;
    studentNo?: string;
    gradeLevel?: number;
    deptName?: string;
    phone?: string;
    email?: string;
    matchedCount?: number;
}

export interface MentoringRecruitmentCreateRequest {
    semesterId: number;
    title: string;
    description: string;
    recruitStartAt: string;
    recruitEndAt: string;
}

export interface MentoringStatusUpdateRequest {
    status: MentoringStatus;
    rejectReason?: string;
}

export interface MentoringMatchingRequest {
    recruitmentId: number;
    mentorApplicationId: number;
    menteeApplicationIds: number[];
}

export interface MentoringApplicationRequest {
    recruitmentId: number;
    role: MentoringRole;
    reason?: string;
}

export interface MentoringMatchingResponse {
    matchingId: number;
    recruitmentId: number;
    recruitmentTitle: string;
    partnerId: number;
    partnerName: string;
    role: "MENTOR" | "MENTEE";
    status: string;
    matchedAt: string;
}

export interface ChatMessageResponse {
    id: number;
    senderId: number;
    senderName: string;
    content: string;
    type: "QUESTION" | "ANSWER";
    createdAt: string;
}

export interface MentoringMatchingAdminResponse {
    matchingId: number;
    recruitmentId: number;
    recruitmentTitle: string;
    mentorAccountId: number;
    mentorName: string;
    menteeAccountId: number;
    menteeName: string;
    status: string;
    matchedAt: string;
}

/** Response Types */
export type MentoringRecruitmentListResponse = ApiResponse<MentoringRecruitment[], PageMeta>;
export type MentoringRecruitmentDetailResponse = ApiResponse<MentoringRecruitment, null>;
export type MentoringApplicationListResponse = ApiResponse<MentoringApplication[], null>;
export type MentoringMatchingListResponse = ApiResponse<MentoringMatchingResponse[], null>;
export type MentoringMatchingAdminListResponse = ApiResponse<MentoringMatchingAdminResponse[], null>;
export type ChatHistoryResponse = ApiResponse<ChatMessageResponse[], null>;
export type MentoringCreateResponse = ApiResponse<number, null>;
