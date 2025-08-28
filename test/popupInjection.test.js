// test/popupInjection.test.js
// Mocks + DOM setup must come before requiring popup.js
describe('popup.js executeScript shape', () => {
  beforeEach(() => {
    // Minimal popup DOM needed by popup.js
    document.body.innerHTML = `
      <button id="convertBtn"></button>
      <div id="status"></div>
      <div id="progress"><div id="progressFill"></div><div id="progressText"></div></div>
      <div id="result"><p id="resultText"></p><button id="downloadBtn"></button><button id="copyBtn"></button></div>
    `;

    // Mock chrome APIs
    global.chrome = {
      tabs: {
        query: jest.fn().mockResolvedValue([{ id: 123 }]),
      },
      scripting: {
        executeScript: jest.fn((injection) => {
          // First call (files injection): return nothing meaningful
          if (injection.files) return Promise.resolve([{}]);
          // Second call (func call): return conversion result
          if (injection.func) {
            return Promise.resolve([{
              result: { markdown: '# Title', filename: 'title-2025-08-28.md', title: 'Title' }
            }]);
          }
          return Promise.resolve([{}]);
        }),
      },
      downloads: {
        download: jest.fn().mockResolvedValue(1),
      },
    };

    // Now load popup.js (it attaches DOMContentLoaded listener)
    jest.isolateModules(() => {
      require('../popup/popup.js');
    });

    // Fire DOMContentLoaded to wire up listeners
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  test('injects files then func without world-in-target and receives result', async () => {
    // Click "Convert"
    document.getElementById('convertBtn').click();

    // Wait for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert executeScript calls
    const calls = chrome.scripting.executeScript.mock.calls;
    expect(calls.length).toBe(2);

    // 1) files injection call
    expect(calls[0][0].files).toEqual([
      'utils/contentProcessor.js',
      'content/content.js'
    ]);
    // No 'world' inside target
    expect(calls[0][0].target).toEqual({ tabId: 123, allFrames: false });
    expect('world' in calls[0][0].target).toBe(false);

    // 2) func call returning the conversion result
    expect(typeof calls[1][0].func).toBe('function');
    expect(calls[1][0].target).toEqual({ tabId: 123, allFrames: false });
    expect('world' in calls[1][0].target).toBe(false);
  });

  test('handles conversion result correctly', async () => {
    // Click "Convert"
    document.getElementById('convertBtn').click();

    // Wait for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that the result is displayed
    const resultText = document.getElementById('resultText');
    expect(resultText.textContent).toContain('Successfully converted "Title" to Markdown');
    
    // Check that result div is visible
    const resultDiv = document.getElementById('result');
    expect(resultDiv.style.display).not.toBe('none');
  });

  test('handles errors gracefully', async () => {
    // Mock an error response
    chrome.scripting.executeScript = jest.fn().mockResolvedValue([{
      result: { error: 'Test error message' }
    }]);

    // Click "Convert"
    document.getElementById('convertBtn').click();

    // Wait for all async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that error is displayed
    const status = document.getElementById('status');
    expect(status.innerHTML).toContain('Error: Test error message');
  });
});
