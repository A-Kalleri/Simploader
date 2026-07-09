// Hidden file input used to select the .sld/.htld file
const fileInput = document.getElementById("fileinput");

// Get parameters passed from adder.html?windowId=...
const params = new URLSearchParams(location.search);

// Window we want to read tabs from
const windowId =
        Number(params.get("windowId"));

// Default output filename
let fileName = "session.sld";

// Open file picker on first click anywhere in the page
document.addEventListener("click", () => {

        fileInput.value = "";
        fileInput.click();

}, { once: true });

// Fired when a file is selected
fileInput.onchange = async (e) => {

        const file = e.target.files[0];

        // User cancelled selection
        if (!file) {
                window.close();
                return;
        }

        // Reuse original filename
        fileName = file.name;

        try {

                // -------------------------
                // 1. Read encrypted file
                // -------------------------
                const buffer = await file.arrayBuffer();
                const data = new Uint8Array(buffer);

                // -------------------------
                // 2. Decrypt (XOR 31)
                // -------------------------
                for (let i = 0; i < data.length; i++) {
                        data[i] ^= 31;
                }

                // -------------------------
                // 3. Convert to text
                // -------------------------
                const text =
                        new TextDecoder().decode(data);

                // -------------------------
                // 4. Extract HTTPS URLs
                // -------------------------
                const fileUrls = text
                        .split("\n")
                        .map(url => url.trim())
                        .filter(url =>
                                url.startsWith("https://")
                        );

                // -------------------------
                // 5. Get tabs from target window
                // -------------------------
                chrome.tabs.query(
                        { windowId: windowId },
                        (tabs) => {

                                // -------------------------
                                // 6. Extract HTTPS URLs
                                // -------------------------
                                const currentUrls = tabs
                                        .map(tab => tab.url)
                                        .filter(url =>
                                                url &&
                                                url.startsWith("https://")
                                        );

                                // -------------------------
                                // 7. Merge and remove duplicates
                                // -------------------------
                                const merged = [
                                        ...new Set([
                                                ...fileUrls,
                                                ...currentUrls
                                        ])
                                ];

                                // -------------------------
                                // 8. Convert back to text
                                // -------------------------
                                const output =
                                        merged.join("\n");

                                // -------------------------
                                // 9. Encode text
                                // -------------------------
                                const encoded =
                                        new TextEncoder()
                                        .encode(output);

                                // -------------------------
                                // 10. Encrypt (XOR 31)
                                // -------------------------
                                for (let i = 0; i < encoded.length; i++) {
                                        encoded[i] ^= 31;
                                }

                                // -------------------------
                                // 11. Create downloadable file
                                // -------------------------
                                const blob = new Blob(
                                        [encoded],
                                        {
                                                type:
                                                "application/octet-stream"
                                        }
                                );

                                const objectUrl =
                                        URL.createObjectURL(blob);

                                // -------------------------
                                // 12. Save merged session
                                // -------------------------
                                chrome.downloads.download({
                                        url: objectUrl,
                                        filename: fileName,
                                        saveAs: true
                                }, () => {

                                        // Cleanup temporary URL
                                        URL.revokeObjectURL(
                                                objectUrl
                                        );

                                        // Close adder tab
                                        window.close();

                                });

                        }
                );

        } catch (err) {

                console.error(err);

                alert("Failed to merge file");

                window.close();
        }

};
