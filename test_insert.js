const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zipqopowyrcsnpgjcdoi.supabase.co', 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J');

async function test() {
  const { data, error } = await supabase.from('medicines').insert([{
    id: 999,
    name: 'Test Pizza',
    generic_name: 'Test',
    category: 'Pizza',
    price_pkr: 500,
    stock: 10,
    dosage: 'Large',
    description: 'Test description',
    manufacturer: 'Test',
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
  }]).select();

  console.log('Result:', data, error);
}
test();
