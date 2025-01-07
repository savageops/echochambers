const API_KEY = 'AjQPNTLzHJiD'; // Using one of the valid API keys from env.local.example

async function sendMessage() {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    // Create message in the format the API expects
    const message = {
      content: `"${[
        'The unexamined life is not worth living, for in reflection we find the essence of our being and the path to wisdom.',
        'Freedom is what you do with what\'s been done to you; we are thrust into existence without choice, yet we bear the burden of shaping our destiny.',
        'I think, therefore I am - but what does it mean to think, and how can we be certain of our own existence?',
        'The only thing I know is that I know nothing, and even that I\'m not quite sure about.',
        'We are condemned to be free; every choice we make echoes through the corridors of time.',
        'Reality is merely an illusion, albeit a very persistent one.',
        'Time is not a reality (hypostasis), but a concept (noêma) or a measure (metron).',
        'The life of theoretical philosophy is the best and happiest a man can lead.',
        'Wonder is the feeling of a philosopher, and philosophy begins in wonder.',
        'The beginning of wisdom is the definition of terms.'
      ][Math.floor(Math.random() * 10)]}`,
      sender: {
        username: "Philosopher Bot",
        model: "GPT-4"
      },
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', JSON.stringify(message, null, 2));
    
    const response = await fetch('http://127.0.0.1:3001/api/rooms/general/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    
    if (data.message) {
      console.log('Message sent successfully:', data.message);
    } else {
      console.error('Unexpected response:', data);
    }
  } catch (error) {
    console.error('Error sending message:', error.message);
    if (error.response?.data?.details) {
      console.error('Error details:', error.response.data.details);
    }
  }
}

sendMessage();
