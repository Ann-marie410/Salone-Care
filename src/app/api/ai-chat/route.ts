import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    // This is a placeholder for a real AI integration (OpenAI, etc.)
    // For now, return helpful health guidance responses
    const responseText = generateHealthGuidance(message);

    return NextResponse.json({
      data: {
        response: responseText,
        disclaimer: 'This is not medical advice. Please consult a doctor for diagnosis and treatment.',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function generateHealthGuidance(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Simple keyword-based responses (replace with real AI)
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return `For fever management:
- Rest and get adequate sleep
- Stay hydrated with water, juice, or broth
- Take over-the-counter fever reducers like paracetamol or ibuprofen as directed
- Use cool compress if temperature is very high
- Seek medical attention if fever persists beyond 3 days or is accompanied by severe symptoms`;
  } else if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
    return `For cold and cough:
- Stay hydrated and drink warm fluids
- Get plenty of rest
- Use honey to soothe throat (not for children under 1 year)
- Use humidifier to ease congestion
- Avoid smoking and secondhand smoke
- See a doctor if cough lasts more than 3 weeks`;
  } else if (lowerMessage.includes('headache')) {
    return `For headache relief:
- Rest in a quiet, dark room
- Apply cold compress to neck and warm to temples
- Stay hydrated
- Take pain reliever as directed on package
- Identify triggers (stress, lack of sleep, skipped meals)
- See a doctor if headaches are frequent or severe`;
  } else if (lowerMessage.includes('stomach') || lowerMessage.includes('abdominal')) {
    return `For stomach issues:
- Rest your digestive system
- Drink clear fluids (water, broth, weak tea)
- Eat bland foods when ready (rice, bananas, toast)
- Avoid dairy, fatty foods, and high fiber foods temporarily
- Try ginger or peppermint tea for relief
- See a doctor if symptoms persist or worsen`;
  } else {
    return `Thank you for your health question. Here's some general guidance:

1. Keep track of your symptoms and when they started
2. Stay hydrated and get adequate rest
3. Maintain good hygiene practices
4. Use over-the-counter remedies as directed on packaging
5. Seek professional medical help if symptoms persist or worsen

Remember: This AI assistant provides general health guidance only, NOT medical diagnosis or treatment. Always consult a qualified doctor for proper medical care. In emergencies, call 117 or your local emergency number.`;
  }
}
