import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hzyndigaesfutqnhokts.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eW5kaWdhZXNmdXRxbmhva3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDE3NTcsImV4cCI6MjEwNTkxNzc1N30.Hna3Fl_XZNAWTFhfxe6179YMYk8cftcfKySv5ebZHOA'
);

async function test() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  console.log("Select Result:", { data, error });
}

test();
