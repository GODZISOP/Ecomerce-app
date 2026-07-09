const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
fetch(supabaseUrl)
  .then(res => console.log('success', res.status))
  .catch(err => {
    console.error('Error message:', err.message);
    console.error('Error cause:', err.cause);
  });
