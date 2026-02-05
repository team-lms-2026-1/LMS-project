export type MentoringRole = "MENTOR" | "MENTEE";
export type MentoringStatus = "APPLIED" | "APPROVED" | "REJECTED" | "MATCHED" | "CANCELED";
export type RecruitmentStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface MentoringRecruitment {
    recruitmentId: number;
    semesterId: number;
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
    menteeApplicationId: number;
}

export interface MentoringApplicationRequest {
    recruitmentId: number;
    role: MentoringRole; // "MENTOR" or "MENTEE"
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
