const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

async function testInsert() {
  const item = {
    id: 1,
    name: 'Veggie Lover Pizza',
    generic_name: 'Mushrooms',
    category: 'Pizza',
    price_pkr: 990,
    stock: 50,
    dosage: '12 inch',
    description: 'Fresh vegetables',
    manufacturer: 'Fatpizza',
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=600'
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/medicines`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify([item])
  });

  const text = await response.text();
  console.log('Insert response:', response.status, text);
}

testInsert();
