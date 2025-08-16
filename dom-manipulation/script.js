// script.js

// 1. Data Storage: An array of quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" }
];

// 2. DOM Elements Selection: Getting references to our HTML elements
const quoteDisplayDiv = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// References to the input fields (they exist in the HTML)
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');


// 3. Function to Display a Random Quote (showRandomQuote)
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplayDiv.innerHTML = '<p>No quotes available yet. Add some!</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
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
// This function contains the core logic for processing the new quote.
// It explicitly uses 'text' and 'category' property names when creating the new quote object.
function createAddQuoteForm() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (quoteText && quoteCategory) {
        // Create the new quote object using 'text' and 'category' properties
        const newQuote = {
            text: quoteText,
            category: quoteCategory
        };

        // Add the new quote to our array
        quotes.push(newQuote);

        // Clear the input fields
        newQuoteTextInput.value = '';
        newQuoteCategoryInput.value = '';

        alert('Quote added successfully! Try clicking "Show New Quote".');
        showRandomQuote(); // Display a new random quote, including the newly added one
    } else {
        alert('Please enter both the quote text and its category.');
    }
}

// 5. The 'addQuote' function called by the HTML button
// This function acts as a bridge, calling the createAddQuoteForm function.
function addQuote() {
    createAddQuoteForm(); // Call the function that contains the main logic
}


// 6. Event Listener: Making the "Show New Quote" button work
newQuoteButton.addEventListener('click', showRandomQuote);

// 7. Initial Load: Display a quote when the page first loads
document.addEventListener('DOMContentLoaded', () => {
    showRandomQuote(); // Display an initial random quote
    // No need to call createAddQuoteForm() here because the HTML form is static.
    // The createAddQuoteForm() is only called when the "Add Quote" button is clicked.
});