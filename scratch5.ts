import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hzyndigaesfutqnhokts.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6eW5kaWdhZXNmdXRxbmhva3RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM0MTc1NywiZXhwIjoyMTA1OTE3NzU3fQ.2rfAV4l-tMRIbv3GNMdS4iFeeLfHKAws8LUuhBHpsRE'
);

async function syncUsers() {
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  
  for (const user of authUsers.users) {
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', user.id).single();
    
    if (!existingUser) {
      console.log(`Inserting user ${user.email} into public.users`);
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        password: 'password123', // dummy password
        role: user.user_metadata?.role || 'waiter',
        active: true,
        status: 'approved'
      });
      if (insertError) {
        console.error("Insert error for", user.email, insertError);
      }
    }
  }
  console.log("Sync complete");
}

syncUsers();
