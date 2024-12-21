import axios from "axios";
import * as cheerio from "cheerio";
import { BooklogError } from "./error/index.js";

let cookie = "";

// This is a required function and cookies are used for all retrieval functions.
export const setCookie = async () => {
    try {
        const response = await axios.get("https://booklog.jp");
        if (response.status === 200) {
            cookie = response.headers["set-cookie"];
        } else {
            return console.error("An error occurred while retrieving the cookies | response status code: ", response.status);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

// Headers common to all requests.
const headers = () => {
    return {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ja;q=0.5",
        "cookie": cookie,
        "priority": "u=0, i",
        "referer": "https://booklog.jp",
        "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "sec-gpc": "1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
}

/**
 * Searches for books based on the provided title and page.
 * 
 * @param {string} title - The title of the book to search for. 
 * @param {number} page - The page number for the search results. 
 * @returns {Promise<Object>} The result of the search with success status and searchresults.
 */
export async function search(title, page) {

    if (!title || typeof title != "string") throw new BooklogError("The title is invalid");
    if (isNaN(page) || page === 0) throw new BooklogError("The page is invalid");

    try {

        const response = await axios.get(`https://booklog.jp/search?page=${page}&service_id=1&index=Books&keyword=${title}`, {
            headers: headers()
        });

        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            if ($(".errorArea").text() === "想定外のエラーが発生しました。") {
                return {
                    success: false,
                    page: "None",
                    result: "No search results found."
                }
            } else {

                const results = [];

                $(".itemListImage a").each((index, element) => {
                    const bookId = $(element).attr("href");
                    const splitted = bookId.split("/")[3];
                    if (splitted === undefined || splitted === null) return Object.assign(results[index] || (results[index] = {}), { bookId: "None" });
                    Object.assign(results[index] || (results[index] = {}), { bookId: splitted });
                });

                $("img.itemImg").each((index, element) => {
                    const imageUrl = $(element).attr("src");
                    if (imageUrl === undefined || imageUrl === null) return Object.assign(results[index] || (results[index] = {}), { imageUrl: "None" });
                    Object.assign(results[index] || (results[index] = {}), { imageUrl: imageUrl });
                });
                
                $("a.titleLink").each((index, element) => {
                    if (title === undefined || title === null) return Object.assign(results[index] || (results[index] = {}), { title: "None" });
                    Object.assign(results[index] || (results[index] = {}), { title: title });
                });

                $(".descMini .itemInfoElmBox .itemInfoElm .author").each((index, element) => {
                    const author = $(element).text();
                    if (author === undefined || author === null) return Object.assign(results[index] || (results[index] = {}), { author: "None" });
                    Object.assign(results[index] || (results[index] = {}), { author: author });
                });

                $(".info-users .num").each((index, element) => {
                    const infoUsers = $(element).text();
                    if (infoUsers === undefined || infoUsers === null) return Object.assign(results[index] || (results[index] = {}), { infoUsers: "None" });
                    Object.assign(results[index] || (results[index] = {}), { infoUsers: infoUsers });
                });
                
                $(".info-rating .num").each((index, element) => {
                    const infoRating = $(element).text();
                    if (infoRating === undefined || infoRating === null) return Object.assign(results[index] || (results[index] = {}), { infoRating: "None" });
                    Object.assign(results[index] || (results[index] = {}), { infoRating: infoRating });
                });
                
                $(".info-reviews .num").each((index, element) => {
                    const infoReviews = $(element).text();
                    if (infoReviews === undefined || infoReviews === null) return Object.assign(results[index] || (results[index] = {}), { infoReviews: "None" });
                    Object.assign(results[index] || (results[index] = {}), { infoReviews: infoReviews });
                });
                
                $("#mainArea > div.search-result.autopagerize_page_element > div:nth-child(1) > div.itemListInfo > div.descMini > div > span:nth-child(3) > a").each((index, element) => {
                    const amazonUrl = $(element).attr("href");
                    if (amazonUrl === undefined || amazonUrl === null) return Object.assign(results[index] || (results[index] = {}), { amazonUrl: "None" });
                    Object.assign(results[index] || (results[index] = {}), { amazonUrl: amazonUrl });
                });

                return {
                    success: true,
                    page: page,
                    result: results
                }
            }

        } else {
            return {
                success: false,
                result: `Error: response status code: ${response.status}`
            }
        }
    } catch (e) {
        return {
            success: false,
            result: `Error: ${e}`
        }
    }
}

/**
 * Gets the datails of the book given its ID.
 * 
 * @param {string} bookId - The ID of the book to be retrieved.
 * @returns {Promise<Object>} - The result of the search with success status and searchresults.
 */
export async function bookInfo(bookId) {

    if (!bookId && typeof bookId != "string") throw new BooklogError("The bookId is invalid");

    try {

        const response = await axios.get(`https://booklog.jp/item/1/${bookId}`, {
            headers: headers
        });

        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            if ($(".error ts18").text() === "ページが見つかりませんでした。") {
                return {
                    success: false,
                    result: "Page not found."
                }
            } else {

                let results = {
                    imageUrl: "",
                    name: "",
                    author: "",
                    publisher: "",
                    datePublished: "",
                    ratingValue: "",
                    infoUsers: "",
                    reviewCount: "",
                    amazonUrl: ""
                };

                const imageUrl = $("img[itemprop='thumbnailUrl']").attr("src");
                results.imageUrl = imageUrl || undefined;

                const name = $("h1[itemprop='name']").text();
                results.name = name || undefined;

                const author = $("a[itemprop='author']").text();
                results.author = author || undefined;

                const publisher = $("span[itemprop='publisher']").text();
                results.publisher = publisher || undefined;

                const datePublished = $("span[itemprop='datePublished']").text();
                results.datePublished = datePublished || undefined;

                const ratingValue = $(".rating-value").text();
                results.ratingValue = ratingValue[0] || undefined;
                
                const infoUsers = $(".users span").text();
                results.infoUsers = infoUsers || undefined;
                
                const reviewCount = $("span[itemprop='reviewCount']").text();
                results.reviewCount = reviewCount || undefined;

                const amazonUrl = $(".btn-amazon-detail.middle").attr("href");
                results.amazonUrl = amazonUrl || undefined;

                return {
                    success: true,
                    result: results
                }
            }
        } else {
            return {
                success: false,
                result: `Error: response status code: ${response.status}`
            }
        }
    } catch (e) {
        return {
            success: false,
            result: `Error: ${e}`
        }
    }
}

export async function ranking(bookType, aggregationPeriod) {

    const bookTypes = [ "book", "bunko", "shinsho", "comic", "honour" ];
    const aggregationPeriods = [ "daily", "weekly", "monthly", "annual" ];

    if (!bookTypes.includes(bookType)) throw new BooklogError("The book type is invalid");
    if (!aggregationPeriods.includes(aggregationPeriod)) throw new BooklogError("The aggregation period is invalid");

    const reqLink = aggregationPeriod === "daily"
        ? `https://booklog.jp/ranking/${bookType}`
        : `https://booklog.jp/ranking/${aggregationPeriod}/${bookType}`;

        console.log(reqLink);
    const pages = [1, 2, 3, 4, 5];

    const results = [];

    for (const page of pages) {

        try {
            
            const response = await axios.get(`${reqLink}?page=${page}`, {
                headers: headers()
            });

            if (response.status === 200) {

                const $ = cheerio.load(response.data);

                $(".thumb img").each((index, element) => {
                    const imageUrl = $(element).attr("src");
                    if (imageUrl === undefined || imageUrl === null) return Object.assign(results[index] || (results[index] = {}), { imageUrl: "None" });
                    Object.assign(results[index] || (results[index] = {}), {
                        ranking: index,
                        imageUrl: imageUrl
                    });
                });

                $(".titleLink").each((index, element) => {
                    const title = $(element).text();
                    if (title === undefined || title === null) return Object.assign(results[index] || (results[index] = {}), { title: "None" });
                    Object.assign(results[index] || (results[index] = {}), { title: title });
                });

                return {
                    success: true,
                    result: results
                }
            } else {
                return {
                    success: false,
                    result: `Error: response status coode: ${response.status}`
                }
            }
        } catch (e) {
            return {
                success: false,
                result: `Error: ${e}`
            }
        }
    }
}