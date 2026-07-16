const supabaseUrl = 'https://zipqopowyrcsnpgjcdoi.supabase.co';
const supabaseKey = 'sb_publishable_MbDu_V7Kn_0xv3M4JM1jnQ_RrkSyH6J';

const menuItems = [];
let idCounter = 101;

function addItem(name, generic_name, category, price, dosage, desc, img) {
  menuItems.push({
    id: idCounter++,
    name,
    generic_name,
    category,
    price_pkr: price,
    stock: 100,
    dosage,
    description: desc,
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: img
  });
}

// Deals
addItem("Value Deal 1", "Small Pizza + 345ml Drink", "Deals", 500, "Deal", "Small Pizza with a 345ml Drink", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");
addItem("Value Deal 2", "Regular Pizza + 500ml Drink", "Deals", 800, "Deal", "Regular Pizza with a 500ml Drink", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");
addItem("Value Deal 3", "Large Pizza + 1 Ltr Drink", "Deals", 1200, "Deal", "Large Pizza with a 1 Ltr Drink", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");
addItem("Value Deal 4", "Large Pizza + Regular Pizza + 1 Ltr Drink", "Deals", 2000, "Deal", "Large Pizza, Regular Pizza, and 1 Ltr Drink", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");
addItem("Value Deal 5", "2 Regular Pizza + 1 Ltr Drink", "Deals", 1600, "Deal", "2 Regular Pizzas and 1 Ltr Drink", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");
addItem("Value Deal 6", "2 Large Pizza + 1.5 Ltr Drink", "Deals", 2300, "Deal", "2 Large Pizzas and 1.5 Ltr Drink", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");

// Double Cravings Deals
addItem("Double Craving Deal 1", "2 Small Pizza", "Deals", 800, "Deal", "2 Small Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80");
addItem("Double Craving Deal 2", "2 Regular Pizza", "Deals", 1400, "Deal", "2 Regular Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80");
addItem("Double Craving Deal 3", "2 Large Pizza", "Deals", 2200, "Deal", "2 Large Pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80");

// Special Flavours Pizzas
const specialFlavours = [
  "Chicken Ranch", "Honey Siracha", "BBQ Tikka", "Chk Fajita", "Fajita Sensation", 
  "Spicy Italian", "Chk Supreme", "Creamy Tikka", "Creamy Fajita", "Afghani Feast", 
  "Malai Boti", "Peri Peri", "Mughlai Delight", "Shawarma Lovers", "Cheese Lovers", 
  "Veggie Lovers", "Cheese n Peproni"
];

const pizzaSizes = [
  { size: "Small 6 Inch", price: 1100 },
  { size: "Regular 9 Inch", price: 750 },
  { size: "Large 12 Inch", price: 1100 }
];

specialFlavours.forEach(flavor => {
  pizzaSizes.forEach(s => {
    addItem(`${flavor} Pizza - ${s.size}`, `Delicious ${flavor} Pizza`, "Pizza", s.price, s.size, `Our special ${flavor} pizza in ${s.size} size.`, "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80");
  });
});

// Premium Flavours Pizzas
addItem("Creamy Max Pizza - Regular", "Premium Creamy Max", "Pizza", 900, "Medium 9 Inch", "Creamy Max premium flavour", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80");
addItem("Creamy Max Pizza - Large", "Premium Creamy Max", "Pizza", 1300, "Large 12 Inch", "Creamy Max premium flavour", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80");
addItem("Arabian Green Pizza - Regular", "Premium Arabian Green", "Pizza", 900, "Medium 9 Inch", "Arabian Green premium flavour", "https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?w=600&auto=format&fit=crop&q=80");
addItem("Arabian Green Pizza - Large", "Premium Arabian Green", "Pizza", 1300, "Large 12 Inch", "Arabian Green premium flavour", "https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?w=600&auto=format&fit=crop&q=80");
addItem("Kabab Chaska Pizza - Large", "Premium Kabab Chaska", "Pizza", 1400, "Large 12 Inch", "Kabab Chaska premium flavour", "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80");

// Appetizers
addItem("Chk Wings 6 Pcs", "Chicken Wings", "Sides", 500, "6 Pieces", "Crispy chicken wings", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80");
addItem("Chk Wings 12 Pcs", "Chicken Wings", "Sides", 900, "12 Pieces", "Crispy chicken wings", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80");
addItem("Chk Nuggets 6 Pcs", "Chicken Nuggets", "Sides", 500, "6 Pieces", "Crispy chicken nuggets", "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80");
addItem("Chk Nuggets 12 Pcs", "Chicken Nuggets", "Sides", 900, "12 Pieces", "Crispy chicken nuggets", "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80");

// Sandwich & Pasta
addItem("Club Sandwich", "Club Sandwich", "Sandwich", 500, "Serving", "Classic club sandwich", "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&auto=format&fit=crop&q=80");
addItem("Mexican Chk Sandwich", "Spicy Chicken Sandwich", "Sandwich", 650, "Serving", "Mexican style chicken sandwich", "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80");
addItem("Chk Cheese Pasta", "Chicken Cheese Pasta", "Pasta", 650, "Serving", "Creamy chicken cheese pasta", "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80");
addItem("Cheese Sticks", "Garlic Butter Breadsticks", "Sides", 450, "6 Pieces", "Cheese stuffed breadsticks", "https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=600&auto=format&fit=crop&q=80");
addItem("Pizza Fries", "Pizza loaded fries", "Sides", 650, "Platter", "Fries loaded with pizza toppings", "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80");

// Burgers & Fries
addItem("Beef Cheese Burger", "Beef Burger", "Burger", 550, "Serving", "Juicy beef burger with cheese", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80");
addItem("Extra Beef Patty", "Extra Patty", "Burger", 300, "Addon", "Extra beef patty for burger", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80");
addItem("Zinger Cheese Burger", "Zinger with Cheese", "Burger", 450, "Serving", "Crispy zinger burger with cheese", "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80");
addItem("Zinger Burger", "Zinger Burger", "Burger", 400, "Serving", "Classic zinger burger", "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80");
addItem("Jumbo Zinger Burger", "Jumbo Zinger", "Burger", 600, "Serving", "Large zinger burger", "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80");
addItem("Fries Box Regular", "Regular Fries", "Sides", 250, "Box", "Box of crispy fries", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80");
addItem("Extra Fries", "Extra Fries", "Sides", 100, "Addon", "Extra portion of fries", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80");
addItem("Cheese Slice", "Cheese Slice", "Sides", 70, "Addon", "Extra cheese slice", "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80");

// Beverages
addItem("Beverage 345 Ml", "Soft Drink", "Beverages", 100, "345 ml", "Chilled soft drink", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80");
addItem("Beverage 500 Ml", "Soft Drink", "Beverages", 120, "500 ml", "Chilled soft drink", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80");
addItem("Beverage 1 Ltr", "Soft Drink", "Beverages", 170, "1 Ltr", "Chilled soft drink", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80");
addItem("Beverage 1.5 Ltr", "Soft Drink", "Beverages", 230, "1.5 Ltr", "Chilled soft drink", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80");
addItem("Small Water", "Mineral Water", "Beverages", 60, "Small", "Bottled mineral water", "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80");
addItem("Big Water", "Mineral Water", "Beverages", 120, "Big", "Bottled mineral water", "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80");

async function seedDatabase() {
  console.log('Clearing old products and seeding Fatpizza menu...');
  
  try {
    const getResponse = await fetch(`${supabaseUrl}/rest/v1/medicines?select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const existing = await getResponse.json();
    
    // Delete existing items
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/medicines?id=gt.0`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!deleteResponse.ok) {
      for (const item of existing) {
        await fetch(`${supabaseUrl}/rest/v1/medicines?id=eq.${item.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
      }
    }
    
    // Insert new items in batches of 50 to avoid timeout or payload limit
    const batchSize = 50;
    for (let i = 0; i < menuItems.length; i += batchSize) {
      const batch = menuItems.slice(i, i + batchSize);
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/medicines`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(batch)
      });
      if (!insertResponse.ok) {
        const errText = await insertResponse.text();
        throw new Error(`Insert failed: ${errText}`);
      }
    }
    
    console.log(`Successfully seeded ${menuItems.length} Fatpizza menu items!`);
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedDatabase();
