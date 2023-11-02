/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          create table messages (
               id text,
               channel_id text
          );
     `);
}
