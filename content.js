// Fetch a dictionary of words
async function fetchDictionary() {
    showProgressBar(); // Show progress bar while loading the dictionary
  
    const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt');
    const text = await response.text();
  
    hideProgressBar(); // Hide progress bar after loading is complete
  
    // Split the file into words and clean up whitespaces or hidden characters
    return new Set(
      text
        .split('\n') // Split into individual lines
        .map(word => word.trim().toLowerCase()) // Remove extra spaces and make lowercase
        .filter(word => word) // Filter out empty strings
    );
  }
  
  // Show the progress bar
  function showProgressBar() {
    let progressBar = document.getElementById('dictionary-loading-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'dictionary-loading-bar';
      progressBar.style.position = 'fixed';
      progressBar.style.top = '0';
      progressBar.style.left = '0';
      progressBar.style.width = '0';
      progressBar.style.height = '4px';
      progressBar.style.backgroundColor = '#4caf50';
      progressBar.style.zIndex = '9999';
      progressBar.style.transition = 'width 0.3s ease';
      document.body.appendChild(progressBar);
  
      // Simulate progress for visual effect
      let width = 0;
      const interval = setInterval(() => {
        if (width < 80) {
          width += 10;
          progressBar.style.width = width + '%';
        } else {
          clearInterval(interval);
        }
      }, 300);
    }
  }
  
  // Hide the progress bar
  function hideProgressBar() {
    const progressBar = document.getElementById('dictionary-loading-bar');
    if (progressBar) {
      progressBar.style.width = '100%'; // Complete the progress bar
      setTimeout(() => {
        progressBar.remove(); // Remove the progress bar after a brief delay
      }, 500);
    }
  }
  
  // Global variables to track dictionary and mistakes
  let dictionary = new Set();
  const mistakeCounts = new Map();
  let wordsScanned = 0; // Counter for words scanned
  let clickTimeout = null; // Timeout ID for mouse click delay
  
  // Highlight spelling mistakes and count occurrences
  function highlightSpellingMistakes() {
    // Clear the previous mistakes and reset the counter
    mistakeCounts.clear();
    wordsScanned = 0;
  
    // Dynamically fetch all text in the DOM
    const bodyText = document.body.innerText;
  
    // Extract all words from the text
    const words = bodyText.match(/\b\w+\b/g) || [];
    wordsScanned = words.length; // Update the words scanned counter
  
    words.forEach((word) => {
      if (!isNaN(word)) return; // Ignore numbers
  
      // Split words with underscores and check each part
      const parts = word.split('_'); // Split by underscores
      parts.forEach((part) => {
        const lowerPart = part.toLowerCase(); // Convert the part to lowercase for comparison
        if (!dictionary.has(lowerPart) && lowerPart.trim() !== '') {
          mistakeCounts.set(lowerPart, (mistakeCounts.get(lowerPart) || 0) + 1);
        }
      });
    });
  
    // Update the sticky note with the mistakes and the words scanned
    updateStickyNote(mistakeCounts, wordsScanned);
  }
  
  // Create or update the sticky note on the page
  function updateStickyNote(mistakeCounts, wordsScanned) {
    let stickyNote = document.getElementById('spelling-mistake-sticky-note');
  
    // If the sticky note doesn't exist, create it
    if (!stickyNote) {
      stickyNote = document.createElement('div');
      stickyNote.id = 'spelling-mistake-sticky-note';
      stickyNote.style.position = 'fixed';
      stickyNote.style.top = '10%';
      stickyNote.style.right = '10px';
      stickyNote.style.width = '250px';
      stickyNote.style.maxHeight = '70%';
      stickyNote.style.backgroundColor = '#ffeb3b';
      stickyNote.style.padding = '10px';
      stickyNote.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      stickyNote.style.overflowY = 'auto';
      stickyNote.style.zIndex = '9999';
  
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '10px';
  
      const title = document.createElement('h4');
      title.innerText = 'Spelling Mistakes';
      title.style.margin = '0';
      title.style.fontSize = '18px';
  
      const refreshButton = document.createElement('button');
      refreshButton.innerText = 'Rescan';
      refreshButton.style.border = '1px solid #ccc';
      refreshButton.style.backgroundColor = '#4caf50';
      refreshButton.style.color = '#fff';
      refreshButton.style.cursor = 'pointer';
      refreshButton.style.fontSize = '16px';
      refreshButton.style.padding = '5px 10px';
      refreshButton.style.borderRadius = '5px';
      refreshButton.title = 'Refresh';
  
      refreshButton.addEventListener('click', async () => {
        console.log("Refresh button clicked. Rescanning the content...");
        highlightSpellingMistakes(); // Re-run the scan on refresh
      });
  
      header.appendChild(title);
      header.appendChild(refreshButton);
      stickyNote.appendChild(header);
  
      document.body.appendChild(stickyNote);
    }
  
    // Clear the content of the sticky note except the header
    const header = stickyNote.firstChild;
    stickyNote.innerHTML = ''; // Clear existing content
    stickyNote.appendChild(header);
  
    // Add stats
    const stats = document.createElement('div');
    stats.innerText = `Words Scanned: ${wordsScanned}`;
    stats.style.fontSize = '14px';
    stats.style.marginBottom = '10px';
    stickyNote.appendChild(stats);
  
    // Add list of mistakes
    const list = document.createElement('ul');
    list.style.padding = '0';
    list.style.margin = '0';
    list.style.listStyle = 'none';
  
    mistakeCounts.forEach((count, word) => {
      const listItem = document.createElement('li');
      listItem.innerText = `${word} (${count})`;
      listItem.style.padding = '5px';
      listItem.style.borderBottom = '1px solid #ccc';
      listItem.style.marginBottom = '5px';
      listItem.style.fontSize = '14px';
      list.appendChild(listItem);
    });
  
    stickyNote.appendChild(list);
  }
  
  // Add a listener to trigger a rescan 1 second after every mouse click
  document.addEventListener('click', () => {
    clearTimeout(clickTimeout); // Clear any existing timeout
    clickTimeout = setTimeout(() => {
      highlightSpellingMistakes();
    }, 1000); // Delay by 1 second
  });
  
  // Initialize the spell checker
  async function initializeSpellChecker() {
    dictionary = await fetchDictionary(); // Load the dictionary
    highlightSpellingMistakes(); // Run the first scan
  }
  
  // Run the script
  initializeSpellChecker();