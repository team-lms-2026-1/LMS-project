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

export type Category = {
    categoryId: number;
    name: string;
    bgColorHex: string;
    textColorHex: string;
};

export type QnaAnswerDto = {
    answerId: number;
    content: string;
    authorName: string;
    createdAt: string;
    updatedAt?: string;
};

export type QnaListItemDto = {
    questionId: number;
    category: Category | null;
    title: string;
    content: string;
    authorName: string;
    authorId?: number | null;
    authorLoginId?: string | null;
    viewCount: number;
    createdAt: string;
    hasAnswer: boolean;
};

export type QnaDetailDto = {
    questionId: number;
    category: Category | null;
    title: string;
    content: string;
    authorName: string;
    authorId?: number | null;
    authorLoginId?: string | null;
    viewCount: number;
    createdAt: string;
    answer?: QnaAnswerDto | null;
    hasAnswer?: boolean;
};

// 교수는 작성/수정/삭제 불가하므로 관련 DTO 불필요
export type QnaListResponse = ApiResponse<QnaListItemDto[], PageMeta>;
export type QnaDetailResponse = ApiResponse<QnaDetailDto, null>;
export type QnaCategoryListResponse = ApiResponse<Category[], null>;
