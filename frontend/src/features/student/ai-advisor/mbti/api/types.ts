export interface ApiResponse<T> {
    data: T;
    meta: any;
    error: any;
}

export interface MbtiChoice {
    choiceId: number;
    content: string;
}

export interface MbtiQuestion {
    questionId: number;
    content: string;
    sortOrder: number;
    choices: MbtiChoice[];
    createdAt: string;
    updatedAt: string;
}

export interface MbtiScore {
    e: number;
    i: number;
    s: number;
    n: number;
    t: number;
    f: number;
    j: number;
    p: number;
}

export interface MbtiResult {
    resultId: number;
    accountId: number;
    mbtiType: string;
    score: MbtiScore;
    createdAt: string;
}

export interface MbtiAnswer {
    questionId: number;
    choiceId: number;
}

export interface MbtiSubmitRequest {
    answers: MbtiAnswer[];
}
