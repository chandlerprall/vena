"use strict";
const socket = new WebSocket("ws://localhost:2448/livereload");
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (typeof data === "object" && "type" in data) {
        if (data.type === "reload") {
            console.log("Reloading", data.filename);
            const scriptUrl = `./${data.filename}?t=${Date.now()}`;
            const script = document.createElement("script");
            script.type = "module";
            script.src = scriptUrl;
            script.onload = () => {
                script.remove();
            };
            document.head.append(script);
        }
    }
};
//# sourceMappingURL=live.js.map