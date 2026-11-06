import postgres from "postgres";

export async function probePostgresConnection(databaseUrl: string): Promise<boolean> {
  try {
    const sql = postgres(databaseUrl, { max: 1, connect_timeout: 5, prepare: false });
    await sql`select 1 as ok`;
    await sql.end({ timeout: 5 });
    return true;
  } catch {
    return false;
  }
}
