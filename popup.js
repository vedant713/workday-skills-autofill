document.addEventListener("DOMContentLoaded", function () {
    const skillsInput = document.getElementById("skillsInput");
    const saveSkillsButton = document.getElementById("saveSkills");
    const fillSkillsButton = document.getElementById("fillSkills");

    // Load saved skills
    chrome.storage.local.get(["skills"], function (result) {
        if (result.skills) {
            skillsInput.value = result.skills.join(", ");
        }
    });

    // Save skills
    saveSkillsButton.addEventListener("click", function () {
        const skills = skillsInput.value.split(",").map(skill => skill.trim());
        chrome.storage.local.set({ skills: skills }, function () {
            alert("✅ Skills saved successfully!");
        });
    });

    // Autofill Workday skills section
    fillSkillsButton.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ["content.js"]
                }, () => {
                    console.log("✅ Content script executed.");
                });
            }
        });
    });
});
