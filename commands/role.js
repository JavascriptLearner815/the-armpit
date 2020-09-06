module.exports = {
    name: 'role',
    description: 'Gives a member a role.',
    args: true,
    usage: '<user> <role> [reason]',
    cooldown: 1,
    execute(message, args) {
        const member = message.mentions.members.first() || args[0];
        const role = message.guild.roles.cache.find(role => role.name === args[1]);
        let reason = args.slice(2).join(' ');

        if (!role) {
            return message.reply('you need to specify a role dummy!');
        }

        if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
            return message.reply('bruh I don\'t have the permission.');
        }

        if (!message.member.hasPermission('MANAGE_ROLES')) {
            return message.reply('you don\'t have permission to do that fatty.');
        }

        if (!reason) {
            reason = 'None';
        }

        try {
            member.roles.add(role, reason);
        } catch (error) {
            console.error('Error assigning role:', error);
            message.reply('an error occurred. Sucks to be you.');
        }
    },
};