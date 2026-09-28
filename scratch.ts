import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hzyndigaesfutqnhokts.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eW5kaWdhZXNmdXRxbmhva3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDE3NTcsImV4cCI6MjEwNTkxNzc1N30.Hna3Fl_XZNAWTFhfxe6179YMYk8cftcfKySv5ebZHOA'
);

async function test() {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      table_id: null,
      waiter_id: "10000000-0000-0000-0000-000000000002",
      status: "pending",
      order_type: "dine_in",
      subtotal: 100,
      tax: 18,
      discount_amount: 0,
      discount_type: "none",
      total: 118,
    })
    .select()
    .single();

  console.log("Order Insert Result:", { data, error });
}

test();
