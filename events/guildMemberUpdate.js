const BlacklistUserDB = require("../db/blacklistuser");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {
    try {
      // Get all roles for the user
      const userRoles = newMember.roles.cache;

      // Check each role the user has
      for (const [roleId, role] of userRoles) {
        // Check if user is blacklisted from this specific role
        const isRoleBlacklisted = await BlacklistUserDB.isBlacklistedFromRole(
          newMember.guild.id,
          newMember.id,
          roleId
        );

        // Remove role if blacklisted
        if (isRoleBlacklisted) {
          try {
            await newMember.roles.remove(roleId);
          } catch (removeError) {
            console.error("Error removing blacklisted role:", removeError);
          }
        }
      }
    } catch (error) {
      console.error("Blacklist Role Check Error:", error);
    }
  },
};
