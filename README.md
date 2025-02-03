# Workday Skills Autofill

## Description
Workday Skills Autofill is a Chrome extension that allows users to automatically fill the Workday skills section with predefined skills. This helps users save time when updating their Workday profiles.

## Features
- Save a list of skills locally.
- Autofill the skills section in Workday with a single click.
- Simulates typing and selection to ensure accuracy.
- Uses Chrome storage API to persist skills data.

## Installation
1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top right corner).
4. Click **Load unpacked** and select the extracted folder.
5. The extension will now be installed and ready to use.

## Usage
1. Click on the extension icon to open the popup.
2. Enter skills in the input box (comma-separated).
3. Click **Save Skills** to store the skills.
4. Navigate to the Workday skills section.
5. Click **Autofill Workday** to automatically fill in the skills.

## File Structure
```
workday-skills-autofill/
│── manifest.json          # Chrome Extension Manifest
│── popup.html             # Extension popup UI
│── popup.js               # Handles popup interactions
│── content.js             # Runs on Workday to autofill skills
│── background.js          # Handles installation and background tasks
│── styles.css             # Styles for the popup UI
```

## Permissions Used
- `storage`: To store user-inputted skills locally.
- `scripting`: To inject scripts for autofilling skills.
- `activeTab`: To access Workday pages dynamically.
- `host_permissions`: To run the script on Workday domains.

## Technologies Used
- JavaScript (Chrome Extensions API)
- HTML & CSS (Popup UI)

## Notes
- This extension only works on Workday domains (`https://*.workday.com/*`).
- Ensure that the Workday skills section is open before clicking **Autofill Workday**.
- The script simulates user input to ensure skills are added properly.

## Contribution
If you’d like to improve this extension, feel free to fork the repo and submit a pull request.

## License
This project is open-source and available under the MIT License.
