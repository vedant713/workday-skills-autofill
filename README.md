# 🚀 Workday Skills Autofill 2.0

**Tired of manually typing your skills into Workday 100 times?**
Workday Skills Autofill is a powerful Chrome extension that automates the tedious process of adding skills to Workday applications.

It now features **Smart Resume Parsing**, **Job Matching (Gap Analysis)**, and **Multiple Profiles** management.

![Workday Extension Promo](https://via.placeholder.com/800x400?text=Workday+Skills+Autofill+2.0)

## ✨ New in Version 2.0
- **🔍 Job Match Scanner**: Scans job descriptions and suggests missing skills to add. includes **"Add All"** button!
- **📋 Smart Paste**: Paste your entire resume skills section; it automatically detects and adds them.
- **📂 Multiple Profiles**: Switch between "Software Engineer", "Product Manager", or "Data Science" skill sets instantly.
- **🌙 Dark Mode**: Easy on the eyes for late-night applying.
- **⚡ Keyboard Shortcut**: `Alt + Shift + F` to autofill instantly.
- **💾 Import/Export**: Backup your profiles and share them between devices.

---

## 🛠️ Features
- **Autofill Workday**: Automatically types, selects from dropdowns, and confirms skills in the Workday UI.
- **Tag-Based Input**: Add, remove, and manage skills easily with a modern UI.
- **Right-Click to Add**: Highlight text on any page -> Right Click -> "Add to Workday Skills".
- **Local Storage**: Your data stays on your machine. No cloud, no tracking.

## 📥 Installation

1.  **Clone or Download** this repository.
    ```bash
    git clone https://github.com/vedant713/workday-skills-autofill.git
    ```
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer Mode** (toggle in the top right corner).
4.  Click **Load unpacked**.
5.  Select the folder where you downloaded this repository.
6.  The extension is now installed! 📌 Pin it to your toolbar for easy access.

---

## 📖 Usage Guide

### 1. Managing Skills
- Open the extension popup.
- Type a skill and press **Enter** or **Comma**.
- Or, use **Smart Paste** to paste a list from your resume.
- **Profiles**: Use the dropdown and `+` button to create separate lists for different job roles.

### 2. Autofilling on Workday
1.  Navigate to a Workday job application page (specifically the **Skills** section).
2.  Click the extension icon.
3.  Click **"Autofill Workday"**.
4.  Sit back and watch it type and select your skills automatically! 🪄
    - *Pro Tip:* Use `Alt + Shift + F` (Mac: `Option + Shift + F`) to trigger it without opening the popup.

### 3. Job Match Scanner (Gap Analysis)
1.  While viewing a Job Description, open the extension.
2.  Click **"🔍 Scan Job"**.
3.  The extension will analyze the page for keywords.
4.  It will show you **Missing Skills** that are in the job description but *not* in your profile.
5.  Click **"Add All"** to instantly add them to your list.

---

## ⌨️ Shortcuts
| Action | Shortcut (Win/Linux) | Shortcut (Mac) |
| :--- | :--- | :--- |
| **Autofill Skills** | `Alt + Shift + F` | `Option + Shift + F` |

---

## 🔒 Privacy
This extension runs **locally** on your browser.
- No data is sent to any external server.
- Your skills are stored in your browser's `chrome.storage.local`.

## 🤝 Contribution
Found a bug? Want a new feature?
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature-cool-thing`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## 📄 License
MIT License. Free to use and modify.
