const backendUrl = 'https://ecomerce-app-woi1.vercel.app';
const authToken = 'Bearer medimart_session_token_2026_verified';

const menuItems = [
  {
    name: "Veggie Lover Pizza",
    generic_name: "Mushrooms, Olives, Bell Peppers, Onions & Mozzarella",
    category: "Pizza",
    price_pkr: 990,
    stock: 50,
    dosage: "12 inch Medium",
    description: "A colorful medley of fresh garden vegetables, sliced mushrooms, black olives, sweet bell peppers, and red onions on a rich tomato base, covered in gooey mozzarella.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Cheese Lover",
    generic_name: "Loaded Mozzarella, Cheddar, Parmesan & Herb Sauce",
    category: "Pizza",
    price_pkr: 890,
    stock: 60,
    dosage: "12 inch Medium",
    description: "The ultimate cheese dream. Thick layers of imported mozzarella, sharp cheddar, and fresh parmesan, finished with Italian herbs on our signature thin crust.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Afghani Feast",
    generic_name: "Charcoal Grilled Afghani Boti, Onions & White Garlic Sauce",
    category: "Pizza",
    price_pkr: 1190,
    stock: 45,
    dosage: "12 inch Medium",
    description: "An authentic culinary feast featuring tender Afghani-style chicken tikka cubes, red onions, fresh coriander, and a drizzle of rich garlic sauce.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1604917621956-10dfa7cce2e7?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Supreme",
    generic_name: "Smoked Chicken chunks, Chicken Salami, Bell Peppers & Olives",
    category: "Pizza",
    price_pkr: 1150,
    stock: 40,
    dosage: "12 inch Medium",
    description: "For true meat and supreme lovers. Smoked chicken chunks, spicy chicken salami, red onions, mushrooms, green bell peppers, and sliced black olives.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chk Supreme",
    generic_name: "Spiced Chicken Tikka, Fajita Strips & Mozzarella",
    category: "Pizza",
    price_pkr: 1100,
    stock: 55,
    dosage: "12 inch Medium",
    description: "A combination of seasoned chicken tikka chunks and bell peppers topped with melted cheese, baked to crispy perfection.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Fajita Supreme",
    generic_name: "Sizzling Fajita Chicken, Bell Peppers, Onions & Jalapeños",
    category: "Pizza",
    price_pkr: 1250,
    stock: 35,
    dosage: "12 inch Medium",
    description: "Sizzling Mexican-style fajita chicken strips, mixed bell peppers, red onions, and hot jalapeños to give a delicious kick of heat.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "BBQ Tikka Pizza",
    generic_name: "Smokey BBQ Tikka Boti, Jalapeño Peppers & Onions",
    category: "Pizza",
    price_pkr: 1190,
    stock: 45,
    dosage: "12 inch Medium",
    description: "Perfectly charred chicken tikka pieces infused with smoky sweet BBQ sauce, red onions, green peppers, and lots of mozzarella.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Cheese Sticks",
    generic_name: "Garlic Butter Breadsticks with Melted Mozzarella",
    category: "Sides",
    price_pkr: 450,
    stock: 100,
    dosage: "6 Pieces",
    description: "Warm, soft garlic breadsticks loaded with bubbly melted mozzarella cheese, served with a side of marinara dipping sauce.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Pizza Fries",
    generic_name: "Crispy Fries topped with Pizza Sauce, Pepperoni & Cheese",
    category: "Sides",
    price_pkr: 590,
    stock: 80,
    dosage: "Platter",
    description: "Golden crispy french fries layered with rich pizza marinara sauce, melted mozzarella, chopped olives, and sliced pepperoni.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Club Sandwich",
    generic_name: "Triple-Decker Grilled Chicken, Fried Egg, Cheese & Lettuce",
    category: "Sandwich",
    price_pkr: 650,
    stock: 40,
    dosage: "Standard Serving",
    description: "Classic toasted triple-decker sandwich with seasoned grilled chicken, a fried egg, cheddar cheese slices, crisp lettuce, tomato, and mayo.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mexican Chicken Sandwich",
    generic_name: "Spicy Mexican Seasoned Chicken Breast, Salsa & Jalapeños",
    category: "Sandwich",
    price_pkr: 690,
    stock: 35,
    dosage: "Standard Serving",
    description: "Toasted pan-pressed sandwich loaded with shredded chicken in spicy Mexican salsa, jalapeño rings, and melted pepper jack cheese.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kabab Chaska Pizza",
    generic_name: "Traditional Seekh Kabab slices, Green Chilies & Yogurt Mint Drizzle",
    category: "Pizza",
    price_pkr: 1290,
    stock: 30,
    dosage: "12 inch Medium",
    description: "A fusion masterpiece featuring sliced traditional seekh kababs, sharp green chilies, onions, coriander, and a drizzle of spicy yogurt mint chutney.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Zinger Burger",
    generic_name: "Crispy Golden Fried Chicken Fillet, Mayo & Iceberg Lettuce",
    category: "Burger",
    price_pkr: 550,
    stock: 90,
    dosage: "Classic Zinger",
    description: "Super crispy, golden-fried spicy chicken breast fillet in a soft toasted sesame bun, topped with creamy mayonnaise and crunchy shredded lettuce.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Creamy Pizza",
    generic_name: "Rich Cream Sauce, Grilled Chicken, Mushrooms & Parsley",
    category: "Pizza",
    price_pkr: 1200,
    stock: 45,
    dosage: "12 inch Medium",
    description: "Creamy white Alfredo base sauce topped with tender sliced grilled chicken breast, button mushrooms, parsley, and premium cheese blend.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1594007654729-407ededc414a?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Cheese n Pepperoni Pizza",
    generic_name: "Gooey Mozzarella & Lots of Spicy Pepperoni Slices",
    category: "Pizza",
    price_pkr: 1150,
    stock: 50,
    dosage: "12 inch Medium",
    description: "A true American classic. Rich tomato base, generous layers of premium mozzarella, topped to the edge with loads of crispy sliced pepperoni.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken BBQ Wings",
    generic_name: "Tossed in Smokey BBQ Sauce & Garnished with Sesame",
    category: "Sides",
    price_pkr: 490,
    stock: 75,
    dosage: "8 Pieces",
    description: "Juicy, tender chicken wings deep-fried and tossed in a thick, sticky, smoky hickory BBQ sauce, sprinkled with toasted sesame seeds.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Beef Burger",
    generic_name: "Grilled Beef Patty, Cheddar Cheese, Pickles & Burger Sauce",
    category: "Burger",
    price_pkr: 650,
    stock: 50,
    dosage: "Single Patty",
    description: "Freshly smashed hand-formed prime beef patty grilled to perfection, topped with melted cheddar, pickles, onions, and house burger sauce.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Creamy Fajita Pizza",
    generic_name: "Creamy Base, Seasoned Fajita Chicken, Onions & Peppers",
    category: "Pizza",
    price_pkr: 1250,
    stock: 40,
    dosage: "12 inch Medium",
    description: "A combination of our signature rich cream base, marinated chicken fajita slices, colorful bell peppers, and sliced red onions.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Creamy Tikka Pizza",
    generic_name: "Rich Cream Base, Spicy Chicken Tikka Boti & Red Onions",
    category: "Pizza",
    price_pkr: 1250,
    stock: 42,
    dosage: "12 inch Medium",
    description: "Spicy chicken tikka chunks set on top of a delicious, velvety creamy white sauce base, baked with premium mozzarella.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1594007654729-407ededc414a?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Cheese Creamy Pasta",
    generic_name: "Fettuccine in Rich Alfredo White Sauce with Grilled Chicken & Herbs",
    category: "Pasta",
    price_pkr: 790,
    stock: 35,
    dosage: "Standard Serving",
    description: "Perfectly boiled al dente pasta tossed in a rich, buttery garlic cream sauce, loaded with grilled sliced chicken breast and fresh parsley.",
    manufacturer: "Fatpizza Kitchen",
    requires_prescription: false,
    image_url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80"
  }
];

async function runSeeding() {
  try {
    // 1. Fetch current items from the backend
    console.log('Fetching current catalog items...');
    const getRes = await fetch(`${backendUrl}/api/admin/medicines`);
    if (!getRes.ok) {
      console.error('Failed to fetch items:', getRes.status, await getRes.text());
      return;
    }
    const data = await getRes.json();
    const existingItems = data.medicines || [];
    console.log(`Found ${existingItems.length} items in DB.`);

    // 2. Delete all existing items one by one
    console.log('Clearing old medical items...');
    for (const item of existingItems) {
      const delRes = await fetch(`${backendUrl}/api/admin/medicines?id=${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken
        }
      });
      if (delRes.ok) {
        console.log(`Deleted item ${item.id} - ${item.name}`);
      } else {
        console.error(`Failed to delete item ${item.id}:`, await delRes.text());
      }
    }

    // 3. Insert pizza menu items one by one
    console.log('Inserting pizza menu items...');
    for (const item of menuItems) {
      const postRes = await fetch(`${backendUrl}/api/admin/medicines`, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (postRes.ok) {
        const resData = await postRes.json();
        console.log(`Successfully added: ${item.name} (Assigned ID: ${resData.medicine?.id})`);
      } else {
        console.error(`Failed to add ${item.name}:`, await postRes.text());
      }
    }
    console.log('Database successfully seeded with Fatpizza menu!');
  } catch (err) {
    console.error('Error during seeding:', err);
  }
}

runSeeding();
