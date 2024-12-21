export async function sleep(ms) {
    if (typeof ms != "number") throw new Error("The number is invalid");
    return new Promise(resolve => setTimeout(resolve, ms));
}