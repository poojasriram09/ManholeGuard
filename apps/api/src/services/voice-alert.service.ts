import { logger } from '../utils/logger';

interface AlertConfig {
  audioFile: string;
  vibrationPattern: number[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  repeatCount: number;
  localizedText: Record<string, string>;
}

const ALERT_CONFIGS: Record<string, AlertConfig> = {
  CHECKIN_PROMPT: {
    audioFile: '/audio/checkin-prompt.mp3',
    vibrationPattern: [300, 100, 300, 100, 300],
    urgency: 'high',
    repeatCount: 3,
    localizedText: {
      en: 'Check-in required. Please confirm you are safe.',
      hi: 'चेक-इन आवश्यक है। कृपया पुष्टि करें कि आप सुरक्षित हैं।',
      mr: 'चेक-इन आवश्यक आहे. कृपया तुम्ही सुरक्षित आहात याची पुष्टी करा.',
      ta: 'செக்-இன் தேவை. நீங்கள் பாதுகாப்பாக இருப்பதை உறுதிப்படுத்தவும்.',
      te: 'చెక్-ఇన్ అవసరం. మీరు సురక్షితంగా ఉన్నారని నిర్ధారించండి.',
      kn: 'ಚೆಕ್-ಇನ್ ಅಗತ್ಯ. ನೀವು ಸುರಕ್ಷಿತರಾಗಿರುವಿರಿ ಎಂದು ದೃಢೀಕರಿಸಿ.',
    },
  },
  OVERSTAY: {
    audioFile: '/audio/overstay-alert.mp3',
    vibrationPattern: [500, 200, 500, 200, 500],
    urgency: 'high',
    repeatCount: 5,
    localizedText: {
      en: 'Time limit exceeded. Please exit the manhole immediately.',
      hi: 'समय सीमा पार हो गई। कृपया तुरंत मैनहोल से बाहर निकलें।',
      mr: 'वेळ मर्यादा ओलांडली. कृपया ताबडतोब मॅनहोलमधून बाहेर पडा.',
      ta: 'நேர வரம்பு மீறப்பட்டது. தயவுசெய்து உடனடியாக மேன்ஹோலில் இருந்து வெளியேறவும்.',
      te: 'సమయ పరిమితి మించిపోయింది. దయచేసి వెంటనే మ్యాన్‌హోల్ నుండి బయటకు రండి.',
      kn: 'ಸಮಯ ಮಿತಿ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಮ್ಯಾನ್‌ಹೋಲ್‌ನಿಂದ ಹೊರಬನ್ನಿ.',
    },
  },
  GAS_ALERT: {
    audioFile: '/audio/gas-alert.mp3',
    vibrationPattern: [1000, 200, 1000, 200, 1000],
    urgency: 'critical',
    repeatCount: 10,
    localizedText: {
      en: 'DANGER! Toxic gas detected. Evacuate immediately!',
      hi: 'खतरा! जहरीली गैस का पता चला। तुरंत बाहर निकलें!',
      mr: 'धोका! विषारी वायू आढळला. ताबडतोब बाहेर पडा!',
      ta: 'ஆபத்து! நச்சு வாயு கண்டறியப்பட்டது. உடனடியாக வெளியேறவும்!',
      te: 'ప్రమాదం! విషపూరిత వాయువు గుర్తించబడింది. వెంటనే బయటకు రండి!',
      kn: 'ಅಪಾಯ! ವಿಷಕಾರಿ ಅನಿಲ ಪತ್ತೆಯಾಗಿದೆ. ತಕ್ಷಣ ಹೊರಬನ್ನಿ!',
    },
  },
  SOS: {
    audioFile: '/audio/sos-siren.mp3',
    vibrationPattern: [500, 100, 500, 100, 500, 100, 500],
    urgency: 'critical',
    repeatCount: 0, // Continuous
    localizedText: {
      en: 'SOS activated. Help is on the way.',
      hi: 'SOS सक्रिय हो गया। मदद आ रही है।',
      mr: 'SOS सक्रिय झाले. मदत येत आहे.',
      ta: 'SOS செயல்படுத்தப்பட்டது. உதவி வருகிறது.',
      te: 'SOS సక్రియం చేయబడింది. సహాయం వస్తోంది.',
      kn: 'SOS ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಸಹಾಯ ಬರುತ್ತಿದೆ.',
    },
  },
  WEATHER_WARNING: {
    audioFile: '/audio/weather-warning.mp3',
    vibrationPattern: [400, 200, 400],
    urgency: 'medium',
    repeatCount: 2,
    localizedText: {
      en: 'Weather warning. Heavy rainfall expected. Exercise caution.',
      hi: 'मौसम की चेतावनी। भारी बारिश की उम्मीद। सावधानी बरतें।',
      mr: 'हवामान इशारा. मुसळधार पावसाची शक्यता. सावध राहा.',
      ta: 'வானிலை எச்சரிக்கை. கனமழை எதிர்பார்க்கப்படுகிறது. எச்சரிக்கையாக இருங்கள்.',
      te: 'వాతావరణ హెచ్చరిక. భారీ వర్షం ఆశించబడుతోంది. జాగ్రత్తగా ఉండండి.',
      kn: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ. ಭಾರೀ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.',
    },
  },
};

export class VoiceAlertService {
  /** Get alert configuration for a given alert type */
  getAlertConfig(alertType: string): AlertConfig | null {
    return ALERT_CONFIGS[alertType] || null;
  }

  /** Get localized text for an alert in a specific language */
  getLocalizedText(alertType: string, language: string = 'en'): string {
    const config = ALERT_CONFIGS[alertType];
    if (!config) return `Alert: ${alertType}`;
    return config.localizedText[language] || config.localizedText['en'];
  }

  /** Get client-side alert payload for Web Audio API / Speech API */
  getClientAlertPayload(alertType: string, language: string = 'en') {
    const config = ALERT_CONFIGS[alertType];
    if (!config) {
      return {
        type: alertType,
        audioFile: null,
        vibrationPattern: [200, 100, 200],
        text: `Alert: ${alertType}`,
        urgency: 'medium' as const,
        repeatCount: 1,
      };
    }

    return {
      type: alertType,
      audioFile: config.audioFile,
      vibrationPattern: config.vibrationPattern,
      text: config.localizedText[language] || config.localizedText['en'],
      urgency: config.urgency,
      repeatCount: config.repeatCount,
    };
  }

  /** Get all supported alert types */
  getSupportedTypes(): string[] {
    return Object.keys(ALERT_CONFIGS);
  }
}
