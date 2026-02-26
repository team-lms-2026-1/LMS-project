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

export type FileType = "IMAGE" | "DOCUMENT" | "VIDEO" | "ETC" | string;
export type NoticeStatus = "SCHEDULED" | "ONGOING" | "ENDED" | string;
export type SearchType = "TITLE" | "CONTENT" | "TITLE_OR_CONTENT" | "WRITER" | string;

export type HexColor = `#${string}`;

export type Category = {
  categoryId: number;
  name: string;
  bgColorHex: HexColor;
  textColorHex: HexColor;
};

/** DTO */
export type ResourceListItemDto={
    resourceId : number;
    category : Category;
    title : string;
    content : string;
    authorName : string;
    viewCount : number;
    createdAt : string;
    files : any[]
}

export type CreateResourceRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
  displayStartAt?: string | null;
  displayEndAt?: string | null;
};

export type UpdateResourceRequestDto = {
  title: string;
  content: string;
  categoryId?: number ;
  deleteFileIds?: number[];
};

export type ResourceFileDto = {
  fileId?: number;
  id?: number; 
  storageKey?: string;
  fileName?: string;
  originalName?: string;
  name?: string;
  url?: string;
  downloadUrl?: string;
  fileType?: FileType;
  size?: number;
};

export type ExistingFile = {
  fileId?: number;
  storageKey?: string;
  fileName: string;
  url?: string;
};

export type LoadState<T> =
  | { loading: true; error: string | null; data: null }
  | { loading: false; error: string | null; data: T | null };

export type UpdateResourceResponse = ApiResponse<{ resourceId: number }, null>;

/** Response */
export type ResourceListResponse = ApiResponse<ResourceListItemDto[], PageMeta>;
export type SuccessResponse = ApiResponse<{ success: boolean }, null>;

export type CreateResourceResponseDto = {resourceId: number;};
export type CreateResourceResponse = ApiResponse<CreateResourceResponseDto, null>;

export type ResourceCategoryListResponse = ApiResponse<Category[], null>;

// Component types
export type ResourceTableProps = {
  items: ResourceListItemDto[];
  loading: boolean;
  onReload: () => void;
};

export type ResourceDeleteModalProps = {
  open: boolean;
  targetLabel?: string;
  targetTitle?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
};
