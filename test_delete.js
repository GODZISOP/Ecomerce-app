const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

async function testDelete() {
  try {
    // 1. Fetch one order id
    const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=id&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!res.ok) {
      console.log('Failed to fetch:', res.status);
      return;
    }
    
    const orders = await res.json();
    if (orders.length === 0) {
      console.log('No orders found.');
      return;
    }
    
    const orderId = orders[0].id;
    console.log(`Attempting to delete order ID: ${orderId}`);
    
    // 2. Try delete
    const delRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation' // This forces it to return deleted rows or error info
      }
    });
    
    console.log('Delete Response Status:', delRes.status);
    console.log('Delete Response Headers:', Object.fromEntries(delRes.headers.entries()));
    const text = await delRes.text();
    console.log('Delete Response Body:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testDelete();
