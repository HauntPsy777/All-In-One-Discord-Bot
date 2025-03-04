const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const VerificationDB = require("../../db/verified-db");

module.exports = {
  name: "verify-girl",
  aliases: ["vg"],
  usage: "verify-girl <@user/userID>",
  description: "Verify a user as female.\nUsage: `verify-girl <@user/userID>`",
  async execute(message, args) {
    try {
      // If no arguments are provided, show the command usage guide
      if (!args[0]) {
        const usageEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setDescription(
            `**How to use the command:**\n\`&verify-girl <@user/userID>\`\nExample: \`&verify-girl @User\``
          );

        return message.reply({ embeds: [usageEmbed] });
      }

      // Get the target user from mentions or ID
	  const target =
	  message.mentions.members.first() ||
	  (await message.guild.members.fetch(args[0]).catch(() => null)); // Fixed
	
	if (!target) {
	  const embed = new EmbedBuilder()
		.setDescription("❌ Please mention a user or provide their ID!")
		.setColor(0xff0000); // Red color for errors
	  return message.channel.send({ embeds: [embed] });
	}

      if (!target) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription("❌ Please mention a valid user or provide their ID!"),
          ],
        });
      }

      // Check if the user is already verified
      const isVerified = await VerificationDB.isVerified(
        message.guild.id,
        target.id
      );

      if (isVerified) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription(`❌ ${target} is already verified!`),
          ],
        });
      }

      // Check if the user is blacklisted
      const isBlacklisted = await VerificationDB.isBlacklisted(
        message.guild.id,
        target.id
      );

      if (isBlacklisted) {
        const blacklistReason = await VerificationDB.getBlacklistReason(
          message.guild.id,
          target.id
        );

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription(
                `❌ This user is blocked from verification${
                  blacklistReason ? ` with reason: ${blacklistReason}` : ""
                }!`
              ),
          ],
        });
      }

      // Get verification roles from the database
      const roles = await VerificationDB.getRoles(message.guild.id);
      if (!roles) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription("❌ Verification system is not set up in this server!"),
          ],
        });
      }

      // Check if the command executor has the required permissions or roles
      const hasVerificatorRole = message.member.roles.cache.has(
        roles.verificator_role
      );
      const hasManageRoles = message.member.permissions.has(
        PermissionFlagsBits.ManageRoles
      );

      if (!hasVerificatorRole && !hasManageRoles) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription(
                "❌ You need Manage Roles permission or Verificator role to use this command!"
              ),
          ],
        });
      }

      // Get verified and unverified roles
      const verifiedRole = message.guild.roles.cache.get(roles.verified_role);
      const verifiedFemaleRole = message.guild.roles.cache.get(
        roles.verified_female_role
      );
      const unverifiedRole = message.guild.roles.cache.get(
        roles.unverified_role
      );

      if (!verifiedRole || !verifiedFemaleRole || !unverifiedRole) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription(
                "❌ Some verification roles are missing. Please check the setup!"
              ),
          ],
        });
      }

      // Add verified roles and remove unverified role
      await target.roles.add([verifiedRole.id, verifiedFemaleRole.id]);
      await target.roles.remove(unverifiedRole);

      // Add user to the verified database
      try {
        await VerificationDB.addVerifiedUser(
          message.guild.id,
          target.id,
          target.user.username,
          message.author.id,
          "female"
        );
      } catch (dbError) {
        console.error("Database Error (Add Verified User):", dbError);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription("❌ An error occurred while adding the user to the verified database."),
          ],
        });
      }

      // Send a DM to the user
      const dmEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setAuthor({
          name: `${message.guild.name}`,
          iconURL: message.guild.iconURL({ dynamic: true }),
        })
        .setDescription(`> <a:Yes:1335402083591127053> You Are Verified In Server ${message.guild.name}`)
        .addFields(
          { name: "Server:", value: `> ${message.guild.name}` },
        )
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setTimestamp();

      try {
        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log("Could not DM the user.");
      }

      // Send a success message
      const successEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setDescription(`✅ ${target} has been successfully verified as female.`);

      await message.reply({ embeds: [successEmbed] });

      // Log the verification in the logs channel
      const logChannel = message.guild.channels.cache.get(
        roles.verification_logs
      );
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setAuthor({
            name: `Member Has Been Verified`,
            iconURL: message.guild.iconURL({ dynamic: true }),
          })
          .setThumbnail(target.displayAvatarURL({ dynamic: true }))
          .setColor(0x2b2d31)
          .setDescription(
            `
✅ ${target} has been successfully verified.

**Verified User:**
${target} | ${target.id}

**Type Verification:**
\`Female\`

**Verified By:**
${message.author} | ${message.author.id}`
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error("Verify Girl Error:", error);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription("❌ An error occurred while verifying the user. Please check my permissions and try again."),
        ],
      });
    }
  },
};