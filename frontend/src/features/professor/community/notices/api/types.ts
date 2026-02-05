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
}

export type NoticeListItemDto = {
    noticeId: number;
    category: Category;
    title: string;
    content: string;
    authorName: string;
    viewCount: number;
    createdAt: string;
    status: string;
    files: any[]
}

export type NoticeListResponse = ApiResponse<NoticeListItemDto[], PageMeta>;
