const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const spam = new Map();

client.once("ready", () => {
  console.log(`Bot online als ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const now = Date.now();
  const userMessages = spam.get(message.author.id) || [];

  const recent = userMessages.filter(time => now - time < 5000);
  recent.push(now);
  spam.set(message.author.id, recent);

  // Mehr als 5 Nachrichten innerhalb von 5 Sekunden = Spam
  if (recent.length >= 6) {
    try {
      await message.channel.bulkDelete(6, true);

      await message.channel.send(
        `⚠️ ${message.author} Bitte keinen Spam senden.`
      ).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    } catch (error) {
      console.error(error);
    }

    spam.delete(message.author.id);
  }
});

client.login(process.env.DISCORD_TOKEN);
