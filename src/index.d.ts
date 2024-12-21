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
    result?: SearchResult[];
}>;

export interface BookInfoResult {
    imageUrl: string | undefined;
    name: string;
    author: string | undefined;
    publisher: string | undefined;
    datePublished: string | undefined;
    ratingValue: string;
    infoUsers: string;
    reviewCount: string;
    amazonUrl: string | undefined;
}

export declare function bookInfo(bookId: string): Promise<{
    success: boolean;
    result?: BookInfoResult[];  
}>;

export interface RankingResult {
    ranking: number | undefined;
    imageUrl: string | undefined;
    title: string | undefined;
}

export declare function ranking(bookType: string, aggregationPeriod: string): Promise<{
    success: boolean;
    result?: RankingResult[];
}>;