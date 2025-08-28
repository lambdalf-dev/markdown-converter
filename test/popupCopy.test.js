// test/popupCopy.test.js
describe('Copy to Clipboard button', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="convertBtn"></button>
      <button id="downloadBtn" disabled></button>
      <button id="copyBtn" disabled></button>
      <div id="status"></div>
      <div id="progress"><div id="progressFill"></div></div>
      <div id="result"><p id="resultText"></p></div>
    `;

    // Mock chrome APIs
    global.chrome = {
      tabs: {
        query: jest.fn().mockResolvedValue([{ id: 321 }]),
        sendMessage: jest.fn().mockResolvedValue({
          success: true,
          markdown: '# Title\n\nThis is test content',
          filename: 'title-2025-08-28.md',
          title: 'Test Page'
        })
      },
      downloads: { download: jest.fn().mockResolvedValue(42) },
    };

    // Mock clipboard
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: { writeText: jest.fn().mockResolvedValue() }
      },
      writable: true
    });

    jest.isolateModules(() => {
      require('../popup/popup.js');
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  test('copy button stays disabled until conversion, then copies markdown', async () => {
    const copyBtn = document.getElementById('copyBtn');
    expect(copyBtn.disabled).toBe(true);

    // Trigger conversion
    document.getElementById('convertBtn').click();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(copyBtn.disabled).toBe(false);

    // Click copy
    copyBtn.click();
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# Title\n\nThis is test content');
  });

  test('copy button shows feedback when copying', async () => {
    const copyBtn = document.getElementById('copyBtn');
    
    // Trigger conversion first
    document.getElementById('convertBtn').click();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Click copy
    copyBtn.click();
    await Promise.resolve();

    expect(copyBtn.textContent).toBe('Copied!');
  });

  test('copy button handles errors gracefully', async () => {
    // Mock clipboard failure
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: { writeText: jest.fn().mockRejectedValue(new Error('Clipboard error')) }
      },
      writable: true
    });
    
    const copyBtn = document.getElementById('copyBtn');
    
    // Trigger conversion first
    document.getElementById('convertBtn').click();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Click copy
    copyBtn.click();
    await Promise.resolve();

    expect(copyBtn.textContent).toBe('Copy failed');
  });

  test('both buttons are enabled after successful conversion', async () => {
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    expect(copyBtn.disabled).toBe(true);
    expect(downloadBtn.disabled).toBe(true);

    // Trigger conversion
    document.getElementById('convertBtn').click();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(copyBtn.disabled).toBe(false);
    expect(downloadBtn.disabled).toBe(false);
  });
});
