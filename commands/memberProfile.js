import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Displays a user's server profile")
    .addUserOption(option =>
        option
            .setName("user")
            .setDescription("The user to get the profile for (defaults to you)")
            .setRequired(false)
    );

export async function execute(interaction) {
    // Get the target user (either specified or the command user)
    const target = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(target.id);

    // Calculate account age
    const createdDate = target.createdAt;
    const joinedDate = member.joinedAt;
    const now = new Date();
    const accountAge = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const serverAge = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));

    // Get user roles (excluding @everyone)
    const roles = member.roles.cache
        .filter(role => role.name !== "@everyone")
        .map(role => role.name)
        .join(", ") || "No roles";

    // Create the embed
    const profileEmbed = new EmbedBuilder()
        .setColor(member.displayHexColor || "#0099ff")
        .setTitle(`${target.username}'s Server Profile`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
            { 
                name: "Basic Info", 
                value: `Username: ${target.tag}`, 
                inline: true 
            },
            { 
                name: "Account Age", 
                value: `Created: ${createdDate.toDateString()}\n(${accountAge} days ago)`, 
                inline: true 
            },
            { 
                name: "Server Membership", 
                value: `Joined: ${joinedDate.toDateString()}\n(${serverAge} days ago)`, 
                inline: true 
            },
            { 
                name: "Roles", 
                value: roles, 
                inline: false 
            },
            { 
                name: "Status", 
                value: member.presence?.status || "Offline", 
                inline: true 
            },
            { 
                name: "Activity", 
                value: member.presence?.activities[0]?.name || "None", 
                inline: true 
            }
        )
        .setTimestamp()
        .setFooter({ 
            text: `Requested by ${interaction.user.username}`, 
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
        });

    // Send the embed
    await interaction.reply({ embeds: [profileEmbed] });
}