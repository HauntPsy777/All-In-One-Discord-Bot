const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
  } = require("discord.js");
  
  module.exports = {
	name: "help",
	aliases: ["h"], // Aliases for the command
	description: "Displays server information or specific help topics.",
	cooldown: 5,
	async execute(message, args) {
	  const guildAvatar = message.guild.iconURL();
  
	  // Guide for correct usage
	  if (args.length > 1) {
		const guideEmbed = new EmbedBuilder()
		  .setColor("#ff0000")
		  .setTitle("Command Usage Guide")
		  .setDescription(
			"**Usage:** `&help [category]`\n\n**Examples:**\n`&help` - Show all categories\n`&help admin` - Show admin commands\n`&help economy` - Show economy commands"
		  );
		return message.reply({ embeds: [guideEmbed] });
	  }
  
	  if (!args.length) {
		const infoEmbed = new EmbedBuilder()
		.setColor("Random")
		.setDescription(
		  `> The **help** command is your ultimate guide to navigating and utilizing all the features of this bot. Whether you're looking for a specific command, exploring categories, or learning how to use the bot effectively, this command has you covered.\n\n` +
		  `> <:c_:1342221823084859444> **Key Features:**\n` +
		  `> • **Category Overview**: View all available command categories at a glance.\n` +
		  `> • **Interactive Buttons**: Click buttons to explore commands in each category effortlessly.\n` +
		  `> • **Detailed Guides**: Get detailed explanations and usage examples for every command.\n\n` +
		  `> <:c_:1342221823084859444> **Why Use This Command?**\n` +
		  `> • **Ease of Use**: Intuitive and user-friendly interface.\n` +
		  `> • **Comprehensive**: Covers all bot commands and features.\n` +
		  `> • **Interactive**: Buttons make navigation seamless and fun.`
		)
		  .addFields({
			name: "<:linkceli:1336674962424987679>・ Links",
			value:
			  "[<:emoji_53:1335402316769267805> Support](https://discord.gg/skfRgxSh) | [Invite Me](https://discord.com/oauth2/authorize?client_id=1334545373615755328&permissions=8&integration_type=0&scope=bot)",
			inline: true,
		  })
		  .setThumbnail(guildAvatar)
		  .setAuthor({
			name: `${message.guild.name} ・Help Commands`,
			iconURL: guildAvatar,
			url: "https://discord.gg/skfRgxSh",
		  });
  
		  const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
			  .setCustomId("help-admin")
			  .setLabel("Admin")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:added_emoji:1335402521015091281>"),
			new ButtonBuilder()
			  .setCustomId("help-verify")
			  .setLabel("Verification")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:check:1335402216659488851>"),
			new ButtonBuilder()
			  .setCustomId("help-security")
			  .setLabel("Security")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:Security:1335402497157894197>"),
			new ButtonBuilder()
			  .setCustomId("help-info")
			  .setLabel("Info")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:info:1335406963655315507>"),
			new ButtonBuilder()
			  .setCustomId("help-fun")
			  .setLabel("Fun")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:jett_fun:1340393051729690664>")
		  );
		  
		  const buttons2 = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
			  .setCustomId("help-warn")
			  .setLabel("Warn")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:warning_26a0fe0f:1335402182177984654>"),
			new ButtonBuilder()
			  .setCustomId("help-jail")
			  .setLabel("Jail")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:ejected:1335402459224342540>"),
			new ButtonBuilder()
			  .setCustomId("help-autorole")
			  .setLabel("Autorole")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:Autorole_:1340391803622527097>"),
			new ButtonBuilder()
			  .setCustomId("help-economy")
			  .setLabel("Economy")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:economy:1340391684286054532>"),
			new ButtonBuilder()
			  .setCustomId("help-voicemod")
			  .setLabel("Voicemod")
			  .setStyle(ButtonStyle.Secondary) // Changed to gray
			  .setEmoji("<:fum:1335402284682711102>")
		  );
  
		const reply = await message.reply({
		  embeds: [infoEmbed],
		  components: [buttons, buttons2],
		});
  
		const filter = (interaction) =>
		  interaction.isButton() && interaction.user.id === message.author.id;
  
		const collector = reply.createMessageComponentCollector({
		  filter,
		  time: 60000,
		});
  
		collector.on("collect", async (interaction) => {
		  await interaction.deferUpdate();
		  let categoryEmbed;
  
		  switch (interaction.customId) {
			case "help-admin":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Admin Commands")
				.setDescription(
				  "`&ban <UserId>` - Ban a user.\n" +
				  "`&kick <UserId>` - Kick a user.\n" +
				  "`&add <Role/User>` - Add a role or user to the channel permissions.\n" +
				  "`/addemoji <Name> <Emoji>` - Add emoji to the server.\n" +
				  "`&blacklistedchannel` - Manage blacklisted channels.\n" +
				  "`&boosters` - A list of current boosters.\n" +
				  "`&clear <Number>` - Clear messages based on criteria.\n" +
				  "`&deny <Role/User>` - Deny a role or user from the channel permissions.\n" +
				  "`/embed` <Json> - Make an embed using discohook.org.\n" +
				  "`&hide` - Hide channel from everyone.\n" +
				  "`&list` - Show list of admins, bots, users, or users by ID.\n" +
				  "`&lock` - Disables @everyone from sending messages in a channel.\n" +
				  "`&show` - Show channel to everyone.\n" +
				  "`&timelock` - Time lock the channel.\n" +
				  "`&unlock` - Allows @everyone to send messages in a channel."
				);
			  break;
			case "help-verify":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Verification Commands")
				.setDescription(
				  "`&setrolegirl` - Set the Verified Female role.\n" +
				  "`&tapverif` - Panel To Verify User With Buttons.\n" +
				  "`&verificator` - Add/remove roles from verificator.\n" +
				  "`&verifiedrole` - Set the jail role.\n" +
				  "`&veriflogs` - Set the verification logs channel.\n" +
				  "`&vb` - Verify A Member In Your Server.\n" +
				  "`&vg` - Verify A Female In Your Server.\n" +
				  "`/setup-verif` - Setup Verification."
				);
			  break;
			case "help-security":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Security Commands")
				.setDescription(
				  "`&antibots` - Turn On/Off Anti-Bots.\n" +
				  "`&antiweebhook` - Turn On/Off Anti-Webhooks.\n" +
				  "`&anti-link` - Manage Anti-Links.\n" +
				  "`&antilink-role` - Turn On/Off Anti-Webhooks.\n" +
				  "`&antilink-role-list` - List Anti-Link roles."
				);
			  break;
			case "help-info":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Info Commands")
				.setDescription(
				  "`&as` - Show Custom Avatar of a Member.\n" +
				  "`&avatar` - Show The Global Avatar For The Member.\n" +
				  "`&avatarserver` - Show Server Avatar.\n" +
				  "`&banner` - Show User Banner.\n" +
				  "`&channelinfo` - Show Channel Info.\n" +
				  "`&checkpremium` - Check premium status of the current guild.\n" +
				  "`&checkvanity` - Check if a vanity URL is available.\n" +
				  "`&emojiinfo` - Show Emoji Info.\n" +
				  "`&firstmsj` - Show first message sent in the chat.\n" +
				  "`&getinvite` - Get Invite For A Bot.\n" +
				  "`&invimage` - Show Server Invite Image.\n" +
				  "`&invite` - Get Bot Invite.\n" +
				  "`&inviteinfo` - Show Invite Info.\n" +
				  "`&invites` - Show How Many Invites.\n" +
				  "`&membercount` - Show Member Count.\n" +
				  "`&ping` - Show Latency & Shard Bot.\n" +
				  "`&roleinfo` - Show Role Info.\n" +
				  "`&serverbanner` - Show Server Banner.\n" +
				  "`&serverinfo` - Show Server Info.\n" +
				  "`&tag` - Show Command Aliases & Info.\n" +
				  "`&user` - Show User Info."
				);
			  break;
			case "help-fun":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Fun Commands")
				.setDescription(
				  "`&8ball` - Ask the 8ball a question.\n" +
				  "`&afk` - Set your AFK status.\n" +
				  "`&cat` - Show a random cat picture.\n" +
				  "`&cringe` - Display a cringe message.\n" +
				  "`&cry` - Cry alone or to someone.\n" +
				  "`&cuddle` - Cuddle with someone.\n" +
				  "`&dance` - Dance.\n" +
				  "`&drake` - Drake meme.\n" +
				  "`&gendre` - Show the user's gender.\n" +
				  "`&hack` - Pretend to hack.\n" +
				  "`&happy` - Express happiness.\n" +
				  "`&howgay` - Check how gay someone is.\n" +
				  "`&hug` - Hug someone.\n" +
				  "`&kill` - Pretend to kill.\n" +
				  "`&kiss` - Kiss someone.\n" +
				  "`&love` - Calculate the love percentage between two users.\n" +
				  "`&missyou` - Miss someone.\n" +
				  "`&roll` - Roll a dice.\n" +
				  "`&slape` - Slap a user.\n" +
				  "`&smile` - Smile at someone.\n" +
				  "`&waifu` - Show a random waifu picture (NSFW)."
				);
			  break;
			case "help-warn":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Warn Commands")
				.setDescription(
				  "`&warn <User> <Reason>` - Warn a user.\n" +
				  "`&warnings <User>` - Show warnings of a user.\n" +
				  "`&resetwarn <User>` - Reset warnings of a user."
				);
			  break;
			case "help-jail":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Jail Commands")
				.setDescription(
				  "`&case <User>` - Check who jailed a user and the reason.\n" +
				  "`&hammer <Role/User>` - Add, remove, or show roles from hammers.\n" +
				  "`&jail <User>` - Jail a user.\n" +
				  "`&jaillogs <Channel>` - Set the jail logs channel.\n" +
				  "`&jailrole <Role>` - Set the jail role.\n" +
				  "`&resetjail` - Clear the jail description.\n" +
				  "`&unjail <User>` - Unjail a user."
				);
			  break;
			case "help-autorole":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Autorole Commands")
				.setDescription(
				  "`&setautorole <Role>` - Set an autorole for new members.\n" +
				  "`&removeautorole <Role>` - Remove an autorole."
				);
			  break;
			case "help-economy":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("Economy Commands")
				.setDescription(
				  "`&bal` - Check your balance.\n" +
				  "`&daily` - Add money to a user.\n" +
				  "`&transfer @User <Amount>` - Transfer Coins to another user.\n" +
				  "`&shop` - Show the economy shop.\n" +
				  "`&top` - To Show the Top 10 Users with the Most Credits."
				);
			  break;
			case "help-voicemod":
			  categoryEmbed = new EmbedBuilder()
				.setColor("Random")
				.setTitle("VoiceMod Commands")
				.setDescription(
				  "`&activity` - Enable or disable activity in the channel.\n" +
				  "`&cam` - Enable or disable Cam in the channel.\n" +
				  "`&vdeafen` - Voice Deafen a member.\n" +
				  "`&find` - Find a member in voice.\n" +
				  "`&sb` - Enable or disable SoundBoard in the channel.\n" +
				  "`&vundeafen` - Voice Undeafen a member.\n" +
				  "`&vc` - Show Voice & Server Stats.\n" +
				  "`&vkick` - Voice Kick a member out of the voice channel.\n" +
				  "`&vclist` - Show list of members connected in voice.\n" +
				  "`&vmute` - Voice Mute a member.\n" +
				  "`&vunmute` - Voice Unmute a member."
				);
			  break;
		  }
  
		  await interaction.followUp({ embeds: [categoryEmbed], ephemeral: true });
		});
  
		collector.on("end", () => {
		  reply.edit({ components: [] }); // Remove the buttons after timeout
		});
	  }
	},
  };