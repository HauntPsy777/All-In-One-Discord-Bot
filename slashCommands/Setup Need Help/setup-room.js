const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	EmbedBuilder,
	ChannelType,
  } = require("discord.js");
  
  const RoomSetupDB = require("../../db/room-setup-db");
  
  module.exports = {
	data: new SlashCommandBuilder()
	  .setName("setup-need-help")
	  .setDescription("Setup the room creation system")
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	  .addChannelOption((option) =>
		option
		  .setName("log_channel")
		  .setDescription("Select the channel for system logs")
		  .setRequired(true)
		  .addChannelTypes(ChannelType.GuildText)
	  )
	  .addRoleOption((option) =>
		option
		  .setName("staff_role")
		  .setDescription("Select the staff role for room management")
		  .setRequired(true)
	  )
	  .addRoleOption((option) =>
		option
		  .setName("unverified_role")
		  .setDescription("Select the unverified role for room system")
		  .setRequired(true)
	  )
	  .addChannelOption((option) =>
		option
		  .setName("room_category")
		  .setDescription("Select the category for personal rooms")
		  .setRequired(true)
		  .addChannelTypes(ChannelType.GuildCategory)
	  )
	  .addChannelOption((option) =>
		option
		  .setName("join_channel")
		  .setDescription("Select the voice channel for room creation")
		  .setRequired(true)
		  .addChannelTypes(ChannelType.GuildVoice)
	  ),
  
	async execute(interaction) {
	  try {
		await interaction.deferReply({ ephemeral: true });
  
		const guild = interaction.guild;
  
		// Retrieve options
		const logChannel = interaction.options.getChannel("log_channel");
		const staffRole = interaction.options.getRole("staff_role");
		const unverifiedRole = interaction.options.getRole("unverified_role");
		const roomCategory = interaction.options.getChannel("room_category");
		const joinChannel = interaction.options.getChannel("join_channel");
  
		// Validate inputs
		if (!logChannel || !staffRole || !unverifiedRole || !roomCategory || !joinChannel) {
		  return interaction.editReply({
			embeds: [
			  new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle("❌ Setup Error")
				.setDescription(
				  "Please ensure you have selected all required roles and channels."
				)
				.setTimestamp(),
			],
			ephemeral: true,
		  });
		}
  
		// Ensure the bot has permission to manage channels and roles
		if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
		  return interaction.editReply({
			embeds: [
			  new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle("❌ Permission Error")
				.setDescription(
				  "I need the `Manage Channels` permission to set up the room system."
				)
				.setTimestamp(),
			],
			ephemeral: true,
		  });
		}
  
		if (!logChannel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
		  return interaction.editReply({
			embeds: [
			  new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle("❌ Permission Error")
				.setDescription(
				  "I don't have permission to send messages in the selected logs channel."
				)
				.setTimestamp(),
			],
			ephemeral: true,
		  });
		}
  
		const settings = {
		  log_channel: logChannel.id,
		  staff_role: staffRole.id,
		  unverified_role: unverifiedRole.id,
		  room_category: roomCategory.id,
		  join_channel: joinChannel.id,
		};
  
		// Save settings to database
		await RoomSetupDB.setSettings(guild.id, settings);
  
		// Create confirmation embed
		const embed = new EmbedBuilder()
		  .setColor(0x2b2d31)
		  .setTitle("Room Creation System Setup")
		  .setDescription(
			`✅ **Successfully configured the room creation system!**\n\n` +
			  `**Configuration Details:**\n` +
			  `➜ Log Channel: <#${settings.log_channel}>\n` +
			  `➜ Staff Role: <@&${settings.staff_role}>\n` +
			  `➜ Unverified Role: <@&${settings.unverified_role}>\n` +
			  `➜ Room Category: <#${settings.room_category}>\n` +
			  `➜ Join Channel: <#${settings.join_channel}>`
		  )
		  .setTimestamp()
		  .setFooter({
			text: guild.name,
			iconURL: guild.iconURL({ dynamic: true }),
		  });
  
		// Log to specified log channel
		const logEmbed = new EmbedBuilder()
		  .setColor(0x2b2d31)
		  .setTitle("Room System Updated")
		  .setDescription(
			`**Updated by:** ${interaction.user}\n` +
			  `**Action:** Setup Room Creation System\n\n` +
			  `**New Configuration:**\n` +
			  `➜ Log Channel: <#${settings.log_channel}>\n` +
			  `➜ Staff Role: <@&${settings.staff_role}>\n` +
			  `➜ Unverified Role: <@&${settings.unverified_role}>\n` +
			  `➜ Room Category: <#${settings.room_category}>\n` +
			  `➜ Join Channel: <#${settings.join_channel}>`
		  )
		  .setTimestamp();
  
		await logChannel.send({ embeds: [logEmbed] });
  
		// Reply to interaction
		await interaction.editReply({
		  embeds: [embed],
		  ephemeral: true,
		});
	  } catch (error) {
		console.error("Setup Room Error:", error);
  
		const errorEmbed = new EmbedBuilder()
		  .setColor(0xff0000)
		  .setTitle("❌ Error")
		  .setDescription(
			"An error occurred while setting up the room system. " +
			  "Please check the channel and role permissions and try again."
		  )
		  .setTimestamp();
  
		await interaction.editReply({
		  embeds: [errorEmbed],
		  ephemeral: true,
		});
	  }
	},
  };