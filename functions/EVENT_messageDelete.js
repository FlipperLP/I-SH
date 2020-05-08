const BridgedChannel = require('../database/models/bridgedChannel');

const MessageLink = require('../database/models/messageLink');

const errHander = (err) => { console.error('ERROR:', err); };

async function checkChannel(channelID) {
  const result = await BridgedChannel.findOne({ attributes: ['channelID'], where: { channelID } }).catch(errHander);
  return result;
}

async function getMessageInstance(messageID) {
  const result = await MessageLink.findOne({ attributes: ['messageInstanceID'], where: { messageID } }).catch(errHander);
  return result;
}

async function getDBMessages(messageInstanceID) {
  const result = await MessageLink.findAll({ attributes: ['messageID', 'channelID'], where: { messageInstanceID } }).catch(errHander);
  return result;
}

function deleteDBMessage(messageInstanceID) {
  MessageLink.destroy({ where: { messageInstanceID } });
}

async function getMessages(messageID) {
  // check DB for messageID and get messageInstanceID
  const messageInstanceID = await getMessageInstance(messageID);
  if (!messageInstanceID) return null;
  // get all messageIDs
  const coreID = messageInstanceID.messageInstanceID;
  const allMessageIDs = await getDBMessages(coreID);
  deleteDBMessage(coreID);
  return allMessageIDs;
}

// Deletes all messages in every channel, if its deleted in one
module.exports.run = async (client, message, config) => {
  // check if channel is part of service
  if (!await checkChannel(message.channel_id)) return;

  const allMessageIDs = await getMessages(message.id);
  if (!allMessageIDs) return;

  // TODO: check if message is deleted by bot: causes a loop
  // TODO: [REQUIERES MESSAGE MANAGING PERMISSIONS]
  // for each loop [
  //  delete DB entry
  // ]
  allMessageIDs.forEach((entry) => {
    if (message.id === entry.messageID) return;
    const channel = client.channels.find((channel) => channel.id === entry.channelID);
    const targetMessage = channel.fetchMessage(entry.messageID);
    targetMessage.delete();
    // check if message excists: check channel permissions: delete
    // TODO: check channel permissions
  });
};

module.exports.help = {
  name: 'EVENT_messageDelete',
};
