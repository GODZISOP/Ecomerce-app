const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

async function countOrders() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`CURRENT ACTIVE ORDERS COUNT: ${data.length}`);
      if (data.length > 0) {
        console.log('Sample order data:', data[0]);
      }
    } else {
      console.error('Failed to fetch:', response.status, await response.text());
    }
  } catch (e) {
    console.error(e);
  }
}

countOrders();
