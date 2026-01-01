document.addEventListener("DOMContentLoaded", function () {
    const skillsInput = document.getElementById("skillsInput");
    const tagContainer = document.getElementById("tagContainer");
    const saveSkillsButton = document.getElementById("saveSkills");
    const fillSkillsButton = document.getElementById("fillSkills");
    const statusMessage = document.getElementById("statusMessage");

    let tags = [];

    // Load saved skills
    chrome.storage.local.get(["skills"], function (result) {
        if (result.skills) {
            tags = result.skills;
            renderTags();
        }
    });

    // Helper: Create Tag Element
    function createTagElement(label) {
        const div = document.createElement("div");
        div.setAttribute("class", "tag");
        
        const span = document.createElement("span");
        span.innerHTML = label;
        
        const closeBtn = document.createElement("i");
        closeBtn.setAttribute("class", "remove-tag");
        closeBtn.innerHTML = "×";
        closeBtn.onclick = function() {
            const index = tags.indexOf(label);
            if (index > -1) {
                tags.splice(index, 1);
                renderTags();
            }
        };

        div.appendChild(span);
        div.appendChild(closeBtn);
        return div;
    }

    // Helper: Render Tags
    function renderTags() {
        // Clear current tags except the input
        const renderedTags = tagContainer.querySelectorAll(".tag");
        renderedTags.forEach(tag => tag.remove());
        
        // Insert tags before the input
        tags.slice().reverse().forEach(tag => {
           tagContainer.insertBefore(createTagElement(tag), skillsInput);
        });
    }

    // Event: Add Tag
    skillsInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = skillsInput.value.trim();
            if (val && !tags.includes(val)) {
                tags.push(val);
                renderTags();
                skillsInput.value = "";
            }
        } else if (e.key === "Backspace" && skillsInput.value === "" && tags.length > 0) {
            tags.pop();
            renderTags();
        }
    });

    // Event: Focus container focuses input
    tagContainer.addEventListener("click", () => {
        skillsInput.focus();
    });

    // Helper: Show Feedback
    function showStatus(msg, type="success") {
        statusMessage.textContent = msg;
        statusMessage.classList.add("visible");
        setTimeout(() => {
            statusMessage.classList.remove("visible");
        }, 2000);
    }

    // Save skills
    saveSkillsButton.addEventListener("click", function () {
        chrome.storage.local.set({ skills: tags }, function () {
            showStatus("✅ Skills saved!");
        });
    });

    // Autofill Workday skills section
    fillSkillsButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) return;
            
            // Check if we can inject
            const tabId = tabs[0].id;
            const url = tabs[0].url;

            // Optional: Check URL match
            // if (!url.includes("workday.com")) { ... }

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
            }, () => {
                if (chrome.runtime.lastError) {
                    showStatus("❌ Failed to inject script.", "error");
                    console.error(chrome.runtime.lastError);
                } else {
                    showStatus("⚡ Autofill started!");
                    console.log("✅ Content script executed.");
                }
            });
        });
    });
});
