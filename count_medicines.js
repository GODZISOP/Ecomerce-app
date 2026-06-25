const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

async function countMedicines() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/medicines?select=id,name`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`CURRENT DB MEDICINES COUNT: ${data.length}`);
      if (data.length > 0) {
        console.log('Sample medicines:', data.slice(0, 5));
      }
    } else {
      console.error('Failed to fetch:', response.status, await response.text());
    }
  } catch (e) {
    console.error(e);
  }
}

countMedicines();
