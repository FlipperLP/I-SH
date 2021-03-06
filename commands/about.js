const fs = require('fs');

// creates a embed messagetemplate for succeded actions
function postMessage(client, message, body, error) {
  let color = 0;
  if (message.channel.type !== 'dm') color = message.member.displayColor;
  client.functions.get('FUNC_MessageEmbedMessage')
    .run(client.user, message.channel, body, 'About: ', color, false);
}

// creates a embed messagetemplate for failed text retrieving and posts error message into log
// TODO: put in own errorhandler
// TODO: make errorlogchannel in server
function error(client, channel, err) {
  console.error('ERROR: ', err);
  client.functions.get('FUNC_MessageEmbedMessage')
    .run(client.user, channel, 'Oh no! Something went wrong. This error has been carefully recorded and our nerd is working on it to fix it. Please try again later.', '', 16449540, false);
}

module.exports.run = async (client, message, args, config) => {
  fs.readFile(config.aboutText, 'utf8', (err, data) => {
    if (err) return error(client, message.channel, err);
    postMessage(client, message, data, error);
  });
};

module.exports.help = {
  name: 'about',
  title: 'About',
  desc: 'Displays some information about the bot.',
};
