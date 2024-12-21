export let cookie: string;

export declare const setCookie: () => Promise<void>;

export declare const headers: () => {
    [key: string]: string;
};

export interface SearchResult {
    bookId: string;
    imageUrl: string | undefined;
    title: string;
    author: string | undefined;
    bookType: string;
    infoUsers: string | undefined;
    infoRating: string | undefined;
    infoReviews: string | undefined;
    amazonUrl: string | undefined;
}

export declare function search(title: string, page: number): Promise<{
    success: boolean;
    page: string | number;
    result?: string;
    results?: SearchResult[];
}>;

export declare class InvalidParameterError extends Error {
    constructor(message: string);
}