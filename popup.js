document.addEventListener("DOMContentLoaded", function () {
    // --- Elements ---
    const elements = {
        skillsInput: document.getElementById("skillsInput"),
        tagContainer: document.getElementById("tagContainer"),
        saveSkillsButton: document.getElementById("saveSkills"),
        fillSkillsButton: document.getElementById("fillSkills"),
        statusMessage: document.getElementById("statusMessage"),
        profileSelect: document.getElementById("profileSelect"),
        addProfileBtn: document.getElementById("addProfileBtn"),
        deleteProfileBtn: document.getElementById("deleteProfileBtn"),
        smartPasteBtn: document.getElementById("smartPasteBtn"),
        skillCount: document.getElementById("skillCount")
    };

    // --- State ---
    let state = {
        profiles: { "Default": [] },
        currentProfile: "Default"
    };

    // --- Initialization ---
    init();

    function init() {
        chrome.storage.local.get(["skills", "profiles", "currentProfile"], function (result) {
            // Data Migration: If old 'skills' exist but no 'profiles', migrate them.
            if (result.skills && !result.profiles) {
                state.profiles = { "Default": result.skills };
                saveState(); // Save the migrated structure immediately
            } else if (result.profiles) {
                state.profiles = result.profiles;
                state.currentProfile = result.currentProfile || "Default";
            }

            renderProfileOptions();
            renderTags();
        });
    }

    // --- Core Logic ---

    function getCurrentTags() {
        return state.profiles[state.currentProfile] || [];
    }

    function updateCurrentTags(newTags) {
        state.profiles[state.currentProfile] = newTags;
        updateCount();
    }

    function saveState() {
        chrome.storage.local.set({
            profiles: state.profiles,
            currentProfile: state.currentProfile,
            skills: getCurrentTags() // meaningful fallback for basic content scripts
        }, () => {
            // Optional: feedback
        });
    }

    // --- UI Rendering ---

    function renderProfileOptions() {
        elements.profileSelect.innerHTML = "";
        Object.keys(state.profiles).forEach(profileName => {
            const option = document.createElement("option");
            option.value = profileName;
            option.textContent = profileName;
            if (profileName === state.currentProfile) option.selected = true;
            elements.profileSelect.appendChild(option);
        });
        updateCount();
    }

    function renderTags() {
        const tags = getCurrentTags();

        // Clear current tags except input
        const renderedTags = elements.tagContainer.querySelectorAll(".tag");
        renderedTags.forEach(tag => tag.remove());

        // Insert tags
        tags.slice().reverse().forEach(tag => {
            elements.tagContainer.insertBefore(createTagElement(tag), elements.skillsInput);
        });
        updateCount();
    }

    function createTagElement(label) {
        const div = document.createElement("div");
        div.className = "tag";

        const span = document.createElement("span");
        span.textContent = label;

        const closeBtn = document.createElement("i");
        closeBtn.className = "remove-tag";
        closeBtn.innerHTML = "×";
        closeBtn.onclick = function () {
            const tags = getCurrentTags();
            const index = tags.indexOf(label);
            if (index > -1) {
                tags.splice(index, 1);
                updateCurrentTags(tags);
                renderTags();
                saveState(); // Auto-save on modification
            }
        };

        div.appendChild(span);
        div.appendChild(closeBtn);
        return div;
    }

    function updateCount() {
        const count = getCurrentTags().length;
        elements.skillCount.textContent = `${count} skill${count !== 1 ? 's' : ''}`;
    }

    function showStatus(msg, type = "success") {
        elements.statusMessage.textContent = msg;
        elements.statusMessage.className = "status-message visible";
        if (type === "error") elements.statusMessage.style.color = "#ff5252";
        else elements.statusMessage.style.color = "#00baa1";

        setTimeout(() => {
            elements.statusMessage.classList.remove("visible");
        }, 2000);
    }

    // --- Profile Management ---

    elements.profileSelect.addEventListener("change", (e) => {
        state.currentProfile = e.target.value;
        saveState();
        renderTags();
    });

    elements.addProfileBtn.addEventListener("click", () => {
        const name = prompt("Enter new profile name:");
        if (name && !state.profiles[name]) {
            state.profiles[name] = [];
            state.currentProfile = name;
            saveState();
            renderProfileOptions();
            renderTags();
            showStatus(`Profile '${name}' created!`);
        } else if (name) {
            alert("Profile already exists!");
        }
    });

    elements.deleteProfileBtn.addEventListener("click", () => {
        if (Object.keys(state.profiles).length <= 1) {
            alert("Cannot delete the last profile.");
            return;
        }

        if (confirm(`Delete profile '${state.currentProfile}'?`)) {
            delete state.profiles[state.currentProfile];
            state.currentProfile = Object.keys(state.profiles)[0];
            saveState();
            renderProfileOptions();
            renderTags();
            showStatus("Profile deleted.");
        }
    });

    // --- Smart Paste ---

    elements.smartPasteBtn.addEventListener("click", () => {
        // Create a simple overlay for pasting content
        const overlay = document.createElement('div');
        overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100;";

        const modal = document.createElement('div');
        modal.style = "background:white;padding:20px;border-radius:8px;width:80%;max-width:300px;display:flex;flex-direction:column;gap:10px;";

        const title = document.createElement('h3');
        title.innerText = "Paste Resume Skills";
        title.style = "margin:0;font-size:16px;";

        const textarea = document.createElement('textarea');
        textarea.placeholder = "Paste your skills section here...";
        textarea.style = "height:100px;resize:none;padding:8px;border:1px solid #ddd;border-radius:4px;";

        const btnRow = document.createElement('div');
        btnRow.style = "display:flex;justify-content:flex-end;gap:8px;";

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = "Cancel";
        cancelBtn.className = "btn secondary";
        cancelBtn.onclick = () => document.body.removeChild(overlay);

        const parseBtn = document.createElement('button');
        parseBtn.innerText = "Add Skills";
        parseBtn.className = "btn primary";

        parseBtn.onclick = () => {
            const text = textarea.value;
            if (text) {
                parseAndAddSkills(text);
            }
            document.body.removeChild(overlay);
        };

        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(parseBtn);
        modal.appendChild(title);
        modal.appendChild(textarea);
        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        textarea.focus();
    });

    function parseAndAddSkills(text) {
        // Pre-process: Replace " - " (bullet-style dash) with a distinct separator (newline)
        // This preserves "Scikit-Learn" (no spaces) but splits "Java - Expert"
        let processed = text.replace(/\s-\s/g, "\n");

        // Split by: \n, comma, bullet(•), star(*), pipe(|), parens(), colon(:)
        const rawItems = processed.split(/[\n,•*|():]+/);

        let newCount = 0;
        const currentTags = getCurrentTags();

        rawItems.forEach(item => {
            const clean = item.trim();
            // Filter junk: empty, too long (sentences), or already exists, or is "Skills" label
            if (clean && clean.length < 40 && !currentTags.includes(clean) && clean.toLowerCase() !== "skills") {
                currentTags.push(clean);
                newCount++;
            }
        });

        if (newCount > 0) {
            updateCurrentTags(currentTags);
            renderTags();
            saveState();
            showStatus(`Added ${newCount} skills!`);
        } else {
            showStatus("No new skills found.", "error");
        }
    }

    // --- Input Handling ---

    elements.skillsInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = elements.skillsInput.value.trim();
            if (val) {
                parseAndAddSkills(val);
                elements.skillsInput.value = "";
            }
        } else if (e.key === "Backspace" && elements.skillsInput.value === "" && getCurrentTags().length > 0) {
            const tags = getCurrentTags();
            tags.pop();
            updateCurrentTags(tags);
            renderTags();
            saveState();
        }
    });

    elements.tagContainer.addEventListener("click", () => elements.skillsInput.focus());

    // --- Actions ---

    elements.saveSkillsButton.addEventListener("click", function () {
        saveState();
        showStatus("✅ Skills saved!");
    });

    elements.fillSkillsButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) return;

            // Just ensure latest state is saved before running
            saveState();

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"]
            }, () => {
                if (chrome.runtime.lastError) {
                    showStatus("❌ Failed to inject.", "error");
                } else {
                    showStatus("⚡ Autofill started!");
                }
            });
        });
    });
});
