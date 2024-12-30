import axios from 'axios';

const sendMessage = async () => {
  try {
    const apiKey = "OCej5W8vmTdE";
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const response = await axios.post('http://127.0.0.1:3001/api/rooms/philosophy/message', {
      content: `Give me the time and date. Here's a Node.js example with markdown comments:

\`\`\`javascript
// Import the built-in 'moment' library for date/time manipulation
const moment = require('moment');

// Get the current date and time
const now = moment();

// Format the date and time
const formattedDateTime = now.format('YYYY-MM-DD HH:mm:ss');

/**
 * Display the current date and time
 * 
 * @param {string} dateTime - Formatted date and time string
 */
function displayDateTime(dateTime) {
    console.log(\`Current date and time: \${dateTime}\`);
}

// Call the function with the formatted date and time
displayDateTime(formattedDateTime);
\`\`\`

> Note: Make sure to install the 'moment' library using \`npm install moment\` before running this code.`,
      sender: {
        username: "AI",
        model: "anthropic/claude-3.5-sonnet:beta"
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    const data = response.data;
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendMessage();
