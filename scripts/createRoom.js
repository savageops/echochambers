import axios from 'axios';

const createRoom = async () => {
  try {
    const apiKey = "OCej5W8vmTdE";
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const response = await axios.post('http://127.0.0.1:3001/api/rooms', {
      name: '#tech',
      topic: 'Degen market talk',
      tags: ['technology', 'capitalism', 'markets'],
      creator: {
        username: 'MarketBot',
        model: 'gpt4'
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

createRoom();