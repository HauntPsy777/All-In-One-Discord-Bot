const {
	EmbedBuilder,
	PermissionsBitField,
	ChannelType,
  } = require("discord.js");
  
  module.exports = {
	name: "move",
	description: "Move a user to a specified voice channel.\nUsage: `move <@user/userID> <#channel/channelID>`",
	async execute(message, args) {
	  // Ensure the user has the required permissions
	  if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
		return message.reply({
		  embeds: [
			new EmbedBuilder()
			  .setDescription('❌ You need the "Move Members" permission to use this command.')
			  .setColor("Red"),
		  ],
		});
	  }
  
	  // Ensure the bot has the required permissions
	  if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
		return message.reply({
		  embeds: [
			new EmbedBuilder()
			  .setDescription('❌ I need the "Move Members" permission to move users to voice channels.')
			  .setColor("Red"),
		  ],
		});
	  }
  
	  // Validate the user mention or ID
	  const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
	  if (!target) {
		return message.reply({
		  embeds: [
			new EmbedBuilder()
			  .setDescription('❌ Please mention a user or provide their user ID to move.')
			  .setColor("Red"),
		  ],
		});
	  }
  
	  // Ensure the target user is in a voice channel
	  if (!target.voice.channel) {
		return message.reply({
		  embeds: [
			new EmbedBuilder()
			  .setDescription(`❌ ${target.user.tag} is not in a voice channel to be moved.`)
			  .setColor("Red"),
		  ],
		});
	  }
  
	  // Validate the target voice channel mention or ID
	  const targetChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
	  if (!targetChannel || targetChannel.type !== ChannelType.GuildVoice) {
		return message.reply({
		  embeds: [
			new EmbedBuilder()
			  .setDescription('❌ Please mention a valid voice channel or provide its ID.')
			  .setColor("Red"),
		  ],
		});
	  }
  
	  // Move the member to the specified voice channel
	  try {
		await target.voice.setChannel(targetChannel);
		const successEmbed = new EmbedBuilder()
		  .setDescription(`✅ Successfully moved **${target.user.tag}** to the voice channel **${targetChannel.name}**.`)
		  .setColor("Green");
  
		await message.reply({ embeds: [successEmbed] });
  
		// Log the move action in a specified log channel
		const logChannel = message.guild.channels.cache.find(ch => ch.name === 'mod-logs');
		if (logChannel) {
		  const logEmbed = new EmbedBuilder()
			.setTitle('User Moved')
			.setDescription(`
  **Moved By:** ${message.author} (${message.author.id})
  **User:** ${target.user.tag} (${target.id})
  **From Channel:** ${target.voice.channel.name} (${target.voice.channel.id})
  **To Channel:** ${targetChannel.name} (${targetChannel.id})
			`)
			.setTimestamp();
  
		  logChannel.send({ embeds: [logEmbed] });
		}
	  } catch (err) {
		console.error("Error moving user:", err);
		return message.reply({
		  embeds: [
			new EmbedBuilder()
			  .setDescription('❌ An error occurred while moving the user. Please check my permissions and try again.')
			  .setColor("Red"),
		  ],
		});
	  }
	},
  };