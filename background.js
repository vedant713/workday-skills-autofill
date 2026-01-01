chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-skill",
        title: "Add '%s' to Workday Skills",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "add-skill" && info.selectionText) {
        const text = info.selectionText.trim();
        if (!text) return;

        chrome.storage.local.get(["profiles", "currentProfile"], (result) => {
            const profiles = result.profiles || { "Default": [] };
            const currentProfile = result.currentProfile || "Default";
            const currentTags = profiles[currentProfile] || [];

            // Simple "Smart Paste" lite: Split by commas if present, otherwise treat as one
            // We won't do the full regex heavy lifting here to avoid duplicating too much logic,
            // but handling "Java, Python" selection is nice.
            const newItems = text.split(/,\s*/); // Split by comma + optional space

            let count = 0;
            newItems.forEach(item => {
                const clean = item.trim();
                if (clean && !currentTags.includes(clean) && clean.length < 50) {
                    currentTags.push(clean);
                    count++;
                }
            });

            if (count > 0) {
                profiles[currentProfile] = currentTags;
                chrome.storage.local.set({ profiles: profiles }, () => {
                    // Optional: We could badge the icon or send a message
                    console.log(`Added ${count} skills to profile '${currentProfile}'`);
                });
            }
        });
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "autofill-skills") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;
            const tabId = tabs[0].id;

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Autofill invocation failed:", chrome.runtime.lastError);
                } else {
                    chrome.tabs.sendMessage(tabId, { action: "AUTOFILL" });
                    console.log("Autofill triggered via shortcut!");
                }
            });
        });
    }
});
