/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          create function next_report(text) returns integer
          language plpgsql
          stable
          as $$
          declare next_id integer;
          begin
               select max(report_id) into next_id from reports where guild_id = $1;
               if next_id is null then return 1; end if;
               return next_id + 1;
          end;
          $$;
     `);

	await sql.unsafe(`
          create table reports (
               guild_id text,
               report_id integer,
               type integer,
               status integer,
               message_id text,
               channel_id text,
               target_id text,
               target_tag text,
               author_id text,
               author_tag text,
               mod_id text,
               mod_tag text,
               reason text,
               attachment_url text,
               log_post_id text,
               ref_id integer,
               context_messages_ids text[] default '{}'::text[],
               updated_at timestamp with time zone,
               created_at timestamp with time zone default now() not null
          );
     `);
}
