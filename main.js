import '@haxtheweb/simple-icon/simple-icon.js';

// Select DOM elements
const urlInput = document.getElementById('url-input');
const analyzeButton = document.getElementById('analyze-button');
const overview = document.getElementById('overview');
const cardContainer = document.getElementById('card-container');

// Event listener for the Analyze button
analyzeButton.addEventListener('click', () => {
  const url = urlInput.value.trim();
  
  // Validate URL and append /site.json if missing
  if (!url) {
    alert('Please enter a valid URL');
    return;
  }
  
  const fetchUrl = url.endsWith('site.json') ? url : `${url}/site.json`;
  fetchSiteData(fetchUrl);
});

// Function to fetch site.json data and validate it
async function fetchSiteData(url) {
  try {
    const response = await fetch(url);
    
    // Handle non-200 responses
    if (!response.ok) throw new Error('Failed to fetch data');

    const data = await response.json();
    
    // Check for required fields in the JSON structure
    if (!data.metadata || !data.metadata.site || !data.metadata.site.name || !data.items) {
      throw new Error('Invalid site.json structure');
    }
    
    updateState(data);
  } catch (error) {
    console.error('Error:', error);
    alert('Could not retrieve data. Please check the URL and try again.');
  }
}

// Converts Unix timestamp to a human-readable date format
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}

// Function to update state and render content
function updateState(data) {
  // Render overview and items
  renderOverview(data);
  renderCards(data.items);
}

// Function to render the overview section with a site-wide logo
function renderOverview(data) {
  // Access nested metadata fields
  const BASE_URL = 'https://haxtheweb.org/';
  const siteName = data.metadata.site.name || data.title;
  const description = data.description || "No description available";
  const createdDate = data.metadata.site.created ? formatDate(data.metadata.site.created) : "N/A";
  const theme = data.metadata.theme.name || "Default Theme";
  const lastUpdated = data.metadata.site.updated ? formatDate(data.metadata.site.updated) : "N/A";
  
  const logoUrl = data.metadata.site.logo ? `${BASE_URL}${data.metadata.site.logo}` : '';
  const hexCode = data.metadata.theme.variables.hexCode || '';
  const iconName = data.metadata.theme.variables.icon || 'icons:face';



  // Inject HTML into the overview section
  overview.innerHTML = `
    ${logoUrl ? `<img src="${logoUrl}" alt="Site Logo" style="max-width: 200px; height: auto; margin-bottom: 10px;">` : ''}
    <h2>${siteName}</h2>
    <p>${description}</p>
    <p><strong>Theme:</strong> ${theme}</p>
     <p><strong>Created:</strong> ${createdDate}</p>
    <p><strong>Last Updated:</strong> ${lastUpdated}</p>
    <simple-icon icon="${iconName}" style="font-size: 24px; color: ${hexCode};"></simple-icon>
  `;

  // Optionally set background color using hexCode from metadata
  if (data.metadata.theme.variables.hexCode) {
    overview.style.backgroundColor = data.metadata.theme.variables.hexCode;
  }
}

// Function to render cards for each item with images
function renderCards(items) {
  cardContainer.innerHTML = ''; // Clear existing cards

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    // Extract necessary data from the item
    const BASE_URL = 'https://haxtheweb.org/';
    const title = item.title || 'Untitled';
    const description = item.description || 'No description available';
    const lastUpdated = item.metadata.updated ? formatDate(item.metadata.updated) : "N/A";
    const createdDate = item.metadata.created ? formatDate(item.metadata.created) : "N/A";
    const location = item.location ? `${BASE_URL}${item.location}` : '#';
    const sourceLink = item.location ? location : '#';
    

    // Check if there's an image in item.metadata.images
    const imageUrl = item.metadata.images && item.metadata.images.length > 0 ? item.metadata.images[0] : '';

    // Populate the card with item data
    card.innerHTML = `
      ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto; margin-bottom: 10px;">` : ''}
      <h3>${title}</h3>
      <p>${description}</p>
      <p><strong>Created:</strong> ${createdDate}</p>
      <p><strong>Last Updated:</strong> ${lastUpdated}</p>
      <a href="${location}" target="_blank" rel="noopener noreferrer">View Item</a>
      <a href="${sourceLink}" target="_blank" rel="noopener noreferrer">View Source</a>
    `;

    cardContainer.appendChild(card);
  });
}
