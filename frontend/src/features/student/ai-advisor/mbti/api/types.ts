export type ApiResponse<T, M = null> = {
    data: T;
    meta: M;
};



export type MbtiChoice = {
    choiceId: number;
    content: string;
}

export type MbtiQuestion = {
    questionId: number;
    content: string;
    sortOrder: number;
    choices: MbtiChoice[];
    createdAt: string;
    updatedAt: string;
}




export type MbtiSubmitRequest = {
    answers: MbtiAnswer[];
}

export type MbtiAnswer = {
    questionId: number;
    choiceId: number;
}

export type MbtiScore = {
    e: number;
    i: number;
    s: number;
    n: number;
    t: number;
    f: number;
    j: number;
    p: number;
}

export type MbtiResult = {
    resultId: number;
    accountId: number;
    mbtiType: string;
    score: MbtiScore;
    createdAt: string;
}



export type MbtiDimension = "EI" | "SN" | "TF" | "JP" | string;
export type MbtiResultType = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P" | "NONE" | string;

export type MbtiQuestionResponse = ApiResponse<MbtiQuestion[], null>;
export type MbtiResultResponse = ApiResponse<MbtiResult, null>;
export type MbtiLatestResultResponse = ApiResponse<MbtiResult, null>;
