/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          create table lockdowns (
               guild_id text not null,
               channel_id text not null,
               expiration timestamp with time zone not null,
               mod_id text not null,
               mod_tag text not null,
               reason text,
               overwrites jsonb not null
          );
     `);
}
