export interface Question {
  id: string;
  text: string;
  options?: string[];
}

export interface EmergencySignal {
  keyword: string;
  emergencyType: string;
  severity: 'immediate' | 'warning';
  questionId?: string;
}

export interface SymptomModule {
  id: string;
  keywords: string[];
  name: string;
  triageQuestions: Question[];
  emergencySignals: EmergencySignal[];
  minQuestions: number;
}

const emoji = (s: string) => s;

const disclaimer = "\n\n⚠️ I'm an AI assistant — I can't diagnose or prescribe. This is general guidance only. Always consult a healthcare professional for medical advice.";

function formatResponse(title: string, sections: string[]): string {
  return `**${title}**\n\n${sections.join('\n\n')}${disclaimer}`;
}

export function matchOption(userAnswer: string, options: string[]): string | null {
  const normalized = userAnswer.toLowerCase().trim();

  for (const option of options) {
    const optionNorm = option.toLowerCase().trim();
    if (normalized === optionNorm) return option;
    if (normalized.includes(optionNorm)) return option;
    if (optionNorm.includes(normalized) && normalized.length >= 3) return option;

    const numMatch = normalized.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      const rangeMatch = option.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (rangeMatch && num >= parseInt(rangeMatch[1]) && num <= parseInt(rangeMatch[2])) return option;
      const gtMatch = option.match(/more than (\d+)/i);
      if (gtMatch && num > parseInt(gtMatch[1])) return option;
    }
  }

  return null;
}

const commonQuestions: Question[] = [
  { id: 'age', text: 'How old are you?', options: ['Under 5', '5–17', '18–40', '41–60', 'Over 60'] },
  { id: 'conditions', text: 'Do you have any existing medical conditions? (diabetes, high blood pressure, asthma, etc.)', options: ['None', 'Diabetes', 'High blood pressure', 'Asthma', 'Other'] },
  { id: 'medications', text: 'Are you currently taking any medications?', options: ['None', 'Yes, for a chronic condition', 'Yes, for this illness', 'Prefer not to say'] },
];

export const symptomModules: SymptomModule[] = [
  {
    id: 'vomiting',
    keywords: ['vomit', 'vomiting', 'throwing up', 'nausea', 'nauseous', 'queasy', 'sick to stomach', 'can\'t keep food down', 'puking'],
    name: 'Vomiting & Nausea',
    triageQuestions: [
      { id: 'vomit_onset', text: 'When did the vomiting start?', options: ['A few hours ago', 'Today', 'Yesterday', 'Several days ago'] },
      { id: 'vomit_frequency', text: 'How many times have you vomited?', options: ['1–2 times', '3–5 times', 'More than 5 times', 'Constantly'] },
      { id: 'vomit_fluids', text: 'Can you keep fluids down? (Water, ORS, etc.)', options: ['Yes', 'No, I vomit everything', 'I can sip a little'] },
      { id: 'vomit_blood', text: 'Is there any blood in your vomit?', options: ['No', 'Yes, small streaks', 'Yes, a lot', 'It looks like coffee grounds'] },
      { id: 'vomit_diarrhea', text: 'Do you also have diarrhea?', options: ['No', 'Yes, mild', 'Yes, severe watery diarrhea'] },
      { id: 'vomit_fever', text: 'Do you have a fever?', options: ['No', 'Yes, mild', 'Yes, high fever'] },
      { id: 'vomit_pain', text: 'Do you have any abdominal pain?', options: ['No pain', 'Mild discomfort', 'Moderate pain', 'Severe pain'] },
      ...commonQuestions,
    ],
    emergencySignals: [
      { keyword: 'blood', emergencyType: 'blood_in_vomit', severity: 'immediate' },
      { keyword: 'coffee grounds', emergencyType: 'blood_in_vomit', severity: 'immediate' },
      { keyword: 'a lot', emergencyType: 'blood_in_vomit', severity: 'immediate' },
      { keyword: 'more than 5', emergencyType: 'persistent_vomiting', severity: 'warning' },
      { keyword: 'constantly', emergencyType: 'persistent_vomiting', severity: 'warning' },
      { keyword: 'no i vomit everything', emergencyType: 'cannot_keep_fluids', severity: 'warning' },
      { keyword: 'severe pain', emergencyType: 'severe_abdominal_pain', severity: 'immediate' },
      { keyword: 'high fever', emergencyType: 'high_fever', severity: 'warning' },
      { keyword: 'severe watery diarrhea', emergencyType: 'severe_dehydration_risk', severity: 'warning' },
    ],
    minQuestions: 4,
  },
  {
    id: 'headache',
    keywords: ['headache', 'head pain', 'head hurts', 'migraine', 'head aching', 'throbbing head', 'tension headache'],
    name: 'Headache',
    triageQuestions: [
      { id: 'headache_onset', text: 'When did the headache start?', options: ['A few hours ago', 'Today', 'Yesterday', 'Several days', 'It comes and goes'] },
      { id: 'headache_severity', text: 'How severe is the pain on a scale of 1–10? (1 = mild, 10 = worst)', options: ['1–3 (mild)', '4–6 (moderate)', '7–8 (severe)', '9–10 (worst ever)'] },
      { id: 'headache_location', text: 'Where is the pain located?', options: ['Forehead / front', 'One side of head', 'Back of head', 'All over', 'Behind the eyes'] },
      { id: 'headache_fever', text: 'Do you have a fever?', options: ['No', 'Yes, mild', 'Yes, high fever'] },
      { id: 'headache_vision', text: 'Have you noticed any vision changes? (blurred vision, flashing lights, sensitivity to light)', options: ['No', 'Yes, blurred vision', 'Yes, sensitivity to light', 'Yes, flashing lights'] },
      { id: 'headache_neck', text: 'Do you have a stiff neck?', options: ['No', 'Yes, slightly', 'Yes, very stiff and painful'] },
      { id: 'headache_history', text: 'Do you have a history of migraines or frequent headaches?', options: ['No', 'Yes, migraines', 'Yes, tension headaches', 'This is unusual for me'] },
      ...commonQuestions,
    ],
    emergencySignals: [
      { keyword: '9–10 (worst ever)', emergencyType: 'thunderclap_headache', severity: 'immediate' },
      { keyword: 'yes, very stiff and painful', emergencyType: 'meningitis_signs', severity: 'immediate' },
      { keyword: 'high fever', emergencyType: 'fever_with_headache', severity: 'warning' },
      { keyword: 'yes, blurred vision', emergencyType: 'vision_changes', severity: 'warning' },
    ],
    minQuestions: 4,
  },
  {
    id: 'fever',
    keywords: ['fever', 'high temperature', 'hot body', 'temperature', 'feverish', 'feeling hot', 'body hot', 'chills', 'sweating fever'],
    name: 'Fever',
    triageQuestions: [
      { id: 'fever_temp', text: 'How high is the fever? Do you know the temperature?', options: ['Low grade (under 38°C / 100°F)', 'Moderate (38–39°C / 100–102°F)', 'High (39–40°C / 102–104°F)', 'Very high (over 40°C / 104°F)', 'I don\'t have a thermometer'] },
      { id: 'fever_duration', text: 'How long have you had the fever?', options: ['A few hours', '1 day', '2–3 days', 'More than 3 days', 'It keeps coming and going'] },
      { id: 'fever_symptoms', text: 'What other symptoms do you have?', options: ['None, just fever', 'Headache and body aches', 'Cough and runny nose', 'Stomach pain or vomiting', 'Rash'] },
      { id: 'fever_convulsions', text: 'Have you had any convulsions or seizures with the fever?', options: ['No', 'Yes'] },
      { id: 'fever_consciousness', text: 'Have you felt confused, drowsy, or had difficulty waking up?', options: ['No, I\'m alert', 'Yes, a little confused', 'Yes, very drowsy'] },
      ...commonQuestions,
    ],
    emergencySignals: [
      { keyword: 'Yes', emergencyType: 'febrile_seizure', severity: 'immediate', questionId: 'fever_convulsions' },
      { keyword: 'yes, a little confused', emergencyType: 'altered_consciousness', severity: 'immediate' },
      { keyword: 'yes, very drowsy', emergencyType: 'altered_consciousness', severity: 'immediate' },
      { keyword: 'very high (over 40°C / 104°F)', emergencyType: 'high_fever', severity: 'immediate' },
      { keyword: 'more than 3 days', emergencyType: 'prolonged_fever', severity: 'warning' },
    ],
    minQuestions: 3,
  },
  {
    id: 'cough',
    keywords: ['cough', 'coughing', 'dry cough', 'wet cough', 'productive cough', 'persistent cough', 'hacking cough', 'barking cough'],
    name: 'Cough',
    triageQuestions: [
      { id: 'cough_duration', text: 'How long have you had the cough?', options: ['1–2 days', '3–7 days', '1–2 weeks', 'More than 2 weeks'] },
      { id: 'cough_type', text: 'Is the cough dry or do you bring up phlegm?', options: ['Dry cough (nothing comes up)', 'Wet cough (I cough up phlegm)'] },
      { id: 'cough_phlegm', text: 'What color is the phlegm?', options: ['Clear or white', 'Yellow or green', 'Blood-stained', 'I don\'t cough anything up'] },
      { id: 'cough_fever', text: 'Do you have a fever?', options: ['No', 'Yes, mild', 'Yes, high fever'] },
      { id: 'cough_breathing', text: 'Are you having any difficulty breathing?', options: ['No, breathing normally', 'Slightly short of breath', 'Yes, breathing is hard work'] },
      { id: 'cough_chest', text: 'Do you have any chest pain?', options: ['No', 'Yes, when I cough', 'Yes, even when not coughing'] },
      ...commonQuestions,
    ],
    emergencySignals: [
      { keyword: 'yes, breathing is hard work', emergencyType: 'difficulty_breathing', severity: 'immediate' },
      { keyword: 'blood-stained', emergencyType: 'coughing_blood', severity: 'immediate' },
      { keyword: 'yes, even when not coughing', emergencyType: 'chest_pain', severity: 'immediate' },
      { keyword: 'high fever', emergencyType: 'high_fever_with_cough', severity: 'warning' },
    ],
    minQuestions: 4,
  },
  {
    id: 'diarrhea',
    keywords: ['diarrhea', 'loose stool', 'loose motion', 'running stomach', 'frequent stool', 'watery stool', 'dysentery', 'bloody stool'],
    name: 'Diarrhea',
    triageQuestions: [
      { id: 'diarrhea_onset', text: 'When did the diarrhea start?', options: ['A few hours ago', 'Today', 'Yesterday', 'Several days ago'] },
      { id: 'diarrhea_frequency', text: 'How many times have you had diarrhea today?', options: ['1–3 times', '4–6 times', '7–10 times', 'More than 10 times'] },
      { id: 'diarrhea_blood', text: 'Is there blood or mucus in your stool?', options: ['No', 'Yes, blood', 'Yes, mucus', 'Yes, both'] },
      { id: 'diarrhea_fluids', text: 'Are you able to drink fluids?', options: ['Yes, normally', 'Yes, but less than usual', 'With difficulty', 'Cannot keep fluids down'] },
      { id: 'diarrhea_urine', text: 'When did you last urinate?', options: ['A few hours ago', '6+ hours ago', '12+ hours ago', 'I can\'t remember'] },
      { id: 'diarrhea_fever', text: 'Do you have a fever?', options: ['No', 'Yes, mild', 'Yes, high fever'] },
      { id: 'diarrhea_vomiting', text: 'Are you also vomiting?', options: ['No', 'Yes, occasionally', 'Yes, frequently'] },
      ...commonQuestions,
    ],
    emergencySignals: [
      { keyword: 'more than 10 times', emergencyType: 'severe_diarrhea', severity: 'warning' },
      { keyword: 'yes, blood', emergencyType: 'bloody_stool', severity: 'immediate' },
      { keyword: 'yes, both', emergencyType: 'bloody_stool', severity: 'immediate' },
      { keyword: '12+ hours ago', emergencyType: 'severe_dehydration', severity: 'warning' },
      { keyword: 'i can\'t remember', emergencyType: 'severe_dehydration', severity: 'warning' },
      { keyword: 'cannot keep fluids down', emergencyType: 'dehydration_risk', severity: 'warning' },
      { keyword: 'high fever', emergencyType: 'fever_with_diarrhea', severity: 'warning' },
      { keyword: 'yes, frequently', emergencyType: 'vomiting_with_diarrhea', severity: 'warning' },
    ],
    minQuestions: 4,
  },
  {
    id: 'abdominal_pain',
    keywords: ['stomach pain', 'abdominal pain', 'belly pain', 'tummy ache', 'stomach ache', 'stomach cramps', 'abdominal cramps', 'belly ache', 'gut pain'],
    name: 'Abdominal Pain',
    triageQuestions: [
      { id: 'abdo_onset', text: 'When did the pain start?', options: ['A few hours ago', 'Today', 'Yesterday', 'Several days ago', 'It comes and goes'] },
      { id: 'abdo_severity', text: 'How severe is the pain?', options: ['Mild discomfort', 'Moderate pain', 'Severe pain', 'Worst pain I\'ve ever felt'] },
      { id: 'abdo_location', text: 'Where exactly is the pain?', options: ['Upper belly', 'Lower belly', 'Right side', 'Left side', 'All over', 'Around the belly button'] },
      { id: 'abdo_worsens', text: 'What makes the pain worse?', options: ['Eating', 'Moving or coughing', 'Touching the area', 'Nothing specific'] },
      { id: 'abdo_fever', text: 'Do you have a fever?', options: ['No', 'Yes, mild', 'Yes, high fever'] },
      { id: 'abdo_vomiting', text: 'Are you vomiting?', options: ['No', 'Yes, occasionally', 'Yes, frequently'] },
      ...commonQuestions,
    ],
    emergencySignals: [
      { keyword: 'worst pain i\'ve ever felt', emergencyType: 'severe_abdominal_pain', severity: 'immediate' },
      { keyword: 'severe pain', emergencyType: 'severe_abdominal_pain', severity: 'immediate' },
      { keyword: 'high fever', emergencyType: 'fever_with_abdominal_pain', severity: 'warning' },
      { keyword: 'yes, frequently', emergencyType: 'vomiting_with_pain', severity: 'warning' },
    ],
    minQuestions: 4,
  },
];

export function findSymptomModule(message: string): SymptomModule | null {
  const normalized = message.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  const words = normalized.split(/\s+/);
  let best: SymptomModule | null = null;
  let bestScore = 0;

  for (const module of symptomModules) {
    let score = 0;
    for (const keyword of module.keywords) {
      const kwWords = keyword.toLowerCase().split(/\s+/);
      const matches = kwWords.filter(w => words.includes(w)).length;
      const ratio = matches / kwWords.length;
      if (ratio > score) score = ratio;
    }
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      best = module;
    }
  }

  return best;
}

export function generateVomitingResponse(answers: Record<string, string>): string {
  const freq = answers['vomit_frequency'] || '';
  const fluids = answers['vomit_fluids'] || '';
  const blood = answers['vomit_blood'] || '';
  const diarrhea = answers['vomit_diarrhea'] || '';
  const fever = answers['vomit_fever'] || '';
  const pain = answers['vomit_pain'] || '';

  const sections: string[] = [];

  sections.push(`I'm sorry you're dealing with vomiting. Based on what you've told me, here's some guidance.`);

  if (fluids.includes('No') || fluids.includes('vomit everything')) {
    sections.push(`💧 **Hydration is critical.** Since you can't keep fluids down, try taking **tiny sips** of water or ORS every 5–10 minutes — just a teaspoon at a time. If you still can't keep anything down for more than 24 hours, you need to see a doctor for IV fluids.`);
  } else {
    sections.push(`💧 **Keep sipping fluids.** Water, ORS (Oral Rehydration Solution), or clear broth. Small, frequent sips are better than large amounts at once.`);
  }

  if (diarrhea.includes('severe')) {
    sections.push(`⚠️ **You have both vomiting and severe diarrhea** — this combination can lead to rapid dehydration. Drink ORS frequently and monitor how much you're urinating. If you notice very dark urine or haven't urinated in 8+ hours, seek medical care.`);
  }

  sections.push(`🍚 **Diet.** Once you feel ready, start with bland foods like crackers, plain rice, or bread. Avoid spicy, oily, or heavy foods until you're fully recovered.`);

  if (!fever.includes('No') && !fever.includes('high')) {
    sections.push(`🌡️ **Fever.** Rest and take paracetamol if needed. Sponge with lukewarm water to help cool down.`);
  }

  sections.push(`🛌 **Rest your stomach.** Avoid solid food for a few hours. Let your stomach settle before trying to eat.`);

  if (freq.includes('More than 5') || freq.includes('Constantly')) {
    sections.push(`👀 **Monitor closely.** Since you've been vomiting frequently, watch for signs of dehydration: dry mouth, dizziness, dark urine, or feeling weak. These need medical attention.`);
  }

  sections.push(`🚨 **See a doctor if:** vomiting lasts more than 24 hours, you can't keep any fluids down, you see blood, you have severe abdominal pain, or you develop a high fever.`);

  return formatResponse('Vomiting & Nausea — Self-Care Guide', sections);
}

export function generateHeadacheResponse(answers: Record<string, string>): string {
  const severity = answers['headache_severity'] || '';
  const fever = answers['headache_fever'] || '';
  const vision = answers['headache_vision'] || '';
  const neck = answers['headache_neck'] || '';
  const location = answers['headache_location'] || '';
  const history = answers['headache_history'] || '';

  const sections: string[] = [];

  sections.push(`I'm sorry your head is hurting. Let me share some guidance based on what you've described.`);

  if (history.includes('migraine')) {
    sections.push(`🧠 Since you have a history of migraines, this could be another episode. Rest in a dark, quiet room. Apply a cold cloth to your forehead or the back of your neck.`);
  }

  sections.push(`💧 **Hydrate.** Dehydration is a common cause of headaches. Drink water slowly.`);

  sections.push(`🛌 **Rest.** Lie down in a calm, dark room. Avoid bright screens and loud noises. A cool or warm compress on your head or neck may help.`);

  if (severity.includes('mild') || severity.includes('moderate')) {
    sections.push(`💊 **Pain relief.** Paracetamol or ibuprofen can help if you have no medical reasons to avoid them. Follow the dosage instructions on the package.`);
  }

  if (fever.includes('Yes')) {
    sections.push(`🌡️ **Fever is present.** Rest and take paracetamol for the fever. If the fever is high or persists, visit a health facility.`);
  }

  if (location.includes('behind')) {
    sections.push(`👁️ Pain behind the eyes can sometimes be a sign of eye strain or sinus issues. Rest your eyes and avoid straining them.`);
  }

  sections.push(`🚨 **See a doctor if:** the headache is severe and sudden (like a thunderclap), you have a stiff neck, fever, vision changes, or if the headache keeps getting worse.`);

  return formatResponse('Headache — Self-Care Guide', sections);
}

export function generateFeverResponse(answers: Record<string, string>): string {
  const temp = answers['fever_temp'] || '';
  const duration = answers['fever_duration'] || '';
  const symptoms = answers['fever_symptoms'] || '';
  const age = answers['age'] || '';

  const sections: string[] = [];

  sections.push(`I see you're running a fever. Here's some guidance to help you manage it.`);

  if (age?.includes('Under 5')) {
    sections.push(`👶 **For young children:** Monitor the temperature closely. If your child is under 3 months with any fever, go to a health facility immediately. For older children, give paracetamol in the right dose and keep them cool.`);
  }

  sections.push(`💧 **Stay hydrated.** Fever makes you lose fluids faster. Drink water, ORS, or light soup regularly.`);

  sections.push(`🛌 **Rest.** Your body needs energy to fight the infection. Stay in bed, avoid strenuous activity.`);

  if (temp.includes('Low') || temp.includes('Moderate')) {
    sections.push(`🌡️ **Cool down.** Remove extra layers of clothing. Sponge with lukewarm (not cold) water. Take paracetamol if needed.`);
  }

  if (temp.includes('High') || temp.includes('Very')) {
    sections.push(`🌡️ **High fever.** Take paracetamol as directed. Sponge with lukewarm water. If the fever does not come down after medication, or if it continues rising, seek medical care.`);
  }

  if (symptoms.includes('Rash')) {
    sections.push(`⚠️ **Fever with a rash** can be a sign of conditions like measles, dengue, or meningitis. This needs medical evaluation.`);
  }

  if (symptoms.includes('Cough')) {
    sections.push(`🤧 **Fever with cough** could be a respiratory infection like cold, flu, or pneumonia. Rest and monitor your breathing.`);
  }

  if (duration.includes('More than 3')) {
    sections.push(`📅 **Prolonged fever.** A fever lasting more than 3 days needs medical evaluation. This could be a sign of malaria, typhoid, or another infection that needs treatment.`);
  }

  sections.push(`🚨 **See a doctor if:** fever lasts more than 3 days, is very high (over 40°C), you have a stiff neck, severe headache, rash, difficulty breathing, or confusion.`);

  return formatResponse('Fever — Self-Care Guide', sections);
}

export function generateCoughResponse(answers: Record<string, string>): string {
  const duration = answers['cough_duration'] || '';
  const type = answers['cough_type'] || '';
  const phlegm = answers['cough_phlegm'] || '';
  const fever = answers['cough_fever'] || '';
  const breathing = answers['cough_breathing'] || '';
  const chest = answers['cough_chest'] || '';

  const sections: string[] = [];

  sections.push(`Coughing can be really tiring. Here's some guidance based on what you've shared.`);

  sections.push(`💧 **Stay hydrated.** Warm drinks like ginger tea with honey can soothe your throat and help loosen phlegm.`);

  if (type.includes('Dry')) {
    sections.push(`🍯 **Soothing a dry cough.** Honey in warm water or tea can help coat your throat. Avoid dry or dusty environments.`);
  }

  if (type.includes('Wet')) {
    sections.push(`💨 **For a productive cough.** Coughing up phlegm is your body's way of clearing your lungs. Stay hydrated to keep the phlegm loose. Steam inhalation can help.`);
  }

  if (phlegm.includes('Yellow') || phlegm.includes('green')) {
    sections.push(`🟡 **Yellow or green phlegm** usually indicates your immune system is fighting an infection. If you also have a fever, you may need antibiotics — visit a health facility.`);
  }

  if (duration.includes('More than 2') || duration.includes('2 weeks')) {
    sections.push(`⏰ **Persistent cough.** A cough lasting more than 2 weeks needs medical evaluation. In Sierra Leone, this could be TB, asthma, or a chronic lung condition.`);
  }

  if (breathing.includes('Slightly')) {
    sections.push(`🌬️ **Mild shortness of breath.** Rest in a slightly upright position. If breathing becomes more difficult, seek medical help.`);
  }

  sections.push(`🛌 **Rest.** Give your body time to recover. Avoid smoke, dust, and cold air.`);

  sections.push(`🚨 **See a doctor if:** you have difficulty breathing, cough up blood, have a high fever, chest pain, or cough lasting more than 2 weeks.`);

  return formatResponse('Cough — Self-Care Guide', sections);
}

export function generateDiarrheaResponse(answers: Record<string, string>): string {
  const frequency = answers['diarrhea_frequency'] || '';
  const blood = answers['diarrhea_blood'] || '';
  const fluids = answers['diarrhea_fluids'] || '';
  const urine = answers['diarrhea_urine'] || '';
  const fever = answers['diarrhea_fever'] || '';
  const vomiting = answers['diarrhea_vomiting'] || '';

  const sections: string[] = [];

  sections.push(`Diarrhea can be really draining. Here's some guidance to help you through it.`);

  sections.push(`💧 **The most important thing is to prevent dehydration.** Drink ORS (Oral Rehydration Solution) frequently — mix 6 teaspoons of sugar and half a teaspoon of salt in 1 liter of clean water. Sip throughout the day.`);

  if (fluids.includes('With difficulty') || fluids.includes('Cannot keep')) {
    sections.push(`⚠️ **Since you're having trouble keeping fluids down,** try taking very small sips every few minutes. If you can't keep any fluids down for more than 24 hours, you need medical attention.`);
  }

  if (blood.includes('Yes')) {
    sections.push(`🩸 **Blood in your stool** can indicate dysentery or a serious infection. This needs medical evaluation — visit a health facility as soon as possible.`);
  }

  if (frequency.includes('7-10') || frequency.includes('More than 10')) {
    sections.push(`🔄 **Frequent diarrhea** puts you at high risk of dehydration. Keep drinking ORS and monitor your urine output.`);
  }

  sections.push(`🍚 **Diet.** Eat small amounts of light foods like plain rice, bananas, crackers, or bread. Avoid spicy, oily, or dairy-heavy foods until you recover.`);

  if (vomiting.includes('Yes')) {
    sections.push(`⚠️ **Vomiting with diarrhea** increases dehydration risk. Focus on staying hydrated with ORS in small, frequent sips.`);
  }

  sections.push(`🚨 **See a doctor if:** you have blood or mucus in your stool, severe abdominal pain, high fever, cannot keep fluids down, or have not urinated for 8+ hours.`);

  return formatResponse('Diarrhea — Self-Care Guide', sections);
}

export function generateAbdominalPainResponse(answers: Record<string, string>): string {
  const severity = answers['abdo_severity'] || '';
  const location = answers['abdo_location'] || '';
  const worsens = answers['abdo_worsens'] || '';
  const fever = answers['abdo_fever'] || '';
  const vomiting = answers['abdo_vomiting'] || '';

  const sections: string[] = [];

  sections.push(`Stomach pain can have many causes. Here's some guidance based on what you've told me.`);

  sections.push(`🛌 **Rest.** Lie down and see if resting helps. Avoid heavy meals until you feel better.`);

  if (worsens.includes('Eating')) {
    sections.push(`🍽️ **Pain after eating** could be related to indigestion, gastritis, or an ulcer. Try eating very small, bland meals. Avoid spicy, acidic, or fried foods.`);
  }

  if (location.includes('Lower')) {
    sections.push(`⬇️ **Lower abdominal pain** could be related to the bowels, bladder, or (if applicable) reproductive organs. If the pain is on your right side, it could be appendicitis — especially if the pain moves and gets worse.`);
  }

  if (location.includes('Upper')) {
    sections.push(`⬆️ **Upper abdominal pain** could be related to the stomach, gallbladder, or liver. Avoid heavy or fatty foods.`);
  }

  if (location.includes('All over') || location.includes('belly button')) {
    sections.push(`🌐 **Generalized abdominal pain** that starts around the belly button and moves to the lower right side could be appendicitis. Watch for this pattern.`);
  }

  sections.push(`💧 **Drink clear fluids.** Water, clear broth, or ORS. Avoid carbonated drinks and caffeine.`);

  if (!fever.includes('No') && !fever.includes('high')) {
    sections.push(`🌡️ **Mild fever.** Rest and take paracetamol. Monitor if the fever rises.`);
  }

  sections.push(`🚨 **See a doctor if:** the pain is severe or getting worse, you have a high fever, are vomiting, see blood in your stool, or if the pain moves to your lower right side (could be appendicitis).`);

  return formatResponse('Abdominal Pain — Self-Care Guide', sections);
}

export const generalHealthAdvice: Array<{ keywords: string[]; generate: (answers: Record<string, string>) => string }> = [
  {
    keywords: ['malaria', 'mosquito'],
    generate: () => formatResponse('Malaria Information', [
      `Malaria is common in Sierra Leone and is spread by mosquito bites. Symptoms include fever, chills, body aches, headache, and fatigue.`,
      `🛏️ **Self-care:** Rest, drink plenty of fluids, and take paracetamol for fever. Sleep under an insecticide-treated mosquito net.`,
      `🏥 **When to see a doctor:** Visit a health facility for a malaria rapid diagnostic test (RDT). Treatment with ACT (artemisinin-based combination therapy) is effective if started early.`,
      `🚨 **Emergency:** Confusion, difficulty breathing, or inability to wake up — seek emergency care immediately.`,
    ]),
  },
  {
    keywords: ['typhoid', 'salmonella'],
    generate: () => formatResponse('Typhoid Information', [
      `Typhoid is a bacterial infection spread through contaminated food and water. Symptoms include prolonged fever, headache, stomach pain, and extreme fatigue.`,
      `💧 **Self-care:** Drink only clean, boiled, or treated water. Eat light, easily digestible foods. Wash hands thoroughly.`,
      `🏥 **When to see a doctor:** Typhoid requires antibiotics. Visit a health facility for a blood test if you have persistent fever with stomach symptoms.`,
      `🚨 **Emergency:** Severe abdominal pain, persistent vomiting, or blood in stool — seek immediate medical help.`,
    ]),
  },
  {
    keywords: ['dehydration', 'dehydrated', 'dry mouth', 'sunken eyes'],
    generate: () => formatResponse('Dehydration — Self-Care Guide', [
      `Dehydration happens when your body loses more fluids than it takes in. This is common with diarrhea, vomiting, fever, or in hot weather.`,
      `💧 **Drink ORS:** Mix 6 teaspoons of sugar and half a teaspoon of salt in 1 liter of clean water. Sip frequently.`,
      `🥥 Also drink water, coconut water, or light soup. Avoid sugary drinks and caffeine.`,
      `🚨 **See a doctor if:** you cannot keep fluids down, haven't urinated for 8+ hours, or feel extremely weak and dizzy.`,
    ]),
  },
];

export function matchGeneralTopic(message: string): typeof generalHealthAdvice[0] | null {
  const normalized = message.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  let best: typeof generalHealthAdvice[0] | null = null;
  let bestScore = 0;
  for (const topic of generalHealthAdvice) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (normalized.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  return bestScore > 0 ? best : null;
}
