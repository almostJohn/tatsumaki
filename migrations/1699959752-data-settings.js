/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          insert into guild_settings (
               guild_id,
               mod_log_channel_id,
               report_channel_id,
               mod_role_id,
               guild_log_webhook_id,
               member_log_webhook_id,
               log_ignore_channels,
               automod_ignore_roles
          ) values (
               '1173924754932121660',
               '1173930920470917140',
               '1173933264977793085',
               '1173927849409921024',
               '1173932886001455174',
               '1173933072064987157',
               array ['1173924754932121664', '1173929684170444801', '1173930920470917140', '1173930940234477649', '1173930989144252416', '1173933264977793085', '1173931734258171914'],
               array ['1173928230542131240', '1173927849409921024', '1173927529078341745', '1173928145649405992']
          );
     `);
}
