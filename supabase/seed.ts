import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.log("Supabase credentials are not configured. Run supabase/seed.sql in the Supabase SQL editor, or set env vars for scripted seeding.");
  process.exit(0);
}

const supabase = createClient(url, serviceRoleKey);
const seedSql = fs.readFileSync(path.join(process.cwd(), "supabase", "seed.sql"), "utf8");

console.log("Seed SQL loaded. Supabase JS cannot execute arbitrary SQL unless an rpc is configured.");
console.log("Paste this file into the Supabase SQL editor:");
console.log(seedSql.slice(0, 500));

const { data, error } = await supabase.from("universities").select("id").limit(1);
if (error) console.error(error.message);
else console.log(`Connected to Supabase. Existing universities checked: ${data.length}`);
