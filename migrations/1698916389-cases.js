/** @param {import("postgres").Sql} sql  */
export async function up(sql) {
	await sql.unsafe(`
          create function next_case(text) returns integer
          language plpgsql
          stable
          as $$
          declare next_id integer;
          begin
               select max(case_id) into next_id from cases where guild_id = $1;
               if next_id is null then return 1; end if;
               return next_id + 1;
          end;
          $$;
     `);

	await sql.unsafe(`
          create table cases (
               guild_id text not null,
               log_message_id text,
               case_id integer not null,
               ref_id integer,
               target_id text not null,
               target_tag text not null,
               mod_id text,
               mod_tag text,
               action integer not null,
               reason text,
               action_expiration timestamp with time zone,
               action_processed boolean default true,
               created_at timestamp with time zone default now() not null,
               context_message_id text,
               report_ref_id integer
          );
     `);
}
