import { NextResponse } from 'next/server';

// Fallback search suggestions based on common Pakistani symptom terms in Roman Urdu, Urdu and English
const SYMPTOM_RULES = [
  {
    keywords: ['headache', 'fever', 'bukhar', 'sir dard', 'pain', 'dard', 'body ache', 'jism dard'],
    category: 'Painkiller',
    intro: 'Fever or Pain (Bukhar aur Dard / بخار اور درد) ke liye humare paas ye muanas dawaen hain:',
    medicines: [
      { id: 1, name: 'Panadol', dosage: '500mg', generic: 'Paracetamol', price: 50, requiresRx: false },
      { id: 2, name: 'Brufen', dosage: '400mg', generic: 'Ibuprofen', price: 80, requiresRx: false },
      { id: 3, name: 'Disprin', dosage: '300mg', generic: 'Aspirin', price: 30, requiresRx: false },
      { id: 62, name: 'Calpol', dosage: '120mg/5ml', generic: 'Paracetamol (Syrup for kids)', price: 80, requiresRx: false }
    ],
    disclaimer: 'Bukhar aur mamooli dard ke liye Panadol ya Brufen behad munasib hain. Agar dard barqarar rahe, to doctor se ruju karein.'
  },
  {
    keywords: ['cough', 'cold', 'khansi', 'nazla', 'zukaam', 'flu', 'throat', 'gala kharab', 'coughing', 'balgham'],
    category: 'Cough & Cold',
    intro: 'Cough, Flu, and Throat infection (Khansi, Nazla aur Gale ki kharish) ke relief ke liye ye dawaen munasib hain:',
    medicines: [
      { id: 30, name: 'Benadryl', dosage: 'Syrup', generic: 'Diphenhydramine', price: 120, requiresRx: false },
      { id: 31, name: 'Actifed', dosage: 'Tablet', generic: 'Triprolidine+Pseudoephedrine', price: 150, requiresRx: false },
      { id: 32, name: 'Strepsils', dosage: 'Lozenge', generic: 'Dichlorobenzyl alcohol', price: 100, requiresRx: false },
      { id: 33, name: 'Robitussin', dosage: 'Syrup', generic: 'Guaifenesin', price: 200, requiresRx: false }
    ],
    disclaimer: 'Gale ki kharish ke liye Strepsils chusein. Balghami khansi ke liye Robitussin syrup ka istemal karein.'
  },
  {
    keywords: ['acidity', 'gas', 'ulcer', 'heartburn', 'stomach burn', 'hazma', 'pait jalna', 'seene mein jalan', 'acid'],
    category: 'Antacid',
    intro: 'Stomach Acidity and Heartburn (Seene ki jalan, Gas aur Badhazmi) ke liye ye dawaen nihayat muanas hain:',
    medicines: [
      { id: 9, name: 'Omeprazole', dosage: '20mg', generic: 'Omeprazole', price: 90, requiresRx: false },
      { id: 10, name: 'Gaviscon', dosage: 'Syrup', generic: 'Alginate+Antacid', price: 250, requiresRx: false },
      { id: 12, name: 'Eno', dosage: 'Sachet', generic: 'Sodium Bicarbonate', price: 60, requiresRx: false },
      { id: 47, name: 'Maalox', dosage: 'Suspension', generic: 'Aluminium+Magnesium', price: 180, requiresRx: false }
    ],
    disclaimer: 'Eno sachet fori relief deta hai. Acidity aur GERD ke mustaqil hal ke liye Omeprazole subah khali pait lein.'
  },
  {
    keywords: ['diarrhea', 'loose motion', 'dast', 'pait kharab', 'pechish', 'motions'],
    category: 'Diarrhea',
    intro: 'Diarrhea and Loose motions (Pait kharab aur Dast / دست) ke liye ye medicines fori aaram deti hain:',
    medicines: [
      { id: 39, name: 'Imodium', dosage: '2mg', generic: 'Loperamide', price: 150, requiresRx: false },
      { id: 40, name: 'ORS', dosage: 'Sachet', generic: 'Oral Rehydration Salts', price: 40, requiresRx: false },
      { id: 42, name: 'Smecta', dosage: 'Sachet', generic: 'Diosmectite', price: 200, requiresRx: false }
    ],
    disclaimer: 'Khoon ki kami aur dehydration se bachne ke liye ORS ka pani lagatar pein. Dast band karne ke liye Imodium lein.'
  },
  {
    keywords: ['constipation', 'qabz', 'hard stool'],
    category: 'Constipation',
    intro: 'Constipation (Qabz / قبض) ke liye ye natural aur pharmaceutical dawaen behtareen hain:',
    medicines: [
      { id: 44, name: 'Ispaghol', dosage: 'Sachet', generic: 'Psyllium Husk', price: 80, requiresRx: false },
      { id: 43, name: 'Dulcolax', dosage: '5mg', generic: 'Bisacodyl', price: 120, requiresRx: false },
      { id: 45, name: 'Lactulose', dosage: 'Syrup', generic: 'Lactulose', price: 200, requiresRx: false }
    ],
    disclaimer: 'Ispaghol husk qudrati tareeqay se qabz door karta hai. Fori relief ke liye Dulcolax tablet raat ko lein.'
  },
  {
    keywords: ['vomit', 'nausea', 'ulti', 'dil kharab', 'dizziness'],
    category: 'Nausea',
    intro: 'Nausea and Vomiting (Ulti aur Dil kharab hona / الٹی) ko rokne ke liye ye medicines lein:',
    medicines: [
      { id: 94, name: 'Metoclopramide', dosage: '10mg', generic: 'Metoclopramide', price: 80, requiresRx: false },
      { id: 96, name: 'Domperidone', dosage: '10mg', generic: 'Domperidone', price: 100, requiresRx: false },
      { id: 95, name: 'Ondansetron', dosage: '4mg', generic: 'Ondansetron', price: 300, requiresRx: true }
    ],
    disclaimer: 'Safar mein dil kharab ho to Domperidone lein. Note: Ondansetron ke liye prescription (Rx) darqar hai.'
  },
  {
    keywords: ['allergy', 'itching', 'khash', 'khujli', 'sneezing', 'cheenkein', 'hives'],
    category: 'Allergy',
    intro: 'Allergy, Sneezing, and Skin Itching (Naak behna, Cheenkein aur Kharish) ke liye ye anti-allergy lein:',
    medicines: [
      { id: 36, name: 'Zyrtec', dosage: '10mg', generic: 'Cetirizine', price: 200, requiresRx: false },
      { id: 35, name: 'Allegra', dosage: '120mg', generic: 'Fexofenadine', price: 400, requiresRx: false },
      { id: 38, name: 'Avil', dosage: '25mg', generic: 'Pheniramine', price: 50, requiresRx: false }
    ],
    disclaimer: 'Zyrtec aur Allegra non-drowsy hain aur din mein li ja sakti hain. Avil neend la sakti hai, isay raat ko lein.'
  },
  {
    keywords: ['infection', 'wound', 'zakhmi', 'swelling', 'sozish', 'pus', 'gla', 'throat infection'],
    category: 'Antibiotic',
    intro: 'Antibiotics are prescription-only medicines. (Antibiotic / اینٹی بائیوٹک ادویات صرف ڈاکٹر کے نسخے پر ملتی ہیں):',
    medicines: [
      { id: 4, name: 'Flagyl', dosage: '400mg', generic: 'Metronidazole', price: 120, requiresRx: true },
      { id: 5, name: 'Augmentin', dosage: '625mg', generic: 'Amoxicillin+Clavulanate', price: 450, requiresRx: true },
      { id: 6, name: 'Amoxil', dosage: '500mg', generic: 'Amoxicillin', price: 180, requiresRx: true }
    ],
    disclaimer: '⚠️ Yeh dawaen (Antibiotics) sirf aur sirf Doctor ke prescription (Rx/نسخہ) par hi deliver ki jayengi. Istemal se pehle consultation zaroori hai.'
  }
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const query = lastMessage.toLowerCase();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      // IF Anthropic API key is available, call the Claude API!
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
            system: `You are 'MediMart Pakistan' AI Pharmacist, a professional, empathetic chatbot.
Suggest medicines based on user symptoms in a friendly mix of English and Roman Urdu (e.g., 'Gale kharab ke liye, humare paas...').
IMPORTANT:
- Recommend ONLY actual medicines. Popular ones include: Panadol (id:1, price:50), Brufen (id:2, price:80), Omeprazole (id:9, price:90), Gaviscon (id:10, price:250), Imodium (id:39, price:150), Zyrtec (id:36, price:200), Ispaghol (id:44, price:80).
- If suggesting a medicine that requires a prescription (like Antibiotics, High BP, Diabetes, Antidepressants), clearly state: '⚠️ WARNING: Requires Prescription'.
- If the symptoms seem serious (e.g. chest pain, breathing issues, high fever for days), politely advise them to see a doctor immediately in Pakistan.
- Format your response clearly. At the end, always list the suggested medicines in this exact JSON format so the UI can render clickable buttons to let users add them to cart:
[SUGGESTED_MEDICINES: [{"id": 1, "name": "Panadol"}, {"id": 9, "name": "Omeprazole"}]]`,
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
        } else {
          console.error('Claude API returned error:', await response.text());
          // Fall through to Rule-Based Engine
        }
      } catch (e) {
        console.error('Failed to contact Claude API:', e);
        // Fall through to Rule-Based Engine
      }
    }

    // RULE-BASED fallback engine (Highly sophisticated!)
    let responseText = "";
    let matchedGroup: any = null;

    for (const group of SYMPTOM_RULES) {
      if (group.keywords.some(kw => query.includes(kw))) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      responseText = `Assalam-o-Alaikum! 🩺\n\n${matchedGroup.intro}\n\n`;
      
      matchedGroup.medicines.forEach((med: any) => {
        responseText += `• **${med.name}** (${med.dosage}) - ${med.generic}\n`;
        responseText += `  Keemat: **Rs. ${med.price}** | ${med.requiresRx ? '⚠️ (Rx - Prescription Required)' : 'Aam Istemal (No Prescription)'}\n\n`;
      });
      
      responseText += `*Tafseel / Advice:* ${matchedGroup.disclaimer}\n\n`;
      responseText += `*Medical Disclaimer:* Yeh AI mashwara hai. Ziyada tabiyat kharab hone ki surat mein apne doctor se rujoo karein.\n\n`;
      
      // Inject structured medicines for UI clickable cards
      const jsonList = matchedGroup.medicines.map((m: any) => ({ id: m.id, name: m.name }));
      responseText += `[SUGGESTED_MEDICINES: ${JSON.stringify(jsonList)}]`;
    } else {
      // Default advice if no symptoms matched
      responseText = `Assalam-o-Alaikum! Main MediMart Pakistan ka AI Assistant hoon. 🩺\n\nMain aap ke symptoms (maslan: Bukhar, Khansi, Acidity, Qabz ya Allergy) ke mutabiq dawai suggest kar sakta hoon. \n\n*Aap ko kya takleef hai?* (Maslan: "meray sir mein dard hai" ya "I have a cough")\n\n*Note:* Sangeen beemari ki surat mein baraye meherbani fori doctor se ruju karein.`;
    }

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
