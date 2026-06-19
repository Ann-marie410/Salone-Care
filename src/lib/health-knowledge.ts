export interface HealthTopic {
  keywords: string[];
  response: string;
  priority?: number;
}

const disclaimer = "This assistant provides general health information and is not a substitute for professional medical care. Always consult a qualified healthcare professional for diagnosis and treatment.";

export const emergencyResponses: HealthTopic[] = [
  {
    keywords: ["cannot breathe", "can't breathe", "difficulty breathing", "shortness of breath", "struggling to breathe"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

If you or someone near you is having difficulty breathing, this is a medical emergency.

Call 117 (Sierra Leone Emergency Services) or go to the nearest hospital immediately.

Do not wait. Every second counts.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["bleeding heavily", "severe bleeding", "uncontrolled bleeding", "heavy bleeding", "bleeding a lot"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

If you or someone near you is bleeding heavily, this is a medical emergency.

Apply firm pressure to the wound with a clean cloth. Call 117 (Sierra Leone Emergency Services) or go to the nearest hospital immediately.

Do not wait. Every second counts.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["severe chest pain", "chest pain", "heavy chest", "chest pressure"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

Chest pain can be a sign of a serious heart condition. Do not ignore it.

Stop all activity. If you have aspirin and are not allergic, chew one tablet. Call 117 (Sierra Leone Emergency Services) or go to the nearest hospital immediately.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["unconscious", "passed out", "fainted", "not responding", "knocked out"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

If someone is unconscious or unresponsive, this is a medical emergency.

Check if they are breathing. If not breathing, start CPR if trained. Call 117 (Sierra Leone Emergency Services) immediately.

Do not wait. Every second counts.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["seizure", "fitting", "convulsing", "convulsion", "epileptic"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

If someone is having a seizure:
- Clear the area of hard or sharp objects
- Do NOT put anything in their mouth
- Do NOT restrain them
- Time the seizure
- Call 117 (Sierra Leone Emergency Services) if the seizure lasts more than 5 minutes

Seek medical evaluation after any seizure.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["suicide", "kill myself", "want to die", "end my life", "self-harm", "hurt myself"],
    response: `🚨 CRISIS - You are not alone. Help is available.

If you are thinking about harming yourself, please reach out for support:
- Call 117 for emergency services
- Contact a trusted friend, family member, or healthcare worker
- Go to the nearest hospital

Your life matters. Please get help immediately.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["snake bite", "snakebite", "poisonous snake"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

If bitten by a snake:
- Keep calm and still - movement spreads venom faster
- Remove tight clothing or jewelry near the bite
- Keep the bite area at or below heart level
- Do NOT cut the wound or try to suck out venom
- Do NOT apply a tourniquet
- Go to the nearest hospital immediately

Try to remember what the snake looked like (color, size, pattern) to help doctors.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["burn", "burning", "scalded", "severe burn"],
    response: `🚨 Seek medical attention for serious burns!

For severe or large burns:
- Call 117 or go to the nearest hospital immediately
- Cool the burn under cool (not cold) running water for at least 10 minutes
- Do NOT apply ice, butter, toothpaste, or oils
- Cover loosely with a clean cloth or plastic wrap
- Do not pop blisters

For minor burns: cool water, aloe vera, keep clean. Monitor for infection.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["allergic reaction", "anaphylaxis", "severe allergy", "swelling face", "swollen face", "difficulty swallowing"],
    response: `🚨 EMERGENCY - Seek immediate medical attention!

Signs of a severe allergic reaction (anaphylaxis):
- Difficulty breathing or swallowing
- Swelling of the face, lips, tongue, or throat
- Rapid or weak pulse
- Dizziness or fainting

Call 117 immediately. Use an epinephrine auto-injector (EpiPen) if available.

${disclaimer}`,
    priority: 100,
  },
  {
    keywords: ["head injury", "hit my head", "bumped head", "head trauma", "concussion"],
    response: `🚨 Seek medical attention for head injuries!

Signs that need urgent care:
- Loss of consciousness, even briefly
- Confusion or disorientation
- Vomiting
- Severe headache that gets worse
- Unequal pupil size
- Weakness or numbness

If any of these are present, call 117 or go to the hospital immediately.

${disclaimer}`,
    priority: 100,
  },
];

export const healthKnowledge: HealthTopic[] = [
  {
    keywords: ["malaria", "fever", "body pain", "chills", "sweating", "mosquito", "high temperature", "body ache", "cold"],
    response: `Malaria is common in Sierra Leone. Symptoms include fever, chills, body aches, sweating, headache, and fatigue. Malaria is caused by a parasite transmitted through mosquito bites.

Self-care: Rest, drink plenty of fluids, and take paracetamol for fever. Sleep under an insecticide-treated mosquito net to prevent further bites.

When to see a doctor: If you have a fever, visit a healthcare facility for a malaria rapid diagnostic test (RDT). Treatment with artemisinin-based combination therapy (ACT) is effective if started early.

Emergency warning: If the person becomes confused, has difficulty breathing, or cannot wake up, seek emergency care immediately.

${disclaimer}`,
  },
  {
    keywords: ["typhoid", "typhoid fever", "salmonella", "stomach fever"],
    response: `Typhoid is a bacterial infection spread through contaminated food and water. Symptoms include prolonged fever (that gets worse over days), headache, stomach pain, constipation or diarrhea, and extreme fatigue.

Self-care: Drink only clean, boiled, or treated water. Eat light, easily digestible foods. Wash hands thoroughly with soap and water.

When to see a doctor: Typhoid requires antibiotic treatment. Visit a healthcare facility for a blood test if you have a persistent fever with stomach symptoms.

Emergency warning: If there is severe abdominal pain, persistent vomiting, or blood in stool, seek immediate medical help.

${disclaimer}`,
  },
  {
    keywords: ["cholera", "watery diarrhea", "rice water stool", "dehydrated", "severe diarrhea", "vomiting water"],
    response: `Cholera causes severe watery diarrhea and vomiting that can lead to dehydration quickly. It is spread through contaminated water and food.

Self-care: The most important thing is to drink oral rehydration solution (ORS) — mix 6 teaspoons of sugar and half a teaspoon of salt in 1 liter of clean water. Sip frequently. Continue eating if possible.

When to see a doctor: Go to a health facility immediately if you have severe watery diarrhea, especially if you cannot keep fluids down.

Emergency warning: Signs of severe dehydration — dry mouth, sunken eyes, little or no urination, rapid heartbeat, weakness. This is a medical emergency. Seek help immediately.

${disclaimer}`,
  },
  {
    keywords: ["fever", "high temperature", "hot body", "temperature", "feverish"],
    response: `Fever is a sign that your body is fighting an infection. Normal body temperature is around 37°C (98.6°F). A fever is generally a temperature of 38°C (100.4°F) or higher.

Self-care: Rest, drink plenty of fluids (water, ORS, light soup), and take paracetamol if needed. Sponge with lukewarm water to help cool down. Avoid heavy blankets.

When to see a doctor: If fever lasts more than 3 days, is very high (above 40°C / 104°F), or is accompanied by severe headache, rash, stiff neck, difficulty breathing, or confusion.

Emergency warning: In children under 3 months with any fever, seek medical attention immediately. If fever is accompanied by seizure, unconsciousness, or difficulty breathing, call 117.

${disclaimer}`,
  },
  {
    keywords: ["headache", "head hurts", "head pain", "migraine", "tension headache", "head aching"],
    response: `Headaches can be caused by stress, dehydration, lack of sleep, eye strain, or illness such as malaria or typhoid.

Self-care: Drink water, rest in a quiet dark room, avoid bright screens, and apply a cool cloth to your forehead. Paracetamol or ibuprofen may help.

When to see a doctor: If headaches are severe, frequent, or last for several days.

Emergency warning: Seek immediate medical attention if headache is sudden and severe (like a thunderclap), or accompanied by confusion, stiff neck, vision changes, weakness, or slurred speech.

${disclaimer}`,
  },
  {
    keywords: ["cough", "coughing", "dry cough", "wet cough", "productive cough", "persistent cough"],
    response: `Coughing is your body's way of clearing your airways. It can be caused by colds, flu, malaria, COVID-19, allergies, or more serious conditions like pneumonia or tuberculosis.

Self-care: Drink warm fluids like ginger tea with honey. Rest and avoid smoke or dust. A cough that produces phlegm is often a sign of infection.

When to see a doctor: If cough lasts more than 2 weeks, produces blood, is accompanied by high fever, chest pain, or weight loss.

Emergency warning: If you have difficulty breathing, rapid breathing, or chest tightness, seek medical help immediately.

${disclaimer}`,
  },
  {
    keywords: ["flu", "influenza", "cold", "runny nose", "stuffy nose", "sneezing", "common cold", "nasal congestion"],
    response: `The flu (influenza) is a viral infection that causes fever, body aches, fatigue, sore throat, cough, and runny nose. It spreads through coughing, sneezing, and close contact.

Self-care: Rest, drink plenty of fluids, take paracetamol for fever and body aches. Eat nutritious food to support your immune system. Wash hands regularly.

When to see a doctor: If symptoms are severe, last more than a week, or if you have difficulty breathing, chest pain, or confusion.

Emergency warning: Difficulty breathing, persistent high fever, or severe weakness requires urgent medical attention.

${disclaimer}`,
  },
  {
    keywords: ["covid", "covid-19", "coronavirus", "loss of taste", "loss of smell", "loss of appetite"],
    response: `COVID-19 is a respiratory illness caused by the coronavirus. Symptoms include fever, cough, difficulty breathing, loss of taste or smell, fatigue, and body aches.

Self-care: Isolate from others, rest, drink fluids, and take paracetamol for fever. Wear a mask if you must be around others.

When to see a doctor: If you develop difficulty breathing, chest pain, confusion, or a high fever that does not come down.

Emergency warning: Difficulty breathing, chest pain, confusion, or blue lips/face — call 117 immediately.

Prevention: Get vaccinated, wear masks in crowded places, wash hands frequently, and maintain distance from sick people.

${disclaimer}`,
  },
  {
    keywords: ["diarrhea", "loose stool", "loose motion", "running stomach", "frequent stool"],
    response: `Diarrhea is frequent loose or watery bowel movements. It can be caused by infections (viral, bacterial, or parasitic), food poisoning, or contaminated water.

Self-care: The most important thing is to prevent dehydration. Drink ORS (oral rehydration solution) — mix 6 teaspoons of sugar and half a teaspoon of salt in 1 liter of clean water. Continue eating small amounts of light food like rice, bananas, or crackers.

When to see a doctor: If diarrhea lasts more than 2 days, contains blood or mucus, or is accompanied by high fever or severe abdominal pain.

Emergency warning: Signs of severe dehydration — dry mouth, sunken eyes, no urination for 8+ hours, weakness, dizziness. Seek medical care immediately.

${disclaimer}`,
  },
  {
    keywords: ["vomiting", "nausea", "throwing up", "feeling sick", "queasy", "upset stomach"],
    response: `Vomiting and nausea can be caused by infections, food poisoning, pregnancy (morning sickness), or other illnesses.

Self-care: Rest your stomach — avoid solid food for a few hours. Sip clear fluids like water or ORS slowly. When you feel better, try bland foods like crackers, rice, or bread.

When to see a doctor: If vomiting lasts more than 24 hours, you cannot keep any fluids down, there is blood in vomit, or it is accompanied by severe abdominal pain or high fever.

Emergency warning: In children, persistent vomiting with inability to keep fluids down can lead to rapid dehydration. Seek medical care.

${disclaimer}`,
  },
  {
    keywords: ["stomach pain", "abdominal pain", "belly pain", "tummy ache", "stomach ache", "stomach cramps", "abdominal cramps"],
    response: `Stomach pain can have many causes — indigestion, gas, constipation, infections (like typhoid or cholera), ulcers, or more serious conditions.

Self-care: Rest, avoid heavy or spicy foods, drink clear fluids. A warm compress on the belly may help. Eat small, light meals.

When to see a doctor: If pain is severe, lasts more than a few days, or is accompanied by fever, vomiting, blood in stool, or unexplained weight loss.

Emergency warning: Seek emergency care immediately if pain is sudden and severe, if the abdomen is hard and tender to touch, or if there is blood in vomit or stool.

${disclaimer}`,
  },
  {
    keywords: ["pregnant", "pregnancy", "expecting", "prenatal", "antenatal", "pregnancy fever", "morning sickness"],
    response: `If you are pregnant and have a fever, this needs prompt medical evaluation. Fever during pregnancy can harm both mother and baby.

Self-care: Take paracetamol (avoid ibuprofen/aspirin during pregnancy). Rest, drink fluids, and use a cool cloth to reduce temperature.

When to see a doctor: Any fever during pregnancy - visit a health facility for proper evaluation. Also seek care if you have severe vomiting, vaginal bleeding, severe headache, or decreased baby movements.

Emergency warning: Severe abdominal pain, heavy bleeding, severe headache with vision changes, or convulsions — call 117 immediately.

All pregnant women should attend regular antenatal care visits at the nearest health facility.

${disclaimer}`,
  },
  {
    keywords: ["high blood pressure", "hypertension", "blood pressure", "bp", "high bp"],
    response: `High blood pressure (hypertension) often has no symptoms but can lead to serious health problems like heart disease and stroke if not managed.

Self-care: Reduce salt intake, eat more vegetables and fruits, exercise regularly (walking is great), maintain a healthy weight, limit alcohol, and avoid smoking. Monitor your blood pressure regularly.

When to see a doctor: If you have been diagnosed with hypertension, take your medications as prescribed. Visit a health facility for regular check-ups.

Emergency warning: If you have a severe headache, chest pain, shortness of breath, vision changes, or nosebleeds with high BP, seek emergency care immediately — this could be a hypertensive crisis.

${disclaimer}`,
  },
  {
    keywords: ["diabetes", "sugar", "high blood sugar", "blood sugar", "diabetic", "sweet urine"],
    response: `Diabetes is a condition where blood sugar levels are too high. Symptoms include frequent urination, excessive thirst, unexplained weight loss, fatigue, and slow-healing wounds.

Self-care: Eat a balanced diet with limited sugar and refined carbohydrates. Exercise regularly. Maintain a healthy weight. Monitor your blood sugar if you have access to a glucose meter.

When to see a doctor: If you have symptoms of diabetes, visit a health facility for a blood sugar test. If you are already diagnosed, take your medications consistently and attend regular check-ups.

Emergency warning: Signs of very high blood sugar — extreme thirst, frequent urination, nausea, rapid breathing, confusion. Signs of low blood sugar — shakiness, sweating, confusion, weakness. Both need urgent medical attention.

${disclaimer}`,
  },
  {
    keywords: ["asthma", "wheezing", "difficulty breathing", "asthma attack", "short of breath", "breathless"],
    response: `Asthma is a condition where airways narrow and swell, making it hard to breathe. It can be triggered by allergies, cold air, exercise, smoke, or infections.

Self-care: Identify and avoid your triggers. Keep your inhaler (if prescribed) with you at all times. Use it as soon as symptoms start.

When to see a doctor: If you are having asthma symptoms frequently, or your inhaler is not giving relief. Long-term control medication may help.

Emergency warning: If you cannot speak in full sentences, your lips or fingernails turn blue, or your inhaler is not helping — call 117 immediately.

${disclaimer}`,
  },
  {
    keywords: ["pneumonia", "lung infection", "chest infection", "difficulty breathing", "rapid breathing"],
    response: `Pneumonia is an infection of the lungs that can be caused by bacteria, viruses, or fungi. Symptoms include cough with phlegm, fever, chills, rapid or difficult breathing, and chest pain when breathing or coughing.

Self-care: Rest, drink plenty of fluids, take paracetamol for fever. Sleep in a slightly upright position to make breathing easier.

When to see a doctor: Pneumonia requires medical treatment, usually with antibiotics. Visit a health facility if you have a cough with fever and difficulty breathing.

Emergency warning: Difficulty breathing, blue lips or fingernails, confusion, or coughing up blood — seek emergency care immediately.

Pneumonia is especially dangerous for children under 5 and the elderly. Vaccination can help prevent it.

${disclaimer}`,
  },
  {
    keywords: ["tuberculosis", "tb", "tb symptoms", "coughing blood", "night sweats", "weight loss"],
    response: `Tuberculosis (TB) is a bacterial infection that primarily affects the lungs. Symptoms include a persistent cough lasting more than 2 weeks, coughing up blood, night sweats, fever, chest pain, and unexplained weight loss.

Self-care: Cover your mouth when coughing or sneezing. Ensure good ventilation in your home. Eat nutritious food to support your immune system.

When to see a doctor: If you have a cough lasting more than 2 weeks, visit a health facility for TB testing. TB is curable with proper treatment. Treatment is free at government health facilities in Sierra Leone.

Emergency warning: Coughing up large amounts of blood or severe difficulty breathing requires urgent medical care.

${disclaimer}`,
  },
  {
    keywords: ["hiv", "aids", "hiv awareness", "hiv symptoms", "hiv test", "stigma"],
    response: `HIV is a virus that weakens the immune system. It is transmitted through unprotected sex, contaminated needles, blood transfusions, or from mother to child during pregnancy or breastfeeding.

Self-care: Know your status — get tested at any health facility. Testing is confidential and free at many sites in Sierra Leone. Use condoms to protect yourself and your partner.

When to see a doctor: If you think you may have been exposed to HIV, visit a health facility within 72 hours for post-exposure prophylaxis (PEP). If you are HIV-positive, start antiretroviral therapy (ART) as soon as possible. ART is free in Sierra Leone and allows people with HIV to live healthy, normal lives.

Prevention is key: ABC — Abstain, Be faithful, use Condoms. Get tested regularly.

${disclaimer}`,
  },
  {
    keywords: ["dengue", "dengue fever", "breakbone fever", "severe headache", "joint pain", "rash"],
    response: `Dengue fever is a viral infection spread by mosquitoes. Symptoms include high fever, severe headache (especially behind the eyes), joint and muscle pain, rash, and nausea.

Self-care: Rest, drink plenty of fluids, and take paracetamol for fever and pain. Do NOT take ibuprofen, aspirin, or other NSAIDs as they can increase bleeding risk. Sleep under a mosquito net.

When to see a doctor: If fever persists or symptoms become severe. Dengue usually resolves in 2-7 days but can become serious.

Emergency warning: Signs of severe dengue — severe abdominal pain, persistent vomiting, bleeding gums or nose, blood in vomit or stool, extreme weakness, restlessness. Seek emergency care immediately.

${disclaimer}`,
  },
  {
    keywords: ["yellow fever", "jaundice", "yellow eyes", "yellow skin", "fever jaundice"],
    response: `Yellow fever is a viral infection spread by mosquitoes. Symptoms include sudden fever, chills, severe headache, back pain, nausea, and yellowing of the skin and eyes (jaundice).

Self-care: Rest and drink fluids. Take paracetamol for fever. Prevent mosquito bites by using nets and repellent.

When to see a doctor: If you have fever with jaundice, seek medical attention immediately. Yellow fever can be severe.

Prevention: The yellow fever vaccine is very effective and is part of the routine immunization schedule in Sierra Leone. All travelers to Sierra Leone should also be vaccinated.

${disclaimer}`,
  },
  {
    keywords: ["skin infection", "skin rash", "rash", "itching", "fungal infection", "wound infection", "boil"],
    response: `Skin infections can be caused by bacteria, fungi, or viruses. Common types include boils, cellulitis, ringworm, scabies, and infected wounds.

Self-care: Keep the affected area clean and dry. Wash with soap and water daily. Avoid scratching. For fungal infections like ringworm, over-the-counter antifungal creams may help.

When to see a doctor: If the area becomes increasingly red, swollen, warm, or painful. If there is pus or drainage. If you have a fever. If the infection does not improve in a few days.

Emergency warning: Red streaks spreading from the wound, high fever, or rapid swelling — these could be signs of a serious infection spreading through the blood. Seek emergency care.

${disclaimer}`,
  },
  {
    keywords: ["eye infection", "conjunctivitis", "red eye", "pink eye", "eye discharge", "itchy eye"],
    response: `Eye infections like conjunctivitis (pink eye) cause redness, itching, discharge, and sometimes swelling. They can be bacterial, viral, or allergic.

Self-care: Wash hands frequently and avoid touching your eyes. Clean away discharge with a clean, damp cloth. Do not share towels or pillows. Discard eye makeup.

When to see a doctor: If there is yellow or green discharge, severe pain, vision changes, or if symptoms persist more than 2-3 days. Bacterial eye infections need antibiotic eye drops.

Emergency warning: Sudden vision loss, severe eye pain, eye injury, or chemical exposure to the eye — seek emergency care immediately.

${disclaimer}`,
  },
  {
    keywords: ["ear pain", "earache", "ear infection", "pain in ear", "blocked ear"],
    response: `Ear pain can be caused by infections (middle ear or outer ear), wax buildup, or a foreign object. It is common in children.

Self-care: A warm cloth placed over the ear may help with pain. Paracetamol or ibuprofen can relieve discomfort. Do not insert anything into the ear, including cotton swabs.

When to see a doctor: If pain is severe, accompanied by fever, hearing loss, or drainage from the ear. Ear infections may require antibiotics.

Emergency warning: Severe pain with swelling behind the ear, or discharge that is bloody or pus-like — seek medical attention.

${disclaimer}`,
  },
  {
    keywords: ["toothache", "tooth pain", "dental pain", "tooth infection", "abscess tooth", "gum pain"],
    response: `Toothache can be caused by tooth decay, gum infection, a cracked tooth, or an abscess. Symptoms include throbbing pain, sensitivity to hot or cold, and swelling of the gum or face.

Self-care: Rinse your mouth with warm salt water. Take paracetamol or ibuprofen for pain. Avoid very hot, cold, or sugary foods. Do not place aspirin directly on the gum.

When to see a doctor: Visit a dental clinic or health facility if pain persists more than 1-2 days. An abscess needs treatment with antibiotics and possibly extraction or filling.

Emergency warning: Swelling of the face or neck, difficulty swallowing, or fever — these could indicate a serious spreading infection. Seek emergency care.

${disclaimer}`,
  },
  {
    keywords: ["dehydration", "dehydrated", "not drinking enough", "dry mouth", "sunken eyes", "loss of fluid"],
    response: `Dehydration happens when your body loses more fluids than it takes in. It is common with diarrhea, vomiting, fever, or in hot weather. Signs include thirst, dry mouth, dark urine, fatigue, dizziness, and sunken eyes.

Self-care: Drink ORS (oral rehydration solution) — mix 6 teaspoons of sugar and half a teaspoon of salt in 1 liter of clean water. Sip frequently. Also drink water, coconut water, or light soup. Continue eating.

When to see a doctor: If you cannot keep fluids down, have not urinated for 8+ hours, or feel extremely weak and dizzy.

Emergency warning: In children, signs of severe dehydration include no tears when crying, very dry mouth, sunken eyes, no wet diaper for 6+ hours, unusual sleepiness or fussiness. Seek medical care immediately.

Prevention: Drink plenty of water, especially in hot weather or when sick.

${disclaimer}`,
  },
  {
    keywords: ["nutrition", "diet", "malnutrition", "eating well", "healthy eating", "balanced diet", "vitamins"],
    response: `Good nutrition is essential for health. A balanced diet should include:
- Staples: rice, cassava, potato, yam
- Proteins: fish, chicken, beans, groundnuts, eggs
- Fruits: mango, banana, orange, pawpaw
- Vegetables: cassava leaves, potato leaves, okra, cabbage
- Healthy fats: palm oil (in moderation), groundnut oil

Self-care tips: Eat a variety of foods. Wash fruits and vegetables before eating. Drink clean water. Breastfeed infants exclusively for the first 6 months.

When to see a doctor: If you or your child is losing weight unexpectedly, has poor appetite for a long time, or shows signs of malnutrition (swollen belly, thinning hair, weak muscles).

In Sierra Leone, nutrition supplements and therapeutic feeding are available at health facilities for severely malnourished children.

${disclaimer}`,
  },
  {
    keywords: ["mental health", "depression", "anxiety", "stress", "sad", "feeling down", "worry", "mental illness"],
    response: `Mental health is just as important as physical health. Feeling sad, anxious, or stressed at times is normal, but when these feelings persist, you may need support.

Self-care: Talk to someone you trust. Get enough sleep. Eat well. Exercise (even a short walk helps). Avoid alcohol and drugs. Practice deep breathing when feeling anxious.

When to see a doctor: If you feel sad or hopeless for more than 2 weeks, have lost interest in things you used to enjoy, have changes in appetite or sleep, or have thoughts of harming yourself.

In Sierra Leone, mental health services are available at major hospitals and some community health centers. You are not alone — help is available.

Crisis: If you are thinking about suicide, please call 117 or go to the nearest hospital immediately.

${disclaimer}`,
  },
  {
    keywords: ["child health", "childcare", "baby", "infant", "newborn", "child fever", "child diarrhea", "child vaccination", "immunization"],
    response: `Child health is important. Key things every parent should know:

Fever in children: Any fever in a baby under 3 months needs immediate medical attention. For older children, give paracetamol, keep them cool, and ensure they drink plenty.

Diarrhea in children: Give ORS frequently. Continue breastfeeding. Seek help if there are signs of dehydration.

Vaccinations: Ensure your child receives all routine vaccinations at your nearest health facility. Vaccines protect against polio, measles, tuberculosis (BCG), yellow fever, and more.

Feeding: Breastfeed exclusively for the first 6 months. After 6 months, introduce complementary foods while continuing breastfeeding.

When to see a doctor: Any fast breathing, inability to feed, persistent vomiting, fever, convulsions, or unusual sleepiness in a child needs urgent medical evaluation.

Emergency warning: If a child is unconscious, having a seizure, or struggling to breathe, call 117 immediately.

${disclaimer}`,
  },
  {
    keywords: ["first aid", "emergency", "first aid kit", "minor injury", "cut", "scrape", "wound"],
    response: `Basic first aid for common injuries:

Cuts and scrapes: Clean the wound with clean water and soap. Apply pressure with a clean cloth to stop bleeding. Cover with a clean bandage. Change the bandage daily.

Burns: Cool under running water for at least 10 minutes. Do not apply ice, butter, or toothpaste. Cover loosely with a clean cloth. Seek medical help for large or deep burns.

Sprains and strains: Rest the injured area. Apply a cold compress (ice wrapped in cloth) for 15-20 minutes. Compress with a bandage. Elevate the injured limb. Take paracetamol for pain.

First aid kit essentials: Clean bandages, gauze, adhesive tape, antiseptic (like hydrogen peroxide), scissors, pain relievers (paracetamol/ibuprofen), gloves, and ORS sachets.

Remember: For serious injuries, call 117 or go to the hospital immediately.

${disclaimer}`,
  },
  {
    keywords: ["emergency", "117", "emergency services", "emergency number", "accident", "trauma"],
    response: `In Sierra Leone, the national emergency number is 117.

Call 117 for:
- Medical emergencies (unconsciousness, severe bleeding, difficulty breathing, chest pain)
- Fires
- Accidents and trauma
- Any life-threatening situation

Before calling: Try to stay calm. Know your location. Describe what happened clearly.

If you cannot reach 117:
- Go to the nearest hospital or health facility immediately
- Ask someone to help you get there
- Contact a nearby community health worker

Emergency facilities in Sierra Leone: Major hospitals include Connaught Hospital (Freetown), Ola During Children's Hospital (Freetown), 34 Military Hospital (Freetown), and government hospitals in all district headquarters.

Save 117 in your phone today. Every second counts in an emergency.

${disclaimer}`,
  },
  {
    keywords: ["cough blood", "blood in cough", "hemoptysis", "spit blood"],
    response: `Coughing up blood can be a sign of a serious condition such as tuberculosis (TB), pneumonia, bronchitis, or other lung infections.

Self-care: Note how much blood you see and whether it happens frequently. Avoid strenuous activity.

When to see a doctor: Any amount of blood in your cough needs medical evaluation. Visit a health facility for a check-up and possible TB testing.

Emergency warning: If you are coughing up large amounts of blood, have difficulty breathing, or feel dizzy, seek emergency care immediately.

${disclaimer}`,
  },
  {
    keywords: ["anemia", "weak", "tired", "fatigue", "low blood", "pale", "iron deficiency", "lack of energy"],
    response: `Anemia occurs when your blood doesn't have enough healthy red blood cells, often due to iron deficiency. Symptoms include fatigue, weakness, pale skin, dizziness, shortness of breath, and cold hands and feet.

Self-care: Eat iron-rich foods — dark leafy greens (cassava leaves, potato leaves), beans, groundnuts, meat, fish, and eggs. Vitamin C (from oranges, lemons) helps your body absorb iron.

When to see a doctor: If you feel persistently tired and weak, visit a health facility for a blood test. Anemia is especially common in pregnant women and children in Sierra Leone.

Emergency warning: Severe chest pain, difficulty breathing, or rapid heart rate with anemia symptoms — seek medical care.

${disclaimer}`,
  },
  {
    keywords: ["worm", "intestinal worms", "stomach worm", "parasite", "worm infection"],
    response: `Intestinal worms are common in Sierra Leone, especially in children. They can cause stomach pain, diarrhea, weight loss, tiredness, and anal itching. Worms are spread through contaminated soil, food, or water.

Self-care: Wash hands thoroughly with soap after using the toilet and before eating. Wash fruits and vegetables. Wear shoes outdoors. Keep fingernails short and clean.

When to see a doctor: Treatment with deworming medication (like albendazole or mebendazole) is available at health facilities. In Sierra Leone, routine deworming is recommended every 6 months for children.

See a doctor if you see worms in your stool, or if a child has persistent stomach pain, poor appetite, or weight loss.

${disclaimer}`,
  },
  {
    keywords: ["malnutrition", "underweight", "stunted", "wasting", "nutrient deficiency", "kwashiorkor", "marasmus"],
    response: `Malnutrition means the body is not getting enough nutrients. In Sierra Leone, it is a serious concern for children. Signs include weight loss, slow growth, tiredness, swelling in feet and face, and frequent illness.

Self-care: Feed children a variety of foods — include proteins (fish, eggs, beans), fruits, vegetables, and staples. Breastfeed infants exclusively for the first 6 months. Treat any underlying illness like diarrhea or malaria promptly.

When to see a doctor: If a child is losing weight, has swelling in the feet or face, is not growing well, or is sick frequently, visit a health facility. Severe malnutrition is treated with therapeutic foods (like Plumpy'Nut) available at health centers.

Emergency warning: Severe wasting, inability to eat or drink, or unconsciousness — seek emergency care immediately.

${disclaimer}`,
  },
  {
    keywords: ["rabies", "dog bite", "animal bite", "bitten by dog", "bitten by cat"],
    response: `Rabies is a deadly virus transmitted through the saliva of infected animals, most commonly dogs. If you are bitten or scratched by a dog, cat, or other animal, you need immediate medical attention.

Self-care: Wash the wound thoroughly with soap and running water for at least 15 minutes. Apply an antiseptic like iodine or alcohol.

When to see a doctor: Go to the nearest health facility immediately, even if the wound is small. You may need rabies vaccine (post-exposure prophylaxis). Delaying treatment can be fatal.

Emergency warning: Once rabies symptoms appear (fever, difficulty swallowing, agitation, fear of water), the disease is almost always fatal. That is why you must seek treatment immediately after any animal bite.

Do not kill the animal if possible — health authorities may need to observe it.

${disclaimer}`,
  },
  {
    keywords: ["measles", "rash fever", "red spots", "koplik spots", "measles rash"],
    response: `Measles is a highly contagious viral infection that causes fever, cough, runny nose, red eyes, and a red rash that spreads from the head down. It can be serious, especially in malnourished children.

Self-care: Give plenty of fluids, rest, and treat fever with paracetamol. Isolate the sick person to prevent spreading. Ensure good nutrition.

When to see a doctor: Measles requires medical attention, especially in children. Vitamin A supplementation is often given. Visit a health facility if you suspect measles.

Prevention: Measles vaccination is part of the routine immunization schedule. Ensure your child is fully vaccinated.

Emergency warning: Difficulty breathing, confusion, seizures, or signs of dehydration — seek emergency care.

${disclaimer}`,
  },
  {
    keywords: ["polio", "polio symptoms", "polio vaccine", "limb weakness", "paralysis"],
    response: `Polio is a viral disease that can cause permanent paralysis. It mainly affects children under 5. Thanks to vaccination efforts, polio cases have been greatly reduced in Sierra Leone, but continued vaccination is critical.

Symptoms include sudden onset of fever, fatigue, headache, vomiting, stiff neck, and limb weakness or paralysis.

Prevention: The polio vaccine is given as part of routine immunization — make sure your child receives all doses. During national immunization campaigns, ensure all children under 5 are vaccinated.

When to see a doctor: If a child has sudden weakness in an arm or leg, or cannot move a limb, seek medical attention immediately.

${disclaimer}`,
  },
  {
    keywords: ["std", "sexually transmitted", "sti", "genital sore", "discharge", "painful urination", "gonorrhea", "syphilis"],
    response: `Sexually transmitted infections (STIs) include gonorrhea, syphilis, chlamydia, HIV, and others. Symptoms may include unusual genital discharge, sores or bumps, pain during urination, and itching.

Self-care: Abstain from sex until you have been treated. Use condoms to prevent transmission. Inform your partner(s) so they can also get tested and treated.

When to see a doctor: Visit a health facility for testing and treatment. Most STIs are curable with antibiotics. Early treatment prevents complications and further spread.

For HIV, get tested regularly. Free treatment (ART) is available in Sierra Leone.

${disclaimer}`,
  },
  {
    keywords: ["ultrasound", "scan", "x-ray", "laboratory", "lab test", "medical test", "diagnostic"],
    response: `SaloneCare can help you find diagnostic services near you. Common tests and scans available in Sierra Leone include:

- Blood tests (malaria RDT, blood count, blood sugar, typhoid, HIV, hepatitis)
- Urine tests (pregnancy test, UTI testing)
- Stool tests (for worms, cholera)
- Ultrasound scans (pregnancy, abdominal)
- X-rays (chest, bones)
- CT scans (at major hospitals in Freetown)

To book a test or scan, visit the nearest hospital or diagnostic center. You can also use the appointments feature in SaloneCare to schedule a visit.

${disclaimer}`,
  },
  {
    keywords: ["hepatitis", "liver infection", "yellow skin", "hepatitis a", "hepatitis b", "hepatitis c"],
    response: `Hepatitis is inflammation of the liver, usually caused by a virus. Types A, B, and C are the most common.

Hepatitis A: Spread through contaminated food/water. Causes fever, nausea, abdominal pain, and jaundice. Usually resolves on its own. Prevention: clean water, hand washing.

Hepatitis B and C: Spread through blood, unprotected sex, and from mother to child. Can become chronic and lead to liver damage. Prevention: hepatitis B vaccine is part of routine immunization.

Symptoms of all types: Fever, fatigue, nausea, loss of appetite, abdominal pain, dark urine, and yellow skin/eyes.

When to see a doctor: If you have jaundice or symptoms of hepatitis, visit a health facility for testing. Sierra Leone has free hepatitis B testing and treatment at some health facilities.

${disclaimer}`,
  },
  {
    keywords: ["book appointment", "book a doctor", "make appointment", "schedule appointment", "appointment booking", "how to book", "see a doctor"],
    response: `To book an appointment through SaloneCare:

1. Open the SaloneCare app and navigate to the Appointments section
2. Select "Book New Appointment"
3. Choose your preferred hospital or clinic
4. Select a doctor or department
5. Pick a date and time that works for you
6. Confirm your booking

You can also visit the nearest health facility directly to register and see a doctor. For emergencies, call 117 or go directly to the hospital.

${disclaimer}`,
  },
  {
    keywords: ["order medicine", "buy medicine", "get medicine", "medicine delivery", "prescription", "pharmacy order"],
    response: `To order medicine through SaloneCare:

1. Go to the Pharmacy section in the SaloneCare app
2. Browse available medicines or search for what you need
3. Upload your prescription if required
4. Add items to your cart
5. Choose delivery or pickup
6. Confirm your order

Make sure to only take medication prescribed by a qualified healthcare professional. Never share prescription medication with others.

For urgent medicine needs, visit the nearest pharmacy or health facility directly.

${disclaimer}`,
  },
  {
    keywords: ["contact pharmacy", "pharmacy near me", "find pharmacy", "pharmacy contact", "nearby pharmacy"],
    response: `To find pharmacies through SaloneCare:

1. Open the Pharmacy section in the app
2. Use the pharmacy locator or search
3. View pharmacy details including address, contact number, and hours
4. Contact them directly or place an order through the app

If you need a pharmacy right now, look for the nearest pharmacy in your area. Many pharmacies in Sierra Leone are open during regular business hours. For emergencies, go to a hospital pharmacy.

${disclaimer}`,
  },
  {
    keywords: ["nearby hospital", "nearest hospital", "find hospital", "hospital near me", "health facility", "clinic near me"],
    response: `To find nearby health facilities through SaloneCare:

1. Open the Locator or Hospitals section in the SaloneCare app
2. The app will show hospitals and clinics near you
3. You can see contact information, services offered, and directions

Major hospitals in Sierra Leone include:
- Connaught Hospital (Freetown)
- Ola During Children's Hospital (Freetown)
- 34 Military Hospital (Freetown)
- Government hospitals in all district headquarters
- Community health centers (CHCs) and peripheral health units (PHUs) in rural areas

For emergencies, call 117 or go to the nearest hospital immediately.

${disclaimer}`,
  },
  {
    keywords: ["chat with doctor", "talk to doctor", "message doctor", "doctor consultation", "telemedicine", "online doctor"],
    response: `To chat with a doctor through SaloneCare:

1. Go to the Messaging section in the SaloneCare app
2. Select a doctor from the available list
3. Start a conversation by typing your question

Please note that online consultations provide general guidance only. For serious symptoms or emergencies, visit a health facility or call 117.

For urgent medical issues, do not rely on messaging — go to the nearest hospital immediately.

${disclaimer}`,
  },
  {
    keywords: ["create account", "sign up", "register", "new account", "how to register"],
    response: `To create a SaloneCare account:

1. Open the SaloneCare app
2. Click on "Sign Up" or "Create Account"
3. Enter your full name, email address, and phone number
4. Create a password
5. Verify your account through the OTP sent to your phone or email
6. Complete your profile

Once registered, you can book appointments, order medicine, message doctors, and access other health services.

If you have trouble registering, contact support through the app or visit the nearest SaloneCare partner facility for assistance.

${disclaimer}`,
  },
  {
    keywords: ["reset password", "forgot password", "change password", "lost password", "password help"],
    response: `To reset your SaloneCare password:

1. On the login screen, tap "Forgot Password"
2. Enter your registered email address or phone number
3. You will receive an OTP (one-time password) for verification
4. Enter the OTP
5. Create a new password
6. Log in with your new password

Choose a strong password that you can remember. Do not share your password with anyone.

If you continue to have issues, contact SaloneCare support for assistance.

${disclaimer}`,
  },
];

export const greetings: HealthTopic[] = [
  {
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"],
    response: `Hello! Welcome to SaloneCare. I'm your health assistant. How can I help you today? You can ask me about health conditions, medicines, hospitals, or how to use the SaloneCare app.`,
  },
  {
    keywords: ["how are you", "how are you doing", "how's it going", "what's up", "how do you do"],
    response: `I'm doing well, thank you! I'm here to help you with your health questions. What can I assist you with today?`,
  },
  {
    keywords: ["thank you", "thanks", "thank you so much", "thanks a lot", "appreciate it", "thx"],
    response: `You're very welcome! I'm happy to help. If you have any more questions, feel free to ask. Stay healthy!`,
  },
  {
    keywords: ["bye", "goodbye", "see you", "good night", "take care", "farewell"],
    response: `Goodbye! Take care of yourself. Remember, SaloneCare is here whenever you need health information or assistance. Stay safe!`,
  },
  {
    keywords: ["what can you do", "help", "capabilities", "what do you do", "how can you help"],
    response: `I'm your SaloneCare Health Assistant! I can help you with:

🩺 Health information — symptoms, conditions, self-care tips
💊 Medicine orders — how to order through the app
🏥 Hospital locator — finding nearby health facilities
📅 Appointment booking — how to schedule a visit
👶 Child health — fever, vaccinations, nutrition
🚨 Emergency guidance — when and where to seek help

What would you like to know about?`,
  },
  {
    keywords: ["your name", "who are you", "what are you"],
    response: `I'm the SaloneCare Health Assistant! I'm here to provide you with health information, help you navigate the SaloneCare app, and offer guidance on common health concerns. I'm not a doctor, but I can point you in the right direction. How can I help you today?`,
  },
];
