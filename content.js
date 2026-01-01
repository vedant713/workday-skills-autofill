chrome.storage.local.get(["skills"], function (result) {
    if (result.skills && result.skills.length > 0) {
        let skillsToAdd = result.skills;
        let inputField = document.querySelector("[data-automation-id='searchBox']"); // Use correct input field

        if (!inputField) {
            console.error("❌ Workday skills input field not found!");
            return;
        }

        function simulateTyping(element, text, callback) {
            let i = 0;
            element.focus();
            element.value = ""; // Clear the input field

            function typeCharacter() {
                if (i < text.length) {
                    element.value += text[i];

                    // Trigger necessary events
                    element.dispatchEvent(new Event("input", { bubbles: true }));
                    element.dispatchEvent(new Event("change", { bubbles: true }));
                    element.dispatchEvent(new KeyboardEvent("keydown", { key: text[i], bubbles: true }));
                    element.dispatchEvent(new KeyboardEvent("keyup", { key: text[i], bubbles: true }));

                    i++;
                    setTimeout(typeCharacter, 100);
                } else {
                    setTimeout(() => {
                        console.log(`🔹 Pressing 'ArrowDown' and 'Enter' for: ${text}`);
                        element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
                        element.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));

                        setTimeout(() => {
                            element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
                            element.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
                            setTimeout(callback, 1500);
                        }, 500);
                    }, 500);
                }
            }
            typeCharacter();
        }

        chrome.storage.local.get(["skills"], function (result) {
            if (result.skills && result.skills.length > 0) {
                let skillsToAdd = result.skills;
                let inputField = document.querySelector("[data-automation-id='searchBox']"); // Use correct input field
        
                if (!inputField) {
                    console.error("❌ Workday skills input field not found!");
                    return;
                }
        
                function simulateTyping(element, text, callback) {
                    let i = 0;
                    element.focus();
                    element.value = ""; // Clear the input field
        
                    function typeCharacter() {
                        if (i < text.length) {
                            element.value += text[i];
        
                            // Trigger necessary events
                            element.dispatchEvent(new Event("input", { bubbles: true }));
                            element.dispatchEvent(new Event("change", { bubbles: true }));
                            element.dispatchEvent(new KeyboardEvent("keydown", { key: text[i], bubbles: true }));
                            element.dispatchEvent(new KeyboardEvent("keyup", { key: text[i], bubbles: true }));
        
                            i++;
                            setTimeout(typeCharacter, 100);
                        } else {
                            setTimeout(() => {
                                console.log(`🔹 Pressing 'ArrowDown' and 'Enter' for: ${text}`);
                                element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
                                element.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));
        
                                setTimeout(() => {
                                    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
                                    element.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
                                    setTimeout(callback, 1500);
                                }, 500);
                            }, 500);
                        }
                    }
                    typeCharacter();
                }
        
                function waitForDropdown(skill, callback) {
                    let attempts = 0;
                    let maxAttempts = 5;
                
                    function checkDropdown() {
                        let dropdownOptions = document.querySelectorAll("[role='option'], ul li");
                        let checkbox = document.querySelector("[data-automation-id='checkboxPanel']");
                        let isChecked = checkbox && checkbox.getAttribute("aria-checked") === "true"; // ✅ Check if it's already selected
                
                        if (dropdownOptions.length > 0) {
                            console.log(`✅ Found dropdown options for: ${skill}`);
                            dropdownOptions[0].click(); // Click the first dropdown item
                
                            setTimeout(() => {
                                if (checkbox && !isChecked) { // 🔥 Click only if not already checked
                                    console.log(`🔲 Clicking checkbox for: ${skill}`);
                                    checkbox.click();
                                } else if (isChecked) {
                                    console.log(`✅ Checkbox for ${skill} is already selected. Skipping click.`);
                                } else {
                                    console.warn(`⚠️ Checkbox not found for: ${skill}. Trying again...`);
                                }
                
                                setTimeout(callback, 800); // 🔥 Reduce delay to 800ms for speed
                            }, 500);
                        } else if (attempts < maxAttempts) {
                            console.warn(`⚠️ No dropdown options yet for: ${skill}. Retrying (${attempts + 1}/${maxAttempts})...`);
                            attempts++;
                            setTimeout(checkDropdown, 500);
                        } else {
                            console.error(`❌ Dropdown did not appear for: ${skill}`);
                            setTimeout(callback, 800);
                        }
                    }
                
                    checkDropdown();
                }
        
                function addSkill(skill, callback) {
                    console.log(`🔍 Typing skill: ${skill}`);
                    inputField.focus();
                    simulateTyping(inputField, skill, function () {
                        waitForDropdown(skill, function () {
                            let selectedSkills = document.querySelectorAll("[aria-label]");
                            let added = Array.from(selectedSkills).some(item =>
                                item.textContent.toLowerCase().includes(skill.toLowerCase())
                            );
        
                            if (added) {
                                console.log(`🎉 Successfully added: ${skill}`);
                            } else {
                                console.warn(`⚠️ Skill may not have been added correctly: ${skill}`);
                            }
        
                            setTimeout(callback, 1000);
                        });
                    });
                }
        
                function addSkillsSequentially(index = 0) {
                    if (index < skillsToAdd.length) {
                        addSkill(skillsToAdd[index], () => addSkillsSequentially(index + 1));
                    } else {
                        console.log("🎉 All skills added successfully!");
                    }
                }
        
                addSkillsSequentially();
            } else {
                console.error("❌ No skills found in storage.");
            }
        });
        

        function addSkill(skill, callback) {
            console.log(`🔍 Typing skill: ${skill}`);
            inputField.focus();
            simulateTyping(inputField, skill, function () {
                waitForDropdown(skill, function () {
                    let selectedSkills = document.querySelectorAll("[aria-label]");
                    let added = Array.from(selectedSkills).some(item =>
                        item.textContent.toLowerCase().includes(skill.toLowerCase())
                    );

                    if (added) {
                        console.log(`🎉 Successfully added: ${skill}`);
                    } else {
                        console.warn(`⚠️ Skill may not have been added correctly: ${skill}`);
                    }

                    setTimeout(callback, 1000);
                });
            });
        }

        function addSkillsSequentially(index = 0) {
            if (index < skillsToAdd.length) {
                addSkill(skillsToAdd[index], () => addSkillsSequentially(index + 1));
            } else {
                console.log("🎉 All skills added successfully!");
            }
        }

        addSkillsSequentially();
    } else {
        console.error("❌ No skills found in storage.");
    }
});
