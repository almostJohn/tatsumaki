/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          insert into guild_settings (
               report_status_tags,
               report_type_tags
          ) values (
               array ['pending', 'approved', 'rejected', 'spam'],
               array ['message', 'user']
          );
     `);
}
