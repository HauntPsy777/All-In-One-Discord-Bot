const { EmbedBuilder } = require("discord.js");
const antiTokenDB = require("../db/tokenDB");

module.exports = {
  async detectAndPunish(client, user) {
    const guild = client.guilds.cache.get(user.guild.id);
    if (!guild) {
      console.error("❌ Guild not found.");
      return;
    }

    // Get Anti-Token settings
    const settings = await antiTokenDB.getSettings(guild.id);
    if (!settings || !settings.is_enabled) {
      console.log("🛑 Anti-Token system is disabled for this guild.");
      return;
    }

    const logChannel = guild.channels.cache.get(settings.log_channel);
    if (!logChannel) {
      console.error("❌ Log channel not found.");
      return;
    }

    // Define punishment (Kick, Ban, Timeout)
    const punishment = settings.punishment || "Kick"; // Default to Kick if not specified
    const timeoutDuration = settings.timeout_duration || 30; // Default to 30 days if not specified

    // Timeout duration (in milliseconds)
    const timeoutUntil = Date.now() + timeoutDuration * 24 * 60 * 60 * 1000;

    // Apply punishment
    try {
      const member = guild.members.cache.get(user.id);
      if (!member) {
        console.error("❌ Member not found in the guild.");
        return;
      }

      if (punishment === "Kick") {
        await member.kick("Token compromised.");
      } else if (punishment === "Ban") {
        await member.ban({ reason: "Token compromised" });
      } else if (punishment === "Timeout") {
        await member.timeout(timeoutUntil, "Token compromised");
      } else {
        console.error("❌ Invalid punishment type specified.");
        return;
      }
    } catch (err) {
      console.error("❌ Error applying punishment:", err);
      return;
    }

    // Log the violation in the database
    await antiTokenDB.logTokenViolation(user.id, guild.id, timeoutUntil, punishment);

    // Create embed log
    const logEmbed = new EmbedBuilder()
      .setTitle("🚨 **Token Violation Detected!**")
      .setDescription(`A token-compromised user has been detected and **${punishment}**.`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 User", value: `<@${user.id}>`, inline: true },
        { name: "🆔 User ID", value: `\`${user.id}\``, inline: true },
        { name: "⏳ Punishment", value: `**${punishment}**`, inline: true },
        { name: "📅 Time of Detection", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: "📌 Server", value: `${guild.name} (\`${guild.id}\`)`, inline: true }
      )
      .setColor("Red")
      .setTimestamp();

    // Send the embed log to the configured log channel
    try {
      await logChannel.send({ embeds: [logEmbed] });
    } catch (err) {
      console.error("❌ Error sending log embed:", err);
    }
  }
};