// script.js

// 1. Data Storage: An array of quote objects
// ****** MODIFIED FOR PROJECT 2 ******
// We now start with an empty array. Quotes will be loaded from local storage.
let quotes = [];

// Default quotes to use if no quotes are found in local storage
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" }
];
// ************************************

// 2. DOM Elements Selection: Getting references to our HTML elements
const quoteDisplayDiv = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// References to the input fields (they exist in the HTML)
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

// ****** NEW FOR PROJECT 2 ******
// References to the new import/export elements
const exportQuotesButton = document.getElementById('exportQuotes');
const importFileInput = document.getElementById('importFile'); // Although we use onchange directly, good to have reference
// ******************************


// ****** NEW FOR PROJECT 2 ******
// Helper functions for Web Storage
function saveQuotes() {
    localStorage.setItem('quotesData', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotesData');
    if (storedQuotes) {
        // If quotes exist in local storage, parse them and use them
        quotes = JSON.parse(storedQuotes);
    } else {
        // If no quotes in local storage, initialize with default quotes
        quotes = [...defaultQuotes]; // Use spread syntax to copy default quotes
        saveQuotes(); // Save defaults to local storage for next time
    }
}
// ******************************


// 3. Function to Display a Random Quote (showRandomQuote)
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplayDiv.innerHTML = '<p>No quotes available yet. Add some!</p>';
        // ****** NEW FOR PROJECT 2 (Session Storage integration) ******
        sessionStorage.removeItem('lastQuoteIndex'); // Clear last viewed if no quotes
        // ************************************************************
        return;
    }

    // ****** NEW/MODIFIED FOR PROJECT 2 (Session Storage integration) ******
    let randomIndex;
    const lastIndex = sessionStorage.getItem('lastQuoteIndex');

    // Try to display the last viewed quote if it's still valid in the current session
    if (lastIndex !== null && lastIndex !== undefined && quotes[parseInt(lastIndex)]) {
        randomIndex = parseInt(lastIndex);
    } else {
        randomIndex = Math.floor(Math.random() * quotes.length);
    }

    sessionStorage.setItem('lastQuoteIndex', randomIndex.toString()); // Save the current quote's index
    // ************************************************************

    const selectedQuote = quotes[randomIndex];

    quoteDisplayDiv.innerHTML = ''; // Clear previous content

    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${selectedQuote.text}"`; // Uses 'text' property

    const quoteCategoryElement = document.createElement('span');
    quoteCategoryElement.textContent = `- ${selectedQuote.category}`; // Uses 'category' property

    quoteDisplayDiv.appendChild(quoteTextElement);
    quoteDisplayDiv.appendChild(quoteCategoryElement);
}

// 4. Function to Add New Quotes (createAddQuoteForm)
function createAddQuoteForm() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (quoteText && quoteCategory) {
        const newQuote = {
            text: quoteText,
            category: quoteCategory
        };

        quotes.push(newQuote);
        // ****** MODIFIED FOR PROJECT 2 ******
        saveQuotes(); // Save quotes to local storage after adding a new one
        // ************************************

        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';

        alert('Quote added successfully! Try clicking "Show New Quote".');
        showRandomQuote();
    } else {
        alert('Please enter both the quote text and its category.');
    }
}

// 5. The 'addQuote' function called by the HTML button
function addQuote() {
    createAddQuoteForm();
}


// ****** NEW FOR PROJECT 2 ******
// Function to export quotes to a JSON file
function exportQuotes() {
    // Convert the quotes array to a JSON string, pretty-printed for readability
    const dataStr = JSON.stringify(quotes, null, 2);

    // Create a Blob object from the JSON string
    const blob = new Blob([dataStr], { type: 'application/json' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json'; // Suggested filename for the downloaded file

    // Programmatically click the link to trigger the download
    document.body.appendChild(a); // Append temporarily (required by some browsers)
    a.click(); // Simulate a click
    document.body.removeChild(a); // Remove the temporary link

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
    alert('Quotes exported to quotes.json!');
}

// Function to import quotes from a JSON file (provided in the prompt)
function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);

            // Basic validation: ensure imported data is an array and contains objects with text/category
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q === 'object' && q !== null && 'text' in q && 'category' in q)) {
                 // Use spread syntax to add imported quotes to the existing array
                quotes.push(...importedQuotes);
                saveQuotes(); // Save the combined list to local storage
                alert('Quotes imported successfully!');
                showRandomQuote(); // Update display
            } else {
                alert('Invalid JSON file format. Please upload a file containing an array of quote objects with "text" and "category" properties.');
            }
        } catch (e) {
            alert('Error parsing JSON file. Please ensure it is a valid JSON format.');
            console.error('JSON parsing error:', e);
        }
        // Clear the file input so the same file can be selected again if needed
        event.target.value = '';
    };

    // Handle file reading errors
    fileReader.onerror = function() {
        alert('Failed to read file.');
    };

    // Ensure a file was selected
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
    } else {
        alert('No file selected.');
    }
}
// ******************************


// 6. Event Listener: Making the "Show New Quote" button work
newQuoteButton.addEventListener('click', showRandomQuote);

// ****** NEW FOR PROJECT 2 ******
// Event Listener for the export button
exportQuotesButton.addEventListener('click', exportQuotes);

// The import file input uses the 'onchange' attribute in HTML, so no need for addEventListener here
// importFileInput.addEventListener('change', importFromJsonFile); // This would also work if onchange wasn't used
// ******************************


// 7. Initial Load: Display a quote when the page first loads
document.addEventListener('DOMContentLoaded', () => {
    // ****** MODIFIED FOR PROJECT 2 ******
    loadQuotes(); // Load quotes from local storage first
    // ************************************
    showRandomQuote(); // Then display an initial random quote
});