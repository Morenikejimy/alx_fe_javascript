// script.js

// 1. Data Storage: An array of quote objects
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

// 2. DOM Elements Selection: Getting references to our HTML elements
const quoteDisplayDiv = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
const exportQuotesButton = document.getElementById('exportQuotes'); // From Project 2
const importFileInput = document.getElementById('importFile'); // From Project 2

// ****** NEW FOR PROJECT 3: Reference to the category filter dropdown ******
const categoryFilterSelect = document.getElementById('categoryFilter');
// ************************************************************************


// ****** NEW/MODIFIED FOR PROJECT 2 & 3: Helper functions for Web Storage ******

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotesData', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotesData');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // If no quotes in local storage, initialize with default quotes
        quotes = [...defaultQuotes]; // Use spread syntax to copy default quotes
        saveQuotes(); // Save defaults to local storage for next time
    }
}
// ****************************************************************************


// ****** NEW FOR PROJECT 3: Function to populate the category filter dropdown ******
function populateCategories() {
    // 1. Get all unique categories from the quotes array
    const categories = new Set(quotes.map(quote => quote.category));

    // 2. Clear existing options, keeping "All Categories" option
    categoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';

    // 3. Add each unique category as an option to the dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilterSelect.appendChild(option);
    });

    // 4. Restore last selected filter from local storage after populating
    const lastSelectedFilter = localStorage.getItem('lastCategoryFilter');
    if (lastSelectedFilter) {
        categoryFilterSelect.value = lastSelectedFilter;
    }
}
// ********************************************************************************


// ****** NEW FOR PROJECT 3: Function to filter and display quotes based on the selected category ******
function filterQuotes() {
    const selectedCategory = categoryFilterSelect.value; // Get the currently selected value

    // Save the selected filter to local storage for persistence
    localStorage.setItem('lastCategoryFilter', selectedCategory);

    let filteredQuotes = [];
    if (selectedCategory === 'all') {
        filteredQuotes = quotes; // If "All Categories" is selected, show all quotes
    } else {
        // Use the filter array method to get only quotes matching the category
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    // Display logic: show one random quote from the filtered list
    quoteDisplayDiv.innerHTML = ''; // Clear previous content

    if (filteredQuotes.length === 0) {
        quoteDisplayDiv.innerHTML = `<p>No quotes found for category: "${selectedCategory}".</p>`;
        sessionStorage.removeItem('lastQuoteIndex'); // Clear last viewed if no quotes in filtered view
        return;
    }

    // Attempt to use session storage for last viewed quote within the *filtered* set
    let randomIndex;
    const lastIndex = sessionStorage.getItem('lastQuoteIndex');

    if (lastIndex !== null && lastIndex !== undefined && filteredQuotes[parseInt(lastIndex)]) {
        // Check if the previously viewed quote is still in the current filtered list
        // This makes the 'last viewed' more robust when filtering
        const prevQuote = quotes[parseInt(lastIndex)]; // Get the original quote from the main array
        const indexInFiltered = filteredQuotes.findIndex(q => q.text === prevQuote.text && q.category === prevQuote.category);
        if (indexInFiltered !== -1) {
            randomIndex = indexInFiltered;
        } else {
            randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        }
    } else {
        randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    }
    // Update session storage based on the original quotes array index if possible
    // This part can be tricky. For simplicity, let's just save the index within the *filtered* list.
    // Or, more robustly, we could save the full quote object to sessionStorage if it's small.
    // For this example, saving the *filtered* index is simpler.
    sessionStorage.setItem('lastQuoteIndex', randomIndex.toString());


    const selectedQuote = filteredQuotes[randomIndex];

    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${selectedQuote.text}"`;

    const quoteCategoryElement = document.createElement('span');
    quoteCategoryElement.textContent = `- ${selectedQuote.category}`;

    quoteDisplayDiv.appendChild(quoteTextElement);
    quoteDisplayDiv.appendChild(quoteCategoryElement);
}
// ***********************************************************************************************


// 3. Function to Display a Random Quote (showRandomQuote) - Now mainly used by the button to get a NEW random quote
// This function will now pick a random quote from the *currently filtered* set.
// This is to make the "Show New Quote" button respect the filter.
function showRandomQuote() {
    const selectedCategory = categoryFilterSelect.value; // Get the currently selected filter
    let quotesToDisplay = [];

    if (selectedCategory === 'all') {
        quotesToDisplay = quotes;
    } else {
        quotesToDisplay = quotes.filter(quote => quote.category === selectedCategory);
    }

    if (quotesToDisplay.length === 0) {
        quoteDisplayDiv.innerHTML = `<p>No quotes available for category: "${selectedCategory}". Add some!</p>`;
        sessionStorage.removeItem('lastQuoteIndex'); // Clear last viewed if no quotes
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
    const selectedQuote = quotesToDisplay[randomIndex];

    // Store the index relative to the *full* quotes array for session storage, if you want.
    // For simplicity with session storage in filterQuotes/showRandomQuote, we'll store index relative to filtered set.
    // Or, even better, store the quote itself if it's small, to avoid index issues.
    // For now, let's just update the display based on the random pick from the filtered set.
    // No explicit sessionStorage.setItem here as filterQuotes now handles that,
    // and showRandomQuote is primarily for "next random" within the current filter.

    quoteDisplayDiv.innerHTML = ''; // Clear previous content

    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${selectedQuote.text}"`;

    const quoteCategoryElement = document.createElement('span');
    quoteCategoryElement.textContent = `- ${selectedQuote.category}`;

    quoteDisplayDiv.appendChild(quoteTextElement);
    quoteDisplayDiv.appendChild(quoteCategoryElement);

    // Optional: Update sessionStorage here if desired, considering the full quotes array index
    // let originalIndex = quotes.findIndex(q => q.text === selectedQuote.text && q.category === selectedQuote.category);
    // if(originalIndex !== -1) sessionStorage.setItem('lastQuoteIndex', originalIndex.toString());
}


// 4. Function to Add New Quotes (createAddQuoteForm) - MODIFIED for Project 2 & 3
function createAddQuoteForm() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (quoteText && quoteCategory) {
        const newQuote = {
            text: quoteText,
            category: quoteCategory
        };

        quotes.push(newQuote);
        saveQuotes(); // Save to local storage after adding a new one (Project 2)

        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';

        alert('Quote added successfully! Try clicking "Show New Quote" or check filters.');

        // ****** NEW FOR PROJECT 3: Update categories and re-filter after adding new quote ******
        populateCategories(); // Repopulate categories in case a new one was added
        filterQuotes();       // Re-apply current filter to include new quote if it matches
        // *************************************************************************************
    } else {
        alert('Please enter both the quote text and its category.');
    }
}

// 5. The 'addQuote' function called by the HTML button - UNCHANGED
function addQuote() {
    createAddQuoteForm();
}


// ****** NEW/MODIFIED FOR PROJECT 2 & 3: JSON Import/Export Functions ******

// Function to export quotes to a JSON file (from Project 2)
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

// Function to import quotes from a JSON file (from Project 2)
function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);


            // Basic validation: ensure imported data is an array and contains objects with text/category
           
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => typeof q === 'object' && q !== null && 'text' in q && 'category' in q)) {
                quotes.push(...importedQuotes);
                saveQuotes(); // Save the combined list to local storage
                alert('Quotes imported successfully!');
                // ****** NEW FOR PROJECT 3: Re-populate categories and re-filter after import ******
                populateCategories();
                filterQuotes();
                // ******************************************************************************
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
// *************************************************************************


// 6. Event Listeners - MODIFIED for Project 2 & 3
newQuoteButton.addEventListener('click', showRandomQuote); // Remains the same
exportQuotesButton.addEventListener('click', exportQuotes); // From Project 2
// The import file input uses the 'onchange' attribute in HTML: onchange="importFromJsonFile(event)"

// ****** NEW FOR PROJECT 3: Event listener for category filter dropdown ******
// The HTML has onchange="filterQuotes()", so no need for addEventListener here
// categoryFilterSelect.addEventListener('change', filterQuotes);
// *************************************************************************


// 7. Initial Load: Display a quote and populate filters when the page first loads - MODIFIED for Project 2 & 3
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();       // Load quotes from local storage (Project 2)
    populateCategories(); // Populate filter options based on loaded quotes (Project 3)
    filterQuotes();     // Apply the initial (or saved) filter and display a quote (Project 3)
    // showRandomQuote() is now called from filterQuotes or by button click.
});