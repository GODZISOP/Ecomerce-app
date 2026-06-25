import { NextResponse } from 'next/server';

const FOOD_RULES = [
  {
    keywords: ['pizza', 'piza', 'peproni', 'pepperoni', 'fajita', 'tikka', 'supreme', 'veggie', 'kabab', 'creamy pizza'],
    category: 'Pizza',
    intro: 'Fatpizza has the best hand-crafted brick oven pizzas. Here are our top recommendations:',
    items: [
      { id: 1, name: 'Veggie Lover Pizza', price: 990, desc: 'Mushrooms, Olives, Bell Peppers & Mozzarella' },
      { id: 2, name: 'Cheese Lover', price: 890, desc: 'Cheesy signature loaded mozzarella & herbs' },
      { id: 4, name: 'Chicken Supreme', price: 1150, desc: 'Chicken chunks, salami, peppers & olives' },
      { id: 15, name: 'Cheese n Peproni Pizza', price: 1150, desc: 'Loaded mozzarella & premium pepperoni' }
    ],
    disclaimer: 'All pizzas are freshly baked. Choose thick crust or thin crust at checkout!'
  },
  {
    keywords: ['burger', 'burgger', 'zinger', 'beef burger', 'chicken burger', 'bun'],
    category: 'Burger',
    intro: 'Hungry for juicy burgers? Check out these top sellers:',
    items: [
      { id: 13, name: 'Zinger Burger', price: 550, desc: 'Crispy fried chicken breast, mayo & lettuce' },
      { id: 17, name: 'Beef Burger', price: 650, desc: 'Grilled beef patty, cheddar, pickles & sauce' }
    ],
    disclaimer: 'Double patty optional upgrades are available in custom options.'
  },
  {
    keywords: ['pasta', 'cheese pasta', 'creamy pasta', 'alfredo'],
    category: 'Pasta',
    intro: 'Satisfy your creamy cravings with our premium pasta:',
    items: [
      { id: 20, name: 'Chicken Cheese Creamy Pasta', price: 790, desc: 'Fettuccine in rich Alfredo white sauce with chicken' }
    ],
    disclaimer: 'Served hot with a complimentary garlic bread slice.'
  },
  {
    keywords: ['sandwich', 'sandwiches', 'club', 'mexican sandwich'],
    category: 'Sandwich',
    intro: 'Fresh toasted sandwiches loaded with goodness:',
    items: [
      { id: 10, name: 'Club Sandwich', price: 650, desc: 'Triple-decker chicken, egg, cheese & lettuce' },
      { id: 11, name: 'Mexican Chicken Sandwich', price: 690, desc: 'Spicy Mexican seasoned chicken breast, salsa & jalapeños' }
    ],
    disclaimer: 'Served with a side of crispy golden salted french fries.'
  },
  {
    keywords: ['fries', 'wings', 'sticks', 'sides', 'bbq wings', 'cheese sticks', 'pizza fries'],
    category: 'Sides',
    intro: 'Add some delicious sides to your order:',
    items: [
      { id: 8, name: 'Cheese Sticks', price: 450, desc: 'Garlic breadsticks with melted mozzarella' },
      { id: 9, name: 'Pizza Fries', price: 590, desc: 'Fries topped with pizza sauce, pepperoni & cheese' },
      { id: 16, name: 'Chicken BBQ Wings', price: 490, desc: 'Tossed in smokey BBQ sauce (8 pieces)' }
    ],
    disclaimer: 'Great for sharing or as a quick snack!'
  }
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const query = lastMessage.toLowerCase();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 800,
            system: `You are 'Fatpizza' AI Chef assistant, a friendly, energetic food chatbot.
Suggest delicious pizzas, burgers, sandwiches, sides, and pastas to customers. Use a mix of English and Roman Urdu (e.g., 'Agar aap ko cheesy pizza khana hai, to humare paas...').
IMPORTANT:
- Recommend ONLY actual food items. Popular ones include: Veggie Lover Pizza (id:1), Cheese Lover (id:2), Zinger Burger (id:13), Pizza Fries (id:9), Club Sandwich (id:10), Chicken Cheese Creamy Pasta (id:20).
- Format your response clearly. At the end, always list the suggested items in this exact JSON format so the UI can render clickable buttons to let users add them to cart:
[SUGGESTED_MEDICINES: [{"id": 1, "name": "Veggie Lover Pizza"}, {"id": 13, "name": "Zinger Burger"}]]`,
            messages: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.content[0]?.text || '';
          return NextResponse.json({ message: aiResponse });
        }
      } catch (e) {
        console.error('Failed to contact Claude API:', e);
      }
    }

    // Fallback Rule-Based Engine
    let responseText = "";
    let matchedGroup: any = null;

    for (const group of FOOD_RULES) {
      if (group.keywords.some(kw => query.includes(kw))) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      responseText = `Assalam-o-Alaikum! 🍕\n\n${matchedGroup.intro}\n\n`;
      
      matchedGroup.items.forEach((item: any) => {
        responseText += `• **${item.name}** - ${item.desc}\n`;
        responseText += `  Price: **Rs. ${item.price}**\n\n`;
      });
      
      responseText += `*Chef Tip:* ${matchedGroup.disclaimer}\n\n`;
      
      const jsonList = matchedGroup.items.map((m: any) => ({ id: m.id, name: m.name }));
      responseText += `[SUGGESTED_MEDICINES: ${JSON.stringify(jsonList)}]`;
    } else {
      responseText = `Assalam-o-Alaikum! Main Fatpizza ka AI Assistant Chef hoon. 🍕\n\nMain aap ke mood ke mutabiq yummy items (maslan: Pizza, Burger, Club Sandwich, Wings ya Creamy Pasta) suggest kar sakta hoon. \n\n*Aap ko kya khana hai?* (Maslan: "mujhe cheesy pizza khana hai" ya "I want a zinger burger")`;
    }

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
