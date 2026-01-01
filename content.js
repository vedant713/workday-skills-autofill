(async function () {
    console.log("🚀 Workday Skills Autofill initiated...");

    /**
     * Reads skills from Chrome local storage.
     * @returns {Promise<string[]>}
     */
    function getStoredSkills() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["skills"], (result) => {
                resolve(result.skills || []);
            });
        });
    }

    /**
     * Pauses execution for a set time.
     * @param {number} ms 
     */
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    /**
     * Simulates human-like typing into an input element.
     * @param {HTMLElement} element 
     * @param {string} text 
     */
    async function simulateTyping(element, text) {
        element.focus();
        element.value = "";

        // Type characters
        for (let char of text) {
            element.value += char;
            element.dispatchEvent(new Event("input", { bubbles: true }));
            element.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
            element.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true }));
            element.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));
            await delay(50 + Math.random() * 50); // Random typing speed
        }

        element.dispatchEvent(new Event("change", { bubbles: true }));
        await delay(300);

        // Simulate pressing Enter to trigger search/dropdown
        console.log(`🔹 Pressing 'Enter' for: ${text}`);
        element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        element.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
        await delay(800);
    }

    /**
     * Waits for the dropdown options to appear and selects the matching one.
     * @param {string} skillName 
     * @returns {Promise<boolean>} success
     */
    async function selectFromDropdown(skillName) {
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            // Workday dropdowns usually have role='listbox' or similar, options have role='option'
            // Searching broadly for likely candidates including standard ul/li
            const options = document.querySelectorAll("[role='option'], ul[role='listbox'] li, .dropdown div, li[data-automation-id='promptOption']");

            if (options.length > 0) {
                // Try to find exact or close match
                const match = Array.from(options).find(opt =>
                    opt.textContent.toLowerCase().includes(skillName.toLowerCase())
                );

                if (match) {
                    console.log(`✅ Found option: "${match.textContent}". Clicking...`);
                    match.click();
                    match.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                    match.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
                    return true;
                }

                // If options exist but no match, maybe try the first one if it's a generic "Search for..." (use caution)
                // For now, we only click if we match text to avoid bad fills
            }

            attempts++;
            await delay(500);
        }

        console.warn(`⚠️ Dropdown option not found for: ${skillName}`);
        return false;
    }

    /**
     * Checks if the checkbox panel appears and clicks it to confirm selection.
     * (Workday specific behavior where selecting from dropdown sometimes opens a secondary checkbox)
     */
    async function confirmSelection() {
        await delay(500);
        const checkbox = document.querySelector("[data-automation-id='checkboxPanel']");
        if (checkbox) {
            const isChecked = checkbox.getAttribute("aria-checked") === "true";
            if (!isChecked) {
                console.log("🔲 Clicking confirmation checkbox...");
                checkbox.click();
                await delay(300);
            } else {
                console.log("✅ Already checked.");
            }
        }
    }

    // --- Main Logic ---

    const skills = await getStoredSkills();
    if (skills.length === 0) {
        console.warn("❌ No skills found in storage. Please add skills via the extension popup.");
        return;
    }

    console.log(`📋 Found ${skills.length} skills to add:`, skills);

    // Find the main input
    const searchInput = document.querySelector("[data-automation-id='searchBox'], input[placeholder*='Search'], input[id*='skill']");

    if (!searchInput) {
        console.error("❌ Workday skills search input not found. Make sure you are on the correct page.");
        return;
    }

    for (const skill of skills) {
        // Check if already added (simple check)
        const currentChips = Array.from(document.querySelectorAll("[data-automation-id='selectedItem'], .chip, [aria-label]"));
        const alreadyExists = currentChips.some(chip => chip.textContent.toLowerCase().includes(skill.toLowerCase()) || chip.ariaLabel?.toLowerCase().includes(skill.toLowerCase()));

        if (alreadyExists) {
            console.log(`⏭️ Skill "${skill}" already exists. Skipping.`);
            continue;
        }

        console.log(`🔍 Processing: ${skill}`);
        await simulateTyping(searchInput, skill);

        const selected = await selectFromDropdown(skill);
        if (selected) {
            await confirmSelection();

            // Clear input for next item if needed (sometimes Workday does this automatically)
            // searchInput.value = ""; 
            await delay(1000);
        } else {
            console.warn(`❌ Failed to add: ${skill}`);
            searchInput.value = ""; // Reset for next try
        }
    }

    console.log("🎉 Autofill sequence complete!");

})();
