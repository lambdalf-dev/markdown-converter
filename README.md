# Web Crawler - Markdown Converter

A Chrome extension that converts web pages to downloadable markdown format.

## Features

- Convert any webpage to clean markdown
- Intelligent content filtering to remove navigation, ads, and UI elements
- Automatic filename generation based on page title
- One-click download functionality
- Works on all websites

## Installation (Development)

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `markdown-converter` folder

## Chrome Web Store Deployment

### Prerequisites
- Google Developer Account ($5 one-time fee)
- Chrome Web Store Developer Dashboard access

### Steps to Deploy

1. **Prepare the Extension**
   - Ensure all files are production-ready
   - Remove any debug code or development references
   - Test thoroughly on various websites

2. **Create a ZIP File**
   ```bash
   cd markdown-converter
   zip -r ../markdown-converter.zip . -x "*.git*" "*.DS_Store*" "*.md" "test/*" "utils/*"
   ```

3. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Click "Add new item"
   - Upload your ZIP file
   - Fill in store listing details:
     - **App name**: Web Crawler - Markdown Converter
     - **Short description**: Convert web pages to clean markdown format
     - **Detailed description**: [See detailed description below]
     - **Category**: Productivity
     - **Language**: English
     - **Screenshots**: Take screenshots of the extension in action
     - **Icon**: Use the existing icon-16.png (resize to 128x128 for store)

4. **Store Listing Details**

   **Detailed Description:**
   ```
   Transform any webpage into clean, readable markdown with just one click!
   
   Features:
   • Intelligent content extraction that focuses on main content
   • Automatic removal of navigation, ads, and UI elements
   • Clean markdown output optimized for readability
   • Works on all websites including complex applications
   • Instant download with automatic filename generation
   
   Perfect for:
   • Researchers saving articles and documentation
   • Content creators gathering reference materials
   • Students archiving study resources
   • Anyone who needs clean, portable web content
   
   Simply navigate to any webpage, click the extension icon, and download your markdown file. No complex setup required!
   ```

5. **Privacy Policy**
   - Create a simple privacy policy stating the extension doesn't collect or store user data
   - All processing happens locally in the browser

6. **Submit for Review**
   - Review all information carefully
   - Submit for Google's review process
   - Typical review time: 1-3 business days

## Development

### Project Structure
```
markdown-converter/
├── manifest.json          # Extension configuration
├── popup/                 # Extension popup interface
├── content/               # Content script for page processing
├── background/            # Background service worker
├── assets/                # Icons and images
├── LICENSE                # The  MIT license agreement
├── PRIVACY_POLICY.md      # The privacy policy
└── README.md              # This file
```

### Testing
- Test on various website types (news, social media, documentation)
- Verify markdown output quality
- Ensure download functionality works correctly

## License

MIT

## Support

Lambdalf the White <lambdalf.dev@gmail.com>
