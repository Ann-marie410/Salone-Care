import { findSymptomModule, matchGeneralTopic, symptomModules, matchOption, generateVomitingResponse, generateHeadacheResponse, generateFeverResponse, generateCoughResponse, generateDiarrheaResponse, generateAbdominalPainResponse, type EmergencySignal } from './symptom-modules';

export interface ConversationState {
  phase: 'idle' | 'greeting' | 'collecting' | 'responding' | 'emergency';
  currentSymptomId: string | null;
  askedQuestionIds: string[];
  answers: Record<string, string>;
  nextQuestionIndex: number;
}

export function createInitialState(): ConversationState {
  return {
    phase: 'idle',
    currentSymptomId: null,
    askedQuestionIds: [],
    answers: {},
    nextQuestionIndex: 0,
  };
}

const greetingWords = [
  'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon',
  'good evening', 'sup', 'yo', 'howdy', 'what\'s up', 'whats up',
];

function isGreeting(text: string): boolean {
  const normalized = text.toLowerCase().trim().replace(/[^a-z0-9\s']/g, '');
  return greetingWords.some(w => normalized.startsWith(w) || normalized === w);
}

function checkEmergency(text: string): { isEmergency: boolean; emergencyType: string | null } {
  const normalized = text.toLowerCase().trim();

  const emergencyKeywords = [
    { keyword: 'can\'t breathe', type: 'difficulty_breathing' },
    { keyword: 'cannot breathe', type: 'difficulty_breathing' },
    { keyword: 'difficulty breathing', type: 'difficulty_breathing' },
    { keyword: 'hard to breathe', type: 'difficulty_breathing' },
    { keyword: 'not breathing', type: 'unconsciousness' },
    { keyword: 'unconscious', type: 'unconsciousness' },
    { keyword: 'passed out', type: 'unconsciousness' },
    { keyword: 'fainted', type: 'unconsciousness' },
    { keyword: 'severe bleeding', type: 'severe_bleeding' },
    { keyword: 'bleeding heavily', type: 'severe_bleeding' },
    { keyword: 'head injury', type: 'head_injury' },
    { keyword: 'hit my head', type: 'head_injury' },
    { keyword: 'car accident', type: 'trauma' },
    { keyword: 'motor accident', type: 'trauma' },
    { keyword: 'snake bite', type: 'snake_bite' },
    { keyword: 'poison', type: 'poisoning' },
    { keyword: 'overdose', type: 'poisoning' },
    { keyword: 'suicide', type: 'mental_health_emergency' },
    { keyword: 'want to kill myself', type: 'mental_health_emergency' },
    { keyword: 'chest pain', type: 'chest_pain' },
    { keyword: 'chest pressure', type: 'chest_pain' },
    { keyword: 'seizure', type: 'seizure' },
    { keyword: 'convulsing', type: 'seizure' },
    { keyword: 'fitting', type: 'seizure' },
    { keyword: 'stroke', type: 'stroke' },
    { keyword: 'face drooping', type: 'stroke' },
    { keyword: 'slurred speech', type: 'stroke' },
    { keyword: 'allergic reaction', type: 'severe_allergy' },
    { keyword: 'swelling face', type: 'severe_allergy' },
    { keyword: 'swollen tongue', type: 'severe_allergy' },
    { keyword: 'anaphylaxis', type: 'severe_allergy' },
    { keyword: 'burning', type: 'burn' },
    { keyword: 'third degree burn', type: 'burn' },
    { keyword: 'electrical shock', type: 'electrical_injury' },
    { keyword: 'drowning', type: 'drowning' },
    { keyword: 'choking', type: 'choking' },
  ];

  for (const { keyword, type } of emergencyKeywords) {
    if (normalized.includes(keyword)) {
      return { isEmergency: true, emergencyType: type };
    }
  }

  return { isEmergency: false, emergencyType: null };
}

function getGreetingResponse(): string {
  return `Hey there! 👋 I'm your SaloneCare Health Assistant.

I can help answer your health questions — just tell me what's bothering you.

**For example:**
– "I've been vomiting since yesterday"
– "I have a bad headache"
– "I have a fever and body aches"

⚠️ I can't diagnose or prescribe, but I'll give you helpful guidance. For emergencies, call **117**.`;
}

function getEmergencyResponse(emergencyType: string | null): string {
  return `🚨 **Please seek emergency medical attention immediately!** 🚨

Based on what you've described, this could be a medical emergency.

**Call 117** or go to the nearest hospital right away.

Do not wait. Do not try to treat this at home.`;
}

function getFallbackResponse(): string {
  return `I'm sorry, I don't have enough information to answer that question. Please consult a qualified healthcare professional or visit the nearest hospital.

You can also ask me about:
- Common health conditions (malaria, typhoid, fever, headache, etc.)
- Using the SaloneCare app (appointments, medicine orders, hospital locator)
- First aid and emergency situations`;
}

function getWarningResponse(emergencyType: string, symptomName: string, answers: Record<string, string>, moduleId: string): string {
  const advice = generateResponse(moduleId, answers);

  const warningLabels: Record<string, string> = {
    cannot_keep_fluids: '⚠️ **Warning: You cannot keep fluids down**',
    persistent_vomiting: '⚠️ **Warning: You have been vomiting frequently**',
    high_fever: '⚠️ **Warning: You have a high fever**',
    severe_dehydration_risk: '⚠️ **Warning: Risk of dehydration**',
    dehydration_risk: '⚠️ **Warning: Risk of dehydration**',
    prolonged_fever: '⚠️ **Warning: Prolonged fever**',
    fever_with_headache: '⚠️ **Warning: Fever with headache**',
    vision_changes: '⚠️ **Warning: Vision changes**',
    high_fever_with_cough: '⚠️ **Warning: High fever with cough**',
    fever_with_diarrhea: '⚠️ **Warning: Fever with diarrhea**',
    vomiting_with_diarrhea: '⚠️ **Warning: Vomiting and diarrhea together**',
    severe_diarrhea: '⚠️ **Warning: Frequent diarrhea**',
    vomiting_with_pain: '⚠️ **Warning: Vomiting with abdominal pain**',
    fever_with_abdominal_pain: '⚠️ **Warning: Fever with abdominal pain**',
  };

  const label = warningLabels[emergencyType] || `⚠️ **Warning: ${emergencyType.replace(/_/g, ' ')}**`;

  return `${label}

I noticed something concerning in your answer. Please take this seriously.

${advice}

🚶 **Consider visiting a health facility** if your symptoms don't improve or get worse.`;
}

function isEmergencySignalMatch(signal: EmergencySignal, userAnswer: string, lastQuestionId: string | undefined): boolean {
  if (signal.questionId && signal.questionId !== lastQuestionId) return false;
  const normalized = userAnswer.toLowerCase().trim();
  return normalized.includes(signal.keyword.toLowerCase());
}

function extractPreFilledAnswers(message: string, moduleId: string): { answers: Record<string, string>; askedIds: string[]; nextIndex: number } {
  const module = symptomModules.find(m => m.id === moduleId);
  if (!module) return { answers: {}, askedIds: [], nextIndex: 0 };

  const answers: Record<string, string> = {};
  const askedIds: string[] = [];
  let nextIndex = 0;

  for (let i = 0; i < module.triageQuestions.length; i++) {
    const q = module.triageQuestions[i];
    if (!q.options) break;

    let matched = false;
    for (const option of q.options) {
      const matchedOption = matchOption(message, [option]);
      if (matchedOption) {
        answers[q.id] = matchedOption;
        askedIds.push(q.id);
        nextIndex = i + 1;
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  return { answers, askedIds, nextIndex };
}

function handleCollectingPhase(userMessage: string, state: ConversationState): { response: string; newState: ConversationState } {
  const module = symptomModules.find(m => m.id === state.currentSymptomId);
  if (!module) {
    return { response: getFallbackResponse(), newState: createInitialState() };
  }

  // Store the answer — map to the last asked question
  const lastQuestionId = state.askedQuestionIds[state.askedQuestionIds.length - 1];
  if (lastQuestionId) {
    state.answers[lastQuestionId] = userMessage;
  }

  const normalized = userMessage.toLowerCase().trim();

  // Check for emergency signals in this answer
  for (const signal of module.emergencySignals) {
    if (!isEmergencySignalMatch(signal, userMessage, lastQuestionId)) continue;

    if (signal.severity === 'immediate') {
      const response = `${getEmergencyResponse(signal.emergencyType)}\n\nI noticed something concerning. For **${module.name}**, "${signal.keyword}" can be a serious warning sign.`;
      return {
        response,
        newState: { ...createInitialState(), phase: 'emergency' },
      };
    }

    // Warning severity — generate advice response with warning
    const response = getWarningResponse(signal.emergencyType, module.name, state.answers, module.id);
    return {
      response: response + '\n\n---\n\nFeel free to ask me anything else or tell me more about your symptoms.',
      newState: { ...createInitialState(), phase: 'responding' },
    };
  }

  // Check if we have asked enough questions or run out
  const remainingQuestions = module.triageQuestions.slice(state.nextQuestionIndex);
  const answeredCount = Object.keys(state.answers).length;

  if (answeredCount >= module.minQuestions && remainingQuestions.length === 0) {
    const response = generateResponse(module.id, state.answers);
    return {
      response: response + '\n\n---\n\nFeel free to ask me about anything else!',
      newState: { ...createInitialState(), phase: 'responding' },
    };
  }

  if (answeredCount >= module.minQuestions) {
    const response = generateResponse(module.id, state.answers);
    return {
      response: response + '\n\n---\n\nFeel free to ask me about anything else!',
      newState: { ...createInitialState(), phase: 'responding' },
    };
  }

  if (remainingQuestions.length === 0) {
    const response = generateResponse(module.id, state.answers);
    return {
      response: response + '\n\n---\n\nFeel free to ask me about anything else!',
      newState: { ...createInitialState(), phase: 'responding' },
    };
  }

  // Ask the next question
  const nextQuestion = remainingQuestions[0];
  const newState: ConversationState = {
    ...state,
    askedQuestionIds: [...state.askedQuestionIds, nextQuestion.id],
    nextQuestionIndex: state.nextQuestionIndex + 1,
  };

  let text = nextQuestion.text;
  if (nextQuestion.options) {
    text += '\n\n' + nextQuestion.options.map(o => `– ${o}`).join('\n');
  }

  return {
    response: text,
    newState,
  };
}

function generateResponse(moduleId: string, answers: Record<string, string>): string {
  switch (moduleId) {
    case 'vomiting':
      return generateVomitingResponse(answers);
    case 'headache':
      return generateHeadacheResponse(answers);
    case 'fever':
      return generateFeverResponse(answers);
    case 'cough':
      return generateCoughResponse(answers);
    case 'diarrhea':
      return generateDiarrheaResponse(answers);
    case 'abdominal_pain':
      return generateAbdominalPainResponse(answers);
    default:
      return `Thank you for sharing those details. Based on what you've told me, I recommend rest and monitoring your symptoms. If your symptoms worsen or persist, please visit a health facility.${'\n\n⚠️ This is general guidance only. For a proper diagnosis, please consult a healthcare professional.'}`;
  }
}

export function processMessage(message: string, state: ConversationState): { response: string; newState: ConversationState } {
  const cleaned = message.trim();
  if (!cleaned) {
    return { response: "Please type your question or concern. I'm here to help.", newState: state };
  }

  if (state.phase === 'emergency') {
    return { response: getEmergencyResponse(null) + '\n\nPlease call **117** or go to the nearest hospital immediately.', newState: state };
  }

  // Check for emergency keywords first (always, regardless of phase)
  const emergency = checkEmergency(cleaned);
  if (emergency.isEmergency) {
    return { response: getEmergencyResponse(emergency.emergencyType), newState: { ...createInitialState(), phase: 'emergency' } };
  }

  // If we're collecting answers for a symptom
  if (state.phase === 'collecting' && state.currentSymptomId) {
    return handleCollectingPhase(cleaned, state);
  }

  // Check for greetings
  if (isGreeting(cleaned)) {
    return { response: getGreetingResponse(), newState: { ...createInitialState(), phase: 'greeting' } };
  }

  // Try to find a symptom module
  const module = findSymptomModule(cleaned);
  if (module) {
    const preFilled = extractPreFilledAnswers(cleaned, module.id);
    const firstQuestion = module.triageQuestions[preFilled.nextIndex];
    const newState: ConversationState = {
      phase: 'collecting',
      currentSymptomId: module.id,
      askedQuestionIds: preFilled.askedIds,
      answers: preFilled.answers,
      nextQuestionIndex: preFilled.nextIndex,
    };

    if (!firstQuestion) {
      // All questions were pre-filled from the initial message
      const response = generateResponse(module.id, preFilled.answers);
      return {
        response: response + '\n\n---\n\nFeel free to ask me about anything else!',
        newState: { ...createInitialState(), phase: 'responding' },
      };
    }

    const intro = preFilled.askedIds.length === 0
      ? `I'd like to ask you a few questions about the **${module.name}** to give you better guidance.`
      : `Thanks! I noticed you already mentioned some details. Let me ask a few more questions about the **${module.name}**.`;

    let text = `${intro}\n\n**${firstQuestion.text}**`;
    if (firstQuestion.options) {
      text += '\n\n' + firstQuestion.options.map(o => `– ${o}`).join('\n');
    }

    newState.askedQuestionIds = [...preFilled.askedIds, firstQuestion.id];
    newState.nextQuestionIndex = preFilled.nextIndex + 1;

    return { response: text, newState };
  }

  // Try general health topics
  const generalTopic = matchGeneralTopic(cleaned);
  if (generalTopic) {
    return {
      response: generalTopic.generate(state.answers) + '\n\n---\n\nGot any other questions?',
      newState: { ...createInitialState(), phase: 'responding' },
    };
  }

  // Check for generic "I'm sick" phrases — prompt for details
  const sickWords = ['sick', 'ill', 'unwell'];
  const words = cleaned.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (
    words.some(w => sickWords.includes(w)) ||
    cleaned === 'sick'
  ) {
    return {
      response: `I'm sorry you're not feeling well! Can you tell me more about what's bothering you?

**For example:**
– "I've been vomiting since yesterday"
– "I have a bad headache"
– "I have a fever and body aches"
– "I've had diarrhea for two days"

The more you describe your symptoms, the better I can help.`,
      newState: { ...createInitialState(), phase: 'idle' },
    };
  }

  // Fallback
  return {
    response: getFallbackResponse(),
    newState: { ...createInitialState(), phase: 'idle' },
  };
}
