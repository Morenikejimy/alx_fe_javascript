// script.js

// 1. Data Storage: An array of quote objects
let quotes = [];

// Default quotes to use if no quotes are found in local storage
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" }
];

// ****** NEW FOR PROJECT 4: Server Simulation Constants ******
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Using posts as mock quotes
const SYNC_INTERVAL_MS = 15000; // Sync every 15 seconds (adjusted from 10 for less spam)
// ************************************************************

// 2. DOM Elements Selection: Getting references to our HTML elements
const quoteDisplayDiv = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
const exportQuotesButton = document.getElementById('exportQuotes');
const importFileInput = document.getElementById('importFile');
const categoryFilterSelect = document.getElementById('categoryFilter');


// Helper functions for Web Storage (from Project 2)
function saveQuotes() {
    localStorage.setItem('quotesData', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotesData');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
        // Ensure new 'serverSynced' property is present for older quotes
        quotes.forEach(quote => {
            if (quote.serverSynced === undefined) {
                quote.serverSynced = true; // Assume old quotes are synced
            }
        });
    } else {
        quotes = [...defaultQuotes];
        quotes.forEach(quote => quote.serverSynced = true); // Mark defaults as synced
        saveQuotes();
    }
}

// Function to populate the category filter dropdown (from Project 3)
function populateCategories() {
    const categories = new Set(quotes.map(quote => quote.category));
    categoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilterSelect.appendChild(option);
    });
    const lastSelectedFilter = localStorage.getItem('lastCategoryFilter');
    if (lastSelectedFilter) {
        categoryFilterSelect.value = lastSelectedFilter;
    }
}

// Function to filter and display quotes based on the selected category (from Project 3)
function filterQuotes() {
    const selectedCategory = categoryFilterSelect.value;
    localStorage.setItem('lastCategoryFilter', selectedCategory);

    let filteredQuotes = [];
    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    quoteDisplayDiv.innerHTML = '';

    if (filteredQuotes.length === 0) {
        quoteDisplayDiv.innerHTML = `<p>No quotes found for category: "${selectedCategory}".</p>`;
        sessionStorage.removeItem('lastQuoteIndex');
        return;
    }

    let randomIndex;
    const lastIndex = sessionStorage.getItem('lastQuoteIndex');

    if (lastIndex !== null && lastIndex !== undefined && filteredQuotes[parseInt(lastIndex)]) {
        const prevQuote = quotes[parseInt(lastIndex)];
        const indexInFiltered = filteredQuotes.findIndex(q => q.text === prevQuote.text && q.category === prevQuote.category);
        if (indexInFiltered !== -1) {
            randomIndex = indexInFiltered;
        } else {
            randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        }
    } else {
        randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    }
    sessionStorage.setItem('lastQuoteIndex', randomIndex.toString());

    const selectedQuote = filteredQuotes[randomIndex];

    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${selectedQuote.text}"`;

    const quoteCategoryElement = document.createElement('span');
    quoteCategoryElement.textContent = `- ${selectedQuote.category}`;

    quoteDisplayDiv.appendChild(quoteTextElement);
    quoteDisplayDiv.appendChild(quoteCategoryElement);
}

// Function to Display a Random Quote (showRandomQuote) - Modified for Project 3
function showRandomQuote() {
    const selectedCategory = categoryFilterSelect.value;
    let quotesToDisplay = [];

    if (selectedCategory === 'all') {
        quotesToDisplay = quotes;
    } else {
        quotesToDisplay = quotes.filter(quote => quote.category === selectedCategory);
    }

    if (quotesToDisplay.length === 0) {
        quoteDisplayDiv.innerHTML = `<p>No quotes available for category: "${selectedCategory}". Add some!</p>`;
        sessionStorage.removeItem('lastQuoteIndex');
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
    const selectedQuote = quotesToDisplay[randomIndex];

    quoteDisplayDiv.innerHTML = '';

    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${selectedQuote.text}"`;

    const quoteCategoryElement = document.createElement('span');
    quoteCategoryElement.textContent = `- ${selectedQuote.category}`;

    quoteDisplayDiv.appendChild(quoteTextElement);
    quoteDisplayDiv.appendChild(quoteCategoryElement);
}


// Function to Add New Quotes (createAddQuoteForm) - MODIFIED for Project 4
function createAddQuoteForm() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (quoteText && quoteCategory) {
        const newQuote = {
            text: quoteText,
            category: quoteCategory,
            // ****** NEW FOR PROJECT 4: Add a sync status flag ******
            serverSynced: false // New quotes are initially not synced to server
            // ********************************************************
        };

        quotes.push(newQuote);
        saveQuotes();

        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';

        alert('Quote added successfully! It will attempt to sync with the server.');

        populateCategories();
        filterQuotes();

        // ****** NEW FOR PROJECT 4: Immediately trigger a sync attempt for new local data ******
        syncQuotesWithServer();
        // ***********************************************************************************
    } else {
        alert('Please enter both the quote text and its category.');
    }
}

// The 'addQuote' function called by the HTML button - UNCHANGED
function addQuote() {
    createAddQuoteForm();
}


// JSON Import/Export Functions (from Project 2)
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Quotes exported to quotes.json!');
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);

            if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q === 'object' && q !== null && 'text' in q && 'category' in q)) {
                // ****** MODIFIED FOR PROJECT 4: Ensure imported quotes also have sync flag ******
                importedQuotes.forEach(q => {
                    if (q.serverSynced === undefined) {
                        q.serverSynced = false; // Imported quotes are new to current session, need to be synced
                    }
                });
                // ********************************************************************************

                quotes.push(...importedQuotes);
                saveQuotes();
                alert('Quotes imported successfully!');
                populateCategories();
                filterQuotes();
            } else {
                alert('Invalid JSON file format. Please upload a file containing an array of quote objects with "text" and "category" properties.');
            }
        } catch (e) {
            alert('Error parsing JSON file. Please ensure it is a valid JSON format.');
            console.error('JSON parsing error:', e);
        }
        event.target.value = ''; // Clear file input
    };

    fileReader.onerror = function() {
        alert('Failed to read file.');
    };

    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
    } else {
        alert('No file selected.');
    }
}


// ****** NEW FOR PROJECT 4: Data Syncing Logic (Async Functions) ******

// Function to fetch quotes from the simulated server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverData = await response.json();
        // Map JSONPlaceholder's /posts format to our quote object format
        // Limiting to first 20 posts for performance and simpler demo
        return serverData.slice(0, 20).map(post => ({
            text: post.title, // Map post.title to quote.text
            category: `Server [${post.userId || 'Unknown'}]`, // Map post.userId/default to quote.category
            serverSynced: true // Quotes coming from server are by definition synced
        }));
    } catch (error) {
        console.error('Failed to fetch quotes from server:', error);
        // alert('Could not connect to server or fetch latest quotes.'); // Alert can be annoying on interval
        return [];
    }
}

// Function to simulate sending new local quotes to the server
async function sendNewQuotesToServer(newLocalQuotes) {
    if (newLocalQuotes.length === 0) {
        return;
    }
    console.log('Attempting to send new local quotes to server (simulated POST):', newLocalQuotes.map(q => q.text));

    let sentSuccessfully = 0;
    for (const quote of newLocalQuotes) {
        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: quote.text,
                    body: `Category: ${quote.category}`,
                    userId: 1, // Required by JSONPlaceholder
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            console.log('Quote sent to server (simulated success):', responseData);
            sentSuccessfully++;
            // Mark the original quote object as synced (important for persistence)
            const index = quotes.findIndex(q => q === quote); // Find the exact object reference
            if (index !== -1) {
                quotes[index].serverSynced = true;
            }

        } catch (error) {
            console.error('Failed to send quote to server:', quote.text, error);
        }
    }
    if (sentSuccessfully > 0) {
        saveQuotes(); // Save updated sync status after attempts
        alert(`Successfully simulated sending ${sentSuccessfully} new quotes to server.`);
    }
}

// Main syncing function - MODIFIED for conflict resolution and notifications
async function syncQuotesWithServer() {
    console.log('Initiating sync with server...');

    const serverQuotes = await fetchQuotesFromServer();
    let newQuotesFromServerCount = 0;
    let localQuotesUpdatedByServerCount = 0;

    // Identify quotes that are local-only and not yet sent
    const quotesToSendToServer = quotes.filter(quote => !quote.serverSynced);

    // Conflict Resolution: Server's data takes precedence
    // Create a working copy of local quotes for modification
    let tempQuotes = [...quotes];

    serverQuotes.forEach(sQuote => {
        const localIndex = tempQuotes.findIndex(lQuote =>
            lQuote.text === sQuote.text && lQuote.category === sQuote.category
        );

        if (localIndex === -1) {
            // Quote exists only on server, add it locally
            tempQuotes.push(sQuote);
            newQuotesFromServerCount++;
        } else {
            // Quote exists both locally and on server
            // Server's data takes precedence.
            // If local data is different or not marked synced, update it.
            if (tempQuotes[localIndex].text !== sQuote.text || tempQuotes[localIndex].category !== sQuote.category || !tempQuotes[localIndex].serverSynced) {
                tempQuotes[localIndex].text = sQuote.text;
                tempQuotes[localIndex].category = sQuote.category;
                tempQuotes[localIndex].serverSynced = true; // Ensure it's marked synced
                localQuotesUpdatedByServerCount++;
            }
        }
    });

    // Remove duplicates that might arise from manual entry and server sync for identical quotes
    // A more robust solution would use unique IDs from the server.
    // For simplicity, we filter out duplicates based on text/category.
    const uniqueTempQuotes = [];
    const seen = new Set();
    tempQuotes.forEach(q => {
        const identifier = `${q.text}|${q.category}`;
        if (!seen.has(identifier)) {
            uniqueTempQuotes.push(q);
            seen.add(identifier);
        }
    });
    // Finally, ensure quotes array is updated and saved.
    quotes = uniqueTempQuotes;
    saveQuotes();

    // After updating local data from server, re-render UI
    populateCategories();
    filterQuotes();

    // UI Notifications for server changes
    if (newQuotesFromServerCount > 0) {
        alert(`Sync complete! Added ${newQuotesFromServerCount} new quote(s) from the server.`);
    }
    if (localQuotesUpdatedByServerCount > 0) {
        alert(`Sync complete! ${localQuotesUpdatedByServerCount} local quote(s) were updated to match server data.`);
    }
    if (newQuotesFromServerCount === 0 && localQuotesUpdatedByServerCount === 0) {
        console.log('No new quotes from server or local updates required.');
    }


    // Now, simulate sending quotes that were local-only to the server
    if (quotesToSendToServer.length > 0) {
        await sendNewQuotesToServer(quotesToSendToServer);
        // After sending, re-run populate/filter to reflect newly synced status if needed
        populateCategories();
        filterQuotes();
    }
    console.log('Sync process completed.');
}
// *********************************************************************


// 6. Event Listeners - MODIFIED for Project 4
newQuoteButton.addEventListener('click', showRandomQuote);
exportQuotesButton.addEventListener('click', exportQuotes);
// The import file input uses the 'onchange' attribute in HTML: onchange="importFromJsonFile(event)"

// Category filter dropdown uses onchange="filterQuotes()" in HTML

// ****** NEW FOR PROJECT 4: Start periodic sync ******
let syncIntervalId; // Store the interval ID to clear it later if needed

document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    populateCategories();
    filterQuotes();

    // Start the periodic sync
    syncIntervalId = setInterval(syncQuotesWithServer, SYNC_INTERVAL_MS);
    console.log(`Periodic sync started. Syncing every ${SYNC_INTERVAL_MS / 1000} seconds.`);

    // Optional: Clear interval when page is closed/navigated away
    window.addEventListener('beforeunload', () => {
        clearInterval(syncIntervalId);
        console.log('Periodic sync stopped.');
    });
});
// ****************************************************