import * as booklog from "../src/index.js";

(async() => {

    // This function is required.
    await booklog.setCookie();

    // Searches for books based on the provided title and page.
    console.log(await booklog.search("本の名前", 2));


})();
