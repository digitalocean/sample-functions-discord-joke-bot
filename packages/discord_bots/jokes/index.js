const nacl = require('tweetnacl');
const giveMeAJoke = require('give-me-a-joke');

// Get this values from the Discord Developer Portal. 
const DISCORD_JOKES_BOT_PUBLIC_KEY = process.env.DISCORD_JOKES_BOT_PUBLIC_KEY;

async function getRandomJoke() {
  return new Promise((resolve) => {
    giveMeAJoke.getRandomDadJoke((joke) => {
      resolve(joke)
    })
  })
};

async function main(args) {
  const signature = args.__ow_headers['x-signature-ed25519'];
  const timestamp = args.__ow_headers['x-signature-timestamp'];

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + args.__ow_body),
    Buffer.from(signature, 'hex'),
    Buffer.from(DISCORD_JOKES_BOT_PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return {
      statusCode: 401,
      body: 'invalid request signature',
    };
  }

  const body = JSON.parse(args.__ow_body);
  const joke = await getRandomJoke();

  if (body.data.name == 'jokes') {
    return {
      statusCode: 200,
      body: {
        type: 4,
        data: {
          content: joke
        }
      }
    }
  }

  return {
    statusCode: 404  // If no handler implemented for Discord's request
  }
} 

exports.main = main;