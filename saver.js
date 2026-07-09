const params = new URLSearchParams(location.search);

const windowId = Number(params.get("windowId"));

window.addEventListener("load", () => {

        chrome.tabs.query(
                { windowId: windowId },
                (tabs) => {

                        const urls = tabs
                                .map(tab => tab.url)
                                .filter(url =>
                                        url && url.startsWith("https://")
                                );

                        if (urls.length === 0) {
                                window.close();
                                return;
                        }

                        const text = urls.join("\n");

                        const data = new TextEncoder().encode(text);

                        for (let i = 0; i < data.length; i++) {
                                data[i] ^= 31;
                        }

                        const blob = new Blob([data], {
                                type: "application/octet-stream"
                        });

                        const objectUrl = URL.createObjectURL(blob);

                        chrome.downloads.download({
                                url: objectUrl,
                                filename: "session.sld",
                                saveAs: true
                        }, () => {

                                URL.revokeObjectURL(objectUrl);
                                window.close();

                        });

                }
        );

});
