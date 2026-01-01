chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-skill",
        title: "Add '%s' to Workday Skills",
        contexts: ["selection"]
    });

    // Magic Wand: Fill any input
    chrome.contextMenus.create({
        id: "fill-skills",
        title: "🪄 Fill with Skills",
        contexts: ["editable"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // 1. Add Selection to Profile
    if (info.menuItemId === "add-skill" && info.selectionText) {
        const text = info.selectionText.trim();
        if (!text) return;

        chrome.storage.local.get(["profiles", "currentProfile"], (result) => {
            const profiles = result.profiles || { "Default": [] };
            const currentProfile = result.currentProfile || "Default";
            const currentTags = profiles[currentProfile] || [];
            const newItems = text.split(/,\s*/);

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
                    console.log(`Added ${count} skills to profile '${currentProfile}'`);
                });
            }
        });
    }

    // 2. Magic Wand: Fill Input
    if (info.menuItemId === "fill-skills") {
        chrome.storage.local.get(["profiles", "currentProfile"], (result) => {
            const profiles = result.profiles || { "Default": [] };
            const currentProfile = result.currentProfile || "Default";
            const skills = profiles[currentProfile] || [];

            if (skills.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: async (skillsToFill) => {
                        const el = document.activeElement;
                        if (!el || !(el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
                            alert("Please right-click precisely on the text box!");
                            return;
                        }

                        const delay = (ms) => new Promise(res => setTimeout(res, ms));

                        for (const skill of skillsToFill) {
                            el.focus(); // Ensure focus stays

                            // 1. Set Value
                            if (el.value !== undefined) el.value = skill;
                            else el.innerText = skill;

                            // 2. Trigger Input Events (wait for React to react)
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            await delay(150);

                            // 3. Simulate Enter Key (Press down, press, up)
                            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
                            el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', bubbles: true }));
                            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));

                            // 4. Wait SIGNIFICANTLY for the tag to process and input to clear
                            await delay(800);
                        }
                    },
                    args: [skills]
                });
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => alert("Your current profile has no skills to fill! Add some first.")
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
