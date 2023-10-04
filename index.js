import game from "./script.js";

game();
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", {scope: "./"});
}
