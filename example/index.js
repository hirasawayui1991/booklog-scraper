import * as booklog from "../src/index.js";

(async() => {

    // This function is required.
    await booklog.setCookie();

    // Searches for books based on the provided title and page.
    console.log(await booklog.search("Book Name", 2));

    // Gets the details of the book given its id.
    console.log(await booklog.bookInfo("Book ID"));

})();
