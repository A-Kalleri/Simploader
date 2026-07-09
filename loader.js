const fileInput = document.getElementById("fileinput");

const params = new URLSearchParams(location.search);

const windowId =
        Number(params.get("windowId"));

const incognito =
        params.get("incognito") === "true";

const newWindow =
        params.get("newWindow") === "true";

document.addEventListener("click", () => {

        fileInput.value = "";
        fileInput.click();

}, { once: true });

fileInput.onchange = async (e) => {

        const file = e.target.files[0];

        if (!file) {
                window.close();
                return;
        }

        try {

                const buffer = await file.arrayBuffer();
                const data = new Uint8Array(buffer);

                for (let i = 0; i < data.length; i++) {
                        data[i] ^= 31;
                }

                const text =
                        new TextDecoder().decode(data);

                const urls = text
                        .split("\n")
                        .map(url => url.trim())
                        .filter(url =>
                                url.startsWith("https://") ||
                                url.startsWith("http://")
                        );

                if (urls.length === 0) {

                        alert("No URLs found.");
                        window.close();
                        return;
                }

                if (newWindow) {

                        chrome.windows.create({
                                url: urls,
                                incognito: incognito
                        });

                } else {

                        urls.forEach(url => {

                                chrome.tabs.create({
                                        windowId,
                                        url
                                });

                        });

                }

                window.close();

        } catch (err) {

                console.error(err);

                alert("Failed to load file.");

                window.close();
        }
};
