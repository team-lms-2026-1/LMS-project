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

export type FaqListItemDto = {
    faqId: number;
    category: Category;
    title: string;
    content: string;
    authorName: string;
    viewCount: number;
    createdAt: string;
}


export type FaqDetailDto = {
    faqId: number;
    category: Category;
    title: string;
    content: string;
    authorName: string;
    viewCount: number;
    createdAt: string;
}

export type FaqListResponse = ApiResponse<FaqListItemDto[], PageMeta>;
export type FaqDetailResponse = ApiResponse<FaqDetailDto, null>;
export type FaqCategoryListResponse = ApiResponse<Category[], null>;
