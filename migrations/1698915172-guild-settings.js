/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          create table guild_settings (
               guild_id text,
               mod_log_channel_id text,
               report_channel_id text,
               mod_role_id text,
               guild_log_webhook_id text,
               member_log_webhook_id text,
               locale text default 'en-US',
               force_locale boolean default false,
               log_ignore_channels text[] default '{}'::text[],
               automod_ignore_roles text[] default '{}'::text[],
               report_status_tags text[] default '{}'::text[],
               report_type_tags text[] default '{}'::text[]
          );
     `);
}
