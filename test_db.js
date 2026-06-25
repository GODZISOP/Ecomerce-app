const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

async function testConnection() {
  console.log('Testing Supabase Connection via REST API...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/medicines?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      console.error('Error connecting to Supabase:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    } else {
      const data = await response.json();
      console.log('Successfully connected to Supabase! Data:', data.length > 0 ? 'Found data' : 'Empty. No products in DB.');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testConnection();
