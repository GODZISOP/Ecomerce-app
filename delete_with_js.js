const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteOrders() {
  console.log('Fetching orders...');
  const { data: orders, error: fetchError } = await supabase
    .from('orders')
    .select('id');

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }

  console.log(`Found ${orders.length} orders to delete.`);
  if (orders.length === 0) return;

  for (const order of orders) {
    const { data, error, status } = await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);

    if (error) {
      console.error(`Failed to delete ${order.id}:`, error, 'Status:', status);
    } else {
      console.log(`Deleted order ${order.id}. Status: ${status}`);
    }
  }

  // Let's verify
  const { data: remaining } = await supabase.from('orders').select('id');
  console.log(`Remaining orders: ${remaining?.length}`);
}

deleteOrders();
