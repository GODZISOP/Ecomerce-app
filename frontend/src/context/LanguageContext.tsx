'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ur';

const itemTranslations: Record<string, { en: string; ur: string }> = {
  // Item Names
  "Veggie Lover Pizza": { en: "Veggie Lover Pizza", ur: "ویجی لور پیزا" },
  "Cheese Lover": { en: "Cheese Lover", ur: "چیز لور پیزا" },
  "Afghani Feast": { en: "Afghani Feast", ur: "افغانی فیسٹ پیزا" },
  "Chicken Supreme": { en: "Chicken Supreme", ur: "چکن سپریم پیزا" },
  "Chk Supreme": { en: "Chk Supreme", ur: "چکن سپریم" },
  "Chicken Fajita Supreme": { en: "Chicken Fajita Supreme", ur: "چکن فجیتا سپریم" },
  "BBQ Tikka Pizza": { en: "BBQ Tikka Pizza", ur: "بی بی کیو تکہ پیزا" },
  "Cheese Sticks": { en: "Cheese Sticks", ur: "چیز اسٹکس" },
  "Pizza Fries": { en: "Pizza Fries", ur: "پیزا فرائز" },
  "Club Sandwich": { en: "Club Sandwich", ur: "کلب سینڈوچ" },
  "Mexican Chicken Sandwich": { en: "Mexican Chicken Sandwich", ur: "میکسیکن چکن سینڈوچ" },
  "Kabab Chaska Pizza": { en: "Kabab Chaska Pizza", ur: "کباب چسکا پیزا" },
  "Zinger Burger": { en: "Zinger Burger", ur: "زینگر برگر" },
  "Creamy Pizza": { en: "Creamy Pizza", ur: "کریمی پیزا" },
  "Cheese n Peproni Pizza": { en: "Cheese n Peproni Pizza", ur: "چیز اور پیپرونی پیزا" },
  "Chicken BBQ Wings": { en: "Chicken BBQ Wings", ur: "چکن بی بی کیو ونگز" },
  "Beef Burger": { en: "Beef Burger", ur: "بیف برگر" },
  "Creamy Fajita Pizza": { en: "Creamy Fajita Pizza", ur: "کریمی فجیتا پیزا" },
  "Creamy Tikka Pizza": { en: "Creamy Tikka Pizza", ur: "کریمی تکہ پیزا" },
  "Chicken Cheese Creamy Pasta": { en: "Chicken Cheese Creamy Pasta", ur: "چکن چیز کریمی پاستا" },

  // Generic names (ingredients)
  "Mushrooms, Olives, Bell Peppers, Onions & Mozzarella": {
    en: "Mushrooms, Olives, Bell Peppers, Onions & Mozzarella",
    ur: "مشروم، زیتون، شملہ مرچ، پیاز اور موزاریلا پنیر"
  },
  "Loaded Mozzarella, Cheddar, Parmesan & Herb Sauce": {
    en: "Loaded Mozzarella, Cheddar, Parmesan & Herb Sauce",
    ur: "موزاریلا، چیڈر، پرمیسن پنیر اور جڑی بوٹیوں کی ساس"
  },
  "Charcoal Grilled Afghani Boti, Onions & White Garlic Sauce": {
    en: "Charcoal Grilled Afghani Boti, Onions & White Garlic Sauce",
    ur: "کوئلے پر پکی افغانی بوٹی، پیاز اور سفید لہسن کی چٹنی"
  },
  "Smoked Chicken chunks, Chicken Salami, Bell Peppers & Olives": {
    en: "Smoked Chicken chunks, Chicken Salami, Bell Peppers & Olives",
    ur: "سموکڈ چکن کے ٹکڑے، چکن سلامی، شملہ مرچ اور زیتون"
  },
  "Spiced Chicken Tikka, Fajita Strips & Mozzarella": {
    en: "Spiced Chicken Tikka, Fajita Strips & Mozzarella",
    ur: "مسالے دار چکن تکہ، فجیتا پٹیاں اور موزاریلا پنیر"
  },
  "Sizzling Fajita Chicken, Bell Peppers, Onions & Jalapeños": {
    en: "Sizzling Fajita Chicken, Bell Peppers, Onions & Jalapeños",
    ur: "گرم چکن فجیتا، شملہ مرچ، پیاز اور جلپینو مرچیں"
  },
  "Smokey BBQ Tikka Boti, Jalapeño Peppers & Onions": {
    en: "Smokey BBQ Tikka Boti, Jalapeño Peppers & Onions",
    ur: "سموکی بی بی کیو تکہ بوٹی، جلپینو اور پیاز"
  },
  "Garlic Butter Breadsticks with Melted Mozzarella": {
    en: "Garlic Butter Breadsticks with Melted Mozzarella",
    ur: "لہسن اور مکھن والی بریڈ اسٹکس پگھلے ہوئے موزاریلا کے ساتھ"
  },
  "Crispy Fries topped with Pizza Sauce, Pepperoni & Cheese": {
    en: "Crispy Fries topped with Pizza Sauce, Pepperoni & Cheese",
    ur: "کرسپی فرائز پیزا ساس، پیپرونی اور پنیر کے ساتھ"
  },
  "Triple-Decker Grilled Chicken, Fried Egg, Cheese & Lettuce": {
    en: "Triple-Decker Grilled Chicken, Fried Egg, Cheese & Lettuce",
    ur: "تہرے ٹوسٹ والا گرل چکن، فرائیڈ انڈہ، پنیر اور سلاد پتا"
  },
  "Spicy Mexican Seasoned Chicken Breast, Salsa & Jalapeños": {
    en: "Spicy Mexican Seasoned Chicken Breast, Salsa & Jalapeños",
    ur: "مسالے دار میکسیکن چکن بریسٹ، سالسا اور جلپینو"
  },
  "Traditional Seekh Kabab slices, Green Chilies & Yogurt Mint Drizzle": {
    en: "Traditional Seekh Kabab slices, Green Chilies & Yogurt Mint Drizzle",
    ur: "روایتی سیخ کباب کے ٹکڑے، ہری مرچیں اور پودینے کی چٹنی"
  },
  "Crispy Golden Fried Chicken Fillet, Mayo & Iceberg Lettuce": {
    en: "Crispy Golden Fried Chicken Fillet, Mayo & Iceberg Lettuce",
    ur: "کرسپی گولڈن فرائیڈ چکن فلیٹ، مایونیز اور آئس برگ"
  },
  "Rich Cream Sauce, Grilled Chicken, Mushrooms & Parsley": {
    en: "Rich Cream Sauce, Grilled Chicken, Mushrooms & Parsley",
    ur: "گاڑھی کریم ساس، گرل چکن، مشروم اور دھنیا"
  },
  "Gooey Mozzarella & Lots of Spicy Pepperoni Slices": {
    en: "Gooey Mozzarella & Lots of Spicy Pepperoni Slices",
    ur: "پگھلا ہوا موزاریلا اور بہت سارے مسالے دار پیپرونی سلائسز"
  },
  "Tossed in Smokey BBQ Sauce & Garnished with Sesame": {
    en: "Tossed in Smokey BBQ Sauce & Garnished with Sesame",
    ur: "سموکی بی بی کیو ساس میں ڈوبے ہوئے اور تلوں سے سجائے ہوئے"
  },
  "Grilled Beef Patty, Cheddar Cheese, Pickles & Burger Sauce": {
    en: "Grilled Beef Patty, Cheddar Cheese, Pickles & Burger Sauce",
    ur: "گرل کیا ہوا بیف پیٹی، چیڈر پنیر، اچار اور برگر ساس"
  },
  "Creamy Base, Seasoned Fajita Chicken, Onions & Peppers": {
    en: "Creamy Base, Seasoned Fajita Chicken, Onions & Peppers",
    ur: "کریمی بیس، مسالے دار فجیتا چکن، پیاز اور شملہ مرچ"
  },
  "Rich Cream Base, Spicy Chicken Tikka Boti & Red Onions": {
    en: "Rich Cream Base, Spicy Chicken Tikka Boti & Red Onions",
    ur: "کریمی بیس، مسالے دار چکن تکہ بوٹی اور پیاز"
  },
  "Fettuccine in Rich Alfredo White Sauce with Grilled Chicken & Herbs": {
    en: "Fettuccine in Rich Alfredo White Sauce with Grilled Chicken & Herbs",
    ur: "ریچ الفریڈو وائٹ ساس میں پکا ہوا پاستا گرل چکن اور جڑی بوٹیوں کے ساتھ"
  },

  // Descriptions
  "A colorful medley of fresh garden vegetables, sliced mushrooms, black olives, sweet bell peppers, and red onions on a rich tomato base, covered in gooey mozzarella.": {
    en: "A colorful medley of fresh garden vegetables, sliced mushrooms, black olives, sweet bell peppers, and red onions on a rich tomato base, covered in gooey mozzarella.",
    ur: "ٹماٹر کی ساس اور پگھلے ہوئے موزاریلا پنیر کے اوپر تازہ باغیچہ کی سبزیاں، مشروم، زیتون، شملہ مرچ اور لال پیاز کا حسین امتزاج۔"
  },
  "The ultimate cheese dream. Thick layers of imported mozzarella, sharp cheddar, and fresh parmesan, finished with Italian herbs on our signature thin crust.": {
    en: "The ultimate cheese dream. Thick layers of imported mozzarella, sharp cheddar, and fresh parmesan, finished with Italian herbs on our signature thin crust.",
    ur: "پنیر کے شائقین کے لیے خاص۔ موزاریلا، چیڈر اور پرمیسن پنیر کی موٹی تہیں، اطالوی جڑی بوٹیوں کے ساتھ ہمارے خاص پتلے کرسٹ پر۔"
  },
  "An authentic culinary feast featuring tender Afghani-style chicken tikka cubes, red onions, fresh coriander, and a drizzle of rich garlic sauce.": {
    en: "An authentic culinary feast featuring tender Afghani-style chicken tikka cubes, red onions, fresh coriander, and a drizzle of rich garlic sauce.",
    ur: "افغانی طرز کے چکن تکہ بوٹی، پیاز، تازہ دھنیا اور لہسن کی چٹنی کا ایک لاوجود ملاپ۔"
  },
  "For true meat and supreme lovers. Smoked chicken chunks, spicy chicken salami, red onions, mushrooms, green bell peppers, and sliced black olives.": {
    en: "For true meat and supreme lovers. Smoked chicken chunks, spicy chicken salami, red onions, mushrooms, green bell peppers, and sliced black olives.",
    ur: "گوشت کے شائقین کے لیے۔ سموکڈ چکن، چکن سلامی، لال پیاز، مشروم، ہری شملہ مرچ اور کالے زیتون۔"
  },
  "A combination of seasoned chicken tikka chunks and bell peppers topped with melted cheese, baked to crispy perfection.": {
    en: "A combination of seasoned chicken tikka chunks and bell peppers topped with melted cheese, baked to crispy perfection.",
    ur: "مصالحے دار چکن تکہ کے ٹکڑے اور شملہ مرچ پگھلے ہوئے پنیر کے ساتھ، خستہ ہونے تک سینکا ہوا۔"
  },
  "Sizzling Mexican-style fajita chicken strips, mixed bell peppers, red onions, and hot jalapeños to give a delicious kick of heat.": {
    en: "Sizzling Mexican-style fajita chicken strips, mixed bell peppers, red onions, and hot jalapeños to give a delicious kick of heat.",
    ur: "میکسیکن سٹائل فجیتا چکن سٹرپس، مخلوط شملہ مرچ، لال پیاز اور جلپینو مرچیں جو ذائقے کو تیکھا بناتی ہیں۔"
  },
  "Perfectly charred chicken tikka pieces infused with smoky sweet BBQ sauce, red onions, green peppers, and lots of mozzarella.": {
    en: "Perfectly charred chicken tikka pieces infused with smoky sweet BBQ sauce, red onions, green peppers, and lots of mozzarella.",
    ur: "دھوئیں دار بی بی کیو ساس، لال پیاز، ہری مرچ اور ڈھیر سارے موزاریلا کے ساتھ اچھی طرح پکے چکن تکہ کے ٹکڑے۔"
  },
  "Warm, soft garlic breadsticks loaded with bubbly melted mozzarella cheese, served with a side of marinara dipping sauce.": {
    en: "Warm, soft garlic breadsticks loaded with bubbly melted mozzarella cheese, served with a side of marinara dipping sauce.",
    ur: "لہسن اور مکھن والے نرم بریڈ اسٹکس جس پر ڈھیر سارا موزاریلا پنیر پگھلا ہوا ہو، ساتھ میں لال چٹنی۔"
  },
  "Golden crispy french fries layered with rich pizza marinara sauce, melted mozzarella, chopped olives, and sliced pepperoni.": {
    en: "Golden crispy french fries layered with rich pizza marinara sauce, melted mozzarella, chopped olives, and sliced pepperoni.",
    ur: "سنہری خستہ آلو کی چپس جس کے اوپر پیزا چٹنی، پگھلا ہوا موزاریلا، زیتون اور پیپرونی کی تہیں لگی ہوں۔"
  },
  "Classic toasted triple-decker sandwich with seasoned grilled chicken, a fried egg, cheddar cheese slices, crisp lettuce, tomato, and mayo.": {
    en: "Classic toasted triple-decker sandwich with seasoned grilled chicken, a fried egg, cheddar cheese slices, crisp lettuce, tomato, and mayo.",
    ur: "گرل چکن، تلے ہوئے انڈے، چیڈر پنیر، تازہ سلاد پتا، ٹماٹر اور مایونیز کے ساتھ کلاسک تہرے ٹوسٹ والا سینڈوچ۔"
  },
  "Toasted pan-pressed sandwich loaded with shredded chicken in spicy Mexican salsa, jalapeño rings, and melted pepper jack cheese.": {
    en: "Toasted pan-pressed sandwich loaded with shredded chicken in spicy Mexican salsa, jalapeño rings, and melted pepper jack cheese.",
    ur: "مسالے دار میکسیکن سالسا چکن، جلپینو کے ٹکڑوں اور پگھلے ہوئے پنیر سے بھرا ہوا گرم سینڈوچ۔"
  },
  "A fusion masterpiece featuring sliced traditional seekh kababs, sharp green chilies, onions, coriander, and a drizzle of spicy yogurt mint chutney.": {
    en: "A fusion masterpiece featuring sliced traditional seekh kababs, sharp green chilies, onions, coriander, and a drizzle of spicy yogurt mint chutney.",
    ur: "روایتی سیخ کباب، تیز ہری مرچیں، پیاز، دھنیا اور پودینے کی دہی والی چٹنی کا ایک لاجواب ملاپ۔"
  },
  "Super crispy, golden-fried spicy chicken breast fillet in a soft toasted sesame bun, topped with creamy mayonnaise and crunchy shredded lettuce.": {
    en: "Super crispy, golden-fried spicy chicken breast fillet in a soft toasted sesame bun, topped with creamy mayonnaise and crunchy shredded lettuce.",
    ur: "تلوں والے نرم بن میں خستہ فرائیڈ چکن بریسٹ فلیٹ، مایونیز اور کٹی ہوئی بند گوبھی کے ساتھ۔"
  },
  "Creamy white Alfredo base sauce topped with tender sliced grilled chicken breast, button mushrooms, parsley, and premium cheese blend.": {
    en: "Creamy white Alfredo base sauce topped with tender sliced grilled chicken breast, button mushrooms, parsley, and premium cheese blend.",
    ur: "سفید کریمی الفریڈو چٹنی کی تہہ، گرل چکن، مشروم، دھنیا اور بہترین پگھلے ہوئے پنیر کے ساتھ۔"
  },
  "A true American classic. Rich tomato base, generous layers of premium mozzarella, topped to the edge with loads of crispy sliced pepperoni.": {
    en: "A true American classic. Rich tomato base, generous layers of premium mozzarella, topped to the edge with loads of crispy sliced pepperoni.",
    ur: "ایک سچا کلاسک پیزا؛ ٹماٹر چٹنی، بہت سارا موزاریلا پنیر اور کناروں تک پھیلی خستہ پیپرونی کی تہیں"
  },
  "Juicy, tender chicken wings deep-fried and tossed in a thick, sticky, smoky hickory BBQ sauce, sprinkled with toasted sesame seeds.": {
    en: "Juicy, tender chicken wings deep-fried and tossed in a thick, sticky, smoky hickory BBQ sauce, sprinkled with toasted sesame seeds.",
    ur: "نہایت لذیذ چکن ونگز جو ڈیپ فرائی کر کے گاڑھی بی بی کیو ساس میں ڈبوئے گئے ہوں اور اوپر تل چھڑکائے ہوں۔"
  },
  "Freshly smashed hand-formed prime beef patty grilled to perfection, topped with melted cheddar, pickles, onions, and house burger sauce.": {
    en: "Freshly smashed hand-formed prime beef patty grilled to perfection, topped with melted cheddar, pickles, onions, and house burger sauce.",
    ur: "ہاتھ سے بنی ہوئی بیف کی پیٹی گرل کی ہوئی، پگھلے ہوئے چیڈر پنیر، اچار، پیاز اور خاص برگر چٹنی کے ساتھ۔"
  },
  "A combination of our signature rich cream base, marinated chicken fajita slices, colorful bell peppers, and sliced red onions.": {
    en: "A combination of our signature rich cream base, marinated chicken fajita slices, colorful bell peppers, and sliced red onions.",
    ur: "ہماری دستخطی کریمی سفید چٹنی، مسالے دار چکن فجیتا، شملہ مرچ اور لال پیاز کا بہترین ملاپ۔"
  },
  "Spicy chicken tikka chunks set on top of a delicious, velvety creamy white sauce base, baked with premium mozzarella.": {
    en: "Spicy chicken tikka chunks set on top of a delicious, velvety creamy white sauce base, baked with premium mozzarella.",
    ur: "تیز مسالے دار چکن تکہ بوٹی جو ایک ملائم کریمی ساس پر سجائی گئی ہو اور بہترین موزاریلا کے ساتھ پکی ہو۔"
  },
  "Perfectly boiled al dente pasta tossed in a rich, buttery garlic cream sauce, loaded with grilled sliced chicken breast and fresh parsley.": {
    en: "Perfectly boiled al dente pasta tossed in a rich, buttery garlic cream sauce, loaded with grilled sliced chicken breast and fresh parsley.",
    ur: "ابلتا ہوا گرم پاستا مکھن اور لہسن والی کریم ساس میں، جس میں گرل چکن کے ٹکڑے اور دھنیا شامل کیا گیا ہو۔"
  },

  // Dosage/Sizes
  "12 inch Medium": { en: "12 inch Medium", ur: "12 انچ درمیانہ" },
  "6 Pieces": { en: "6 Pieces", ur: "6 پیس" },
  "Platter": { en: "Platter", ur: "پلیٹر" },
  "Standard Serving": { en: "Standard Serving", ur: "عام سرونگ" },
  "Classic Zinger": { en: "Classic Zinger", ur: "کلاسک زینگر" },
  "Single Patty": { en: "Single Patty", ur: "سنگل پیٹی" },
  "8 Pieces": { en: "8 Pieces", ur: "8 پیس" }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, ur?: string) => string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fatpizza_lang');
    if (stored === 'ur' || stored === 'en') {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fatpizza_lang', lang);
  };

  const t = (en: string, ur?: string) => {
    if (ur === undefined) {
      if (mounted && language === 'ur') {
        return itemTranslations[en]?.ur || en;
      }
      return itemTranslations[en]?.en || en;
    }
    return mounted && language === 'ur' ? ur : en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
