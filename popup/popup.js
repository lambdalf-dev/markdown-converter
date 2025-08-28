// Module-level state for storing conversion results
let lastMarkdown = null;
let lastFilename = null;

document.addEventListener('DOMContentLoaded', function() {
  const convertBtn = document.getElementById('convertBtn');
  const status = document.getElementById('status');
  const progress = document.getElementById('progress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const result = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');

  // Convert button click handler
  convertBtn.addEventListener('click', async function() {
    try {
      // Update UI state
      convertBtn.disabled = true;
      status.innerHTML = '<p>Converting page...</p>';
      progress.style.display = 'block';
      result.style.display = 'none';
      
      // Simulate progress
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += 10;
        progressFill.style.width = progressValue + '%';
        if (progressValue >= 100) {
          clearInterval(progressInterval);
        }
      }, 200);

      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab.');

      // 1) Inject dependencies then the exporter; idempotent per navigation
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: ['utils/contentProcessor.js', 'content/content.js']
      });

      // 2) Call the exported function and capture the result
      const [{ result: conversionResult }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        func: () => {
          if (typeof window.__mdc_convert !== 'function') {
            return { error: '__mdc_convert not found' };
          }
          try { 
            return window.__mdc_convert(); 
          }
          catch (e) { 
            return { error: String(e?.message || e) }; 
          }
        }
      });

      if (!conversionResult || conversionResult.error) {
        throw new Error(conversionResult?.error || 'Conversion failed');
      } 

      // Show success result
      resultText.textContent = `Successfully converted "${conversionResult.title}" to Markdown`;
      result.style.display = 'block';
      status.innerHTML = '<p>Conversion complete!</p>';
      
      // Store the markdown content for download
      window.markdownContent = conversionResult.markdown;
      window.filename = conversionResult.filename;

    } catch (error) {
      console.error('Conversion error:', error);
      status.innerHTML = `<p style="color: #e74c3c;">Error: ${error.message}</p>`;
    } finally {
      // Reset UI state
      convertBtn.disabled = false;
      progress.style.display = 'none';
      progressFill.style.width = '0%';
    }
  });

  // Download button click handler
  downloadBtn.addEventListener('click', function() {
    if (window.markdownContent && window.filename) {
      const blob = new Blob([window.markdownContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      chrome.downloads.download({
        url: url,
        filename: window.filename,
        saveAs: false
      }).then(() => {
        // Clean up the blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      });
    }
  });

  // Copy button click handler
  copyBtn.addEventListener('click', async function() {
    if (!lastMarkdown) return;
    try {
      await navigator.clipboard.writeText(lastMarkdown);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy to Clipboard'), 1200);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => (copyBtn.textContent = 'Copy to Clipboard'), 1500);
    }
  });
});