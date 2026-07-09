const typeBtn = document.getElementById("type");
const windowBtn = document.getElementById("window");
const loadBtn = document.getElementById("load");
const addBtn = document.getElementById("add");
const saveBtn = document.getElementById("save");

let incognito = true;
let newWindow = true;

typeBtn.onclick = () => {
        incognito = !incognito;
        typeBtn.textContent = incognito ? "Incognito" : "Normal";
};

windowBtn.onclick = () => {
        newWindow = !newWindow;
        windowBtn.textContent = newWindow ? "New Window" : "This Window";
};

loadBtn.onclick = () => {
        chrome.windows.getCurrent(win => {
                chrome.tabs.create({
                        url: chrome.runtime.getURL(`loader.html?incognito=${incognito}&newWindow=${newWindow}&windowId=${win.id}`)
                });
        });
};

saveBtn.onclick = () => {
        chrome.windows.getCurrent((win) => {
                chrome.tabs.create({
                        url: chrome.runtime.getURL(`saver.html?windowId=${win.id}`)
                });
        });
};

addBtn.onclick = () => {
        chrome.windows.getCurrent((win) => {
                chrome.tabs.create({
                        url: chrome.runtime.getURL(`adder.html?windowId=${win.id}`)
                });
        });
};

