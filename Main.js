const {
  Client,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const {
  TOKEN,
  COMMAND,
  SCAN_NAME
} = require('./Config.json');

const functions = require('./Functions/Functions');
let supportedAnimes;

(async () => {
  try {
    const bot = new Client(
      {
        intents: 3276799,
        allowedMentions: { parse: ["users"] }
      }
    );

    bot.scans = new Map();

    supportedAnimes = await functions.fetchScans();

    bot.login(TOKEN);

    //Events
    bot.on('ready', () => console.log(`${bot.user.tag} connecté !`));

    //Commandes
    bot.on('messageCreate', async message => {
      const content = message.content.split(" ");
      const command_name = content.shift();

      if(COMMAND[0] === command_name) {
        let chapterID = content[0] || null;
        if(chapterID) chapterID = parseInt(chapterID);
        if(!chapterID || isNaN(chapterID) || chapterID <= 0) return;

        let chapterName = content.slice(1).join(" ");
        if(!chapterName || (!SCAN_NAME[chapterName] && !supportedAnimes.includes(chapterName))) return;
        if(SCAN_NAME[chapterName]) chapterName = SCAN_NAME[chapterName];
        
        const images = await functions.fetchScan(chapterName, chapterID);
        if(!images) return;

        bot.scans.set(`${chapterName}/${chapterID}`, images);
        return message.reply(
          {
            content: `➜ \`${chapterName}\` - \`${chapterID}\`\n➜ \`1/${images.length}\``,
            files: [new AttachmentBuilder(images[0])],
            components: [
              new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("oldPage")
                .setLabel("Page précédente")
                .setDisabled(true)
                .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                .setCustomId("newPage")
                .setLabel("Prochaine Page")
                .setDisabled(images.length <= 1)
                .setStyle(ButtonStyle.Secondary)
              )
            ]
          }
        )
      };

      if(COMMAND[1] === command_name) return message.reply(
        {
          embeds: [
            {
              color: 0x2b2d31,
              description: `\`\`\`\n1${supportedAnimes.map(scan_name => scan_name).join("\n")}\`\`\``
            }
          ]
        }
      );
    });
    
    bot.on('interactionCreate', interaction => {
      if(!interaction.guild || !interaction.member || !interaction.isButton() || !["oldPage", "newPage"].includes(interaction.customId)) return;
      
      const message = interaction.message.content.split("`");
      let scan_data = {
        name: message[1],
        id: message[3],
        actual_page: null,
        max_page: null
      };

      const scan_images = bot.scans.get(`${scan_data.name}/${scan_data.id}`);
      if(!scan_images) return;

      const page_data = message[5]?.split("/");
      scan_data.actual_page = parseInt(page_data[0]);
      scan_data.max_page = parseInt(page_data[1]);

      if(interaction.customId === "oldPage") scan_data.actual_page--;
      else scan_data.actual_page++;

      return interaction.update(
        {
          content: `➜ \`${scan_data.name}\` - \`${scan_data.id}\`\n➜ \`${scan_data.actual_page}/${scan_data.max_page}\``,
          files: [new AttachmentBuilder(scan_images[scan_data.actual_page - 1])],
          components: [
            new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId("oldPage")
              .setLabel("Page précédente")
              .setDisabled(scan_data.actual_page === 1)
              .setStyle(ButtonStyle.Secondary),

              new ButtonBuilder()
              .setCustomId("newPage")
              .setLabel("Prochaine Page")
              .setDisabled(scan_data.actual_page === scan_data.max_page)
              .setStyle(ButtonStyle.Secondary)
            )
          ]
        }
      )
    });
  } catch (error) {
    console.log(error);
  };
})();