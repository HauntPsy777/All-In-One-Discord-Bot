const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	EmbedBuilder,
	ChannelType,
  } = require("discord.js");
  const JailDB = require("../../db/jail-db");
  
  module.exports = {
	data: new SlashCommandBuilder()
	  .setName("setup_jail")
	  .setDescription("Setup the jail system")
	  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	  .addRoleOption((option) =>
		option
		  .setName("role_hammer")
		  .setDescription("Select the role for users who can jail others")
		  .setRequired(true)
	  )
	  .addRoleOption((option) =>
		option
		  .setName("role_jailed")
		  .setDescription("Select the role for jailed users")
		  .setRequired(true)
	  )
	  .addChannelOption((option) =>
		option
		  .setName("logs_channel")
		  .setDescription("Select the jail logs channel")
		  .setRequired(true)
	  ),
  
	async execute(interaction) {
	  try {
		await interaction.deferReply({ ephemeral: true });
  
		// Retrieve options
		const jailerRole = interaction.options.getRole("role_hammer");
		const jailedRole = interaction.options.getRole("role_jailed");
		const jailLogsChannel = interaction.options.getChannel("logs_channel");
  
		// Validate inputs
		if (!jailerRole || !jailedRole || !jailLogsChannel) {
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
  
		// Ensure the logs channel is a text channel
		if (jailLogsChannel.type !== ChannelType.GuildText) {
		  return interaction.editReply({
			embeds: [
			  new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle("❌ Invalid Channel")
				.setDescription("The logs channel must be a text channel.")
				.setTimestamp(),
			],
			ephemeral: true,
		  });
		}
  
		const guild = interaction.guild;
  
		// Permission checks
		if (!jailLogsChannel.permissionsFor(guild.members.me).has("SendMessages")) {
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
  
		if (!guild.members.me.permissions.has("ManageRoles")) {
		  return interaction.editReply({
			embeds: [
			  new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle("❌ Permission Error")
				.setDescription(
				  "I need the `Manage Roles` permission to assign and manage jailed roles."
				)
				.setTimestamp(),
			],
			ephemeral: true,
		  });
		}
  
		const jailSettings = {
		  guild_id: guild.id,
		  jailer_role_id: jailerRole.id,
		  jailed_role_id: jailedRole.id,
		  logs_channel_id: jailLogsChannel.id,
		};
  
		// Save settings to database
		await JailDB.saveSettings(
		  guild.id,
		  jailSettings.jailer_role_id,
		  jailSettings.jailed_role_id,
		  jailSettings.logs_channel_id
		);
  
		// Confirmation Embed
		const embed = new EmbedBuilder()
		  .setColor(0x2b2d31)
		  .setTitle("✅ Jail System Setup")
		  .setDescription(
			`The jail system has been successfully configured!
  
			**Roles Configuration:**
			🔹 Jailer Role: <@&${jailSettings.jailer_role_id}>
			🔹 Jailed Role: <@&${jailSettings.jailed_role_id}>
  
			**Logs Configuration:**
			📢 Jail Logs Channel: <#${jailSettings.logs_channel_id}>`
		  )
		  .setTimestamp()
		  .setFooter({
			text: guild.name,
			iconURL: guild.iconURL({ dynamic: true }),
		  });
  
		// Log Embed
		const logEmbed = new EmbedBuilder()
		  .setColor(0x2b2d31)
		  .setTitle("🔒 Jail System Updated")
		  .setDescription(
			`**Updated by:** ${interaction.user}
			**Action:** Setup Jail System
  
			**New Configuration:**
			🔹 Jailer Role: <@&${jailSettings.jailer_role_id}>
			🔹 Jailed Role: <@&${jailSettings.jailed_role_id}>`
		  )
		  .setTimestamp();
  
		// Send log message
		await jailLogsChannel.send({ embeds: [logEmbed] });
  
		// Reply to user
		await interaction.editReply({ embeds: [embed], ephemeral: true });
	  } catch (error) {
		console.error("Setup Jail Error:", error);
  
		await interaction.editReply({
		  embeds: [
			new EmbedBuilder()
			  .setColor(0xff0000)
			  .setTitle("❌ Error")
			  .setDescription(
				"An unexpected error occurred while setting up the jail system. Please check my permissions and try again."
			  )
			  .setTimestamp(),
		  ],
		  ephemeral: true,
		});
	  }
	},
  };