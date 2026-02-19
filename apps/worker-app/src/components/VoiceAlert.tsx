import { useEffect, useRef, useCallback } from 'react';

interface VoiceAlertProps {
  alertType: string;
  language?: string;
  autoPlay?: boolean;
  onDone?: () => void;
}

// Alert type configuration: audio file paths, spoken text, and vibration patterns
const ALERT_CONFIG: Record<
  string,
  {
    audioFile?: string;
    text: Record<string, string>;
    vibrationPattern: number[];
    frequency: number;
    toneDurationMs: number;
    toneCount: number;
  }
> = {
  checkin: {
    audioFile: '/audio/checkin-prompt.mp3',
    text: {
      en: 'Please confirm you are safe. Tap the button now.',
      hi: 'कृपया पुष्टि करें कि आप सुरक्षित हैं। अभी बटन दबाएं।',
      mr: 'कृपया तुम्ही सुरक्षित असल्याची पुष्टी करा. आता बटण दाबा.',
      ta: 'நீங்கள் பாதுகாப்பாக இருப்பதை உறுதிப்படுத்தவும். இப்போது பொத்தானை அழுத்தவும்.',
      te: 'మీరు సురక్షితంగా ఉన్నారని నిర్ధారించండి. ఇప్పుడు బటన్ నొక్కండి.',
      kn: 'ನೀವು ಸುರಕ್ಷಿತವಾಗಿರುವುದನ್ನು ದಯವಿಟ್ಟು ಖಚಿತಪಡಿಸಿ. ಈಗ ಬಟನ್ ಒತ್ತಿರಿ.',
    },
    vibrationPattern: [300, 100, 300, 100, 300],
    frequency: 800,
    toneDurationMs: 200,
    toneCount: 3,
  },
  sos: {
    audioFile: '/audio/sos-alarm.mp3',
    text: {
      en: 'Emergency alert activated. Help is on the way. Stay calm.',
      hi: 'आपातकालीन अलर्ट सक्रिय। मदद आ रही है। शांत रहें।',
      mr: 'आणीबाणी अलर्ट सक्रिय. मदत येत आहे. शांत रहा.',
      ta: 'அவசர எச்சரிக்கை செயல்படுத்தப்பட்டது. உதவி வருகிறது. அமைதியாக இருங்கள்.',
      te: 'ఎమర్జెన్సీ అలర్ట్ యాక్టివేట్ చేయబడింది. సహాయం వస్తోంది. ప్రశాంతంగా ఉండండి.',
      kn: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಸಹಾಯ ಬರುತ್ತಿದೆ. ಶಾಂತವಾಗಿರಿ.',
    },
    vibrationPattern: [500, 200, 500, 200, 500, 200, 1000],
    frequency: 1200,
    toneDurationMs: 300,
    toneCount: 5,
  },
  gas_warning: {
    audioFile: '/audio/gas-warning.mp3',
    text: {
      en: 'Warning! Gas levels rising. Prepare to evacuate.',
      hi: 'चेतावनी! गैस का स्तर बढ़ रहा है। निकासी के लिए तैयार रहें।',
      mr: 'चेतावणी! गॅसची पातळी वाढत आहे. बाहेर पडण्याची तयारी करा.',
      ta: 'எச்சரிக்கை! வாயு அளவுகள் அதிகரிக்கின்றன. வெளியேறத் தயாராகுங்கள்.',
      te: 'హెచ్చరిక! గ్యాస్ స్థాయిలు పెరుగుతున్నాయి. ఖాళీ చేయడానికి సిద్ధంగా ఉండండి.',
      kn: 'ಎಚ್ಚರಿಕೆ! ಅನಿಲ ಮಟ್ಟಗಳು ಏರುತ್ತಿವೆ. ಸ್ಥಳಾಂತರಕ್ಕೆ ಸಿದ್ಧರಾಗಿ.',
    },
    vibrationPattern: [200, 100, 200, 100, 500],
    frequency: 1000,
    toneDurationMs: 250,
    toneCount: 4,
  },
  gas_danger: {
    audioFile: '/audio/gas-danger.mp3',
    text: {
      en: 'Danger! Toxic gas detected. Evacuate immediately!',
      hi: 'खतरा! जहरीली गैस पाई गई। तुरंत बाहर निकलें!',
      mr: 'धोका! विषारी वायू आढळला. तात्काळ बाहेर पडा!',
      ta: 'ஆபத்து! நச்சு வாயு கண்டறியப்பட்டது. உடனடியாக வெளியேறுங்கள்!',
      te: 'ప్రమాదం! విషపూరిత గ్యాస్ కనుగొనబడింది. వెంటనే బయటకు రండి!',
      kn: 'ಅಪಾಯ! ವಿಷಕಾರಿ ಅನಿಲ ಪತ್ತೆಯಾಗಿದೆ. ತಕ್ಷಣ ಹೊರಹೋಗಿ!',
    },
    vibrationPattern: [1000, 200, 1000, 200, 1000],
    frequency: 1500,
    toneDurationMs: 400,
    toneCount: 6,
  },
  overstay: {
    audioFile: '/audio/overstay-warning.mp3',
    text: {
      en: 'Time exceeded. Please exit the manhole immediately.',
      hi: 'समय समाप्त। कृपया तुरंत मैनहोल से बाहर निकलें।',
      mr: 'वेळ संपला. कृपया मॅनहोलमधून तात्काळ बाहेर पडा.',
      ta: 'நேரம் முடிந்தது. உடனடியாக மேன்ஹோலிலிருந்து வெளியேறுங்கள்.',
      te: 'సమయం మించిపోయింది. దయచేసి వెంటనే మ్యాన్‌హోల్ నుండి బయటకు రండి.',
      kn: 'ಸಮಯ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಮ್ಯಾನ್‌ಹೋಲ್‌ನಿಂದ ಹೊರಬನ್ನಿ.',
    },
    vibrationPattern: [400, 200, 400, 200, 800],
    frequency: 900,
    toneDurationMs: 300,
    toneCount: 4,
  },
  entry_confirmed: {
    text: {
      en: 'Entry confirmed. Stay safe.',
      hi: 'प्रवेश की पुष्टि। सुरक्षित रहें।',
      mr: 'प्रवेश पुष्टी. सुरक्षित रहा.',
      ta: 'நுழைவு உறுதிப்படுத்தப்பட்டது. பாதுகாப்பாக இருங்கள்.',
      te: 'ప్రవేశం నిర్ధారించబడింది. సురక్షితంగా ఉండండి.',
      kn: 'ಪ್ರವೇಶ ಖಚಿತಪಡಿಸಲಾಗಿದೆ. ಸುರಕ್ಷಿತವಾಗಿರಿ.',
    },
    vibrationPattern: [100, 50, 100],
    frequency: 600,
    toneDurationMs: 150,
    toneCount: 2,
  },
};

/**
 * VoiceAlert component that plays audio alerts using the Web Audio API,
 * with a fallback to the Web Speech API (speechSynthesis) for spoken text.
 * Also triggers vibration patterns based on alert type.
 */
export default function VoiceAlert({
  alertType,
  language = 'en',
  autoPlay = true,
  onDone,
}: VoiceAlertProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const abortRef = useRef(false);

  const playTone = useCallback(
    async (config: (typeof ALERT_CONFIG)[string]) => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        for (let i = 0; i < config.toneCount; i++) {
          if (abortRef.current) break;

          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(config.frequency + (i % 2 === 0 ? 0 : 200), ctx.currentTime);
          gainNode.gain.setValueAtTime(0.25, ctx.currentTime);

          // Fade out at end of tone
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + config.toneDurationMs / 1000);

          oscillator.start();
          await new Promise((resolve) => setTimeout(resolve, config.toneDurationMs));
          oscillator.stop();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch {
        // Web Audio API not available
      }
    },
    [],
  );

  const speakText = useCallback(
    (text: string, lang: string) => {
      return new Promise<void>((resolve) => {
        if (!('speechSynthesis' in window)) {
          resolve();
          return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Map our language codes to BCP 47 tags for speechSynthesis
        const langMap: Record<string, string> = {
          en: 'en-IN',
          hi: 'hi-IN',
          mr: 'mr-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          kn: 'kn-IN',
        };

        utterance.lang = langMap[lang] || 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      });
    },
    [],
  );

  const tryPlayAudioFile = useCallback(
    (filePath: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const audio = new Audio(filePath);
        audio.volume = 1.0;

        audio.onended = () => resolve(true);
        audio.onerror = () => resolve(false);

        audio.play().catch(() => resolve(false));
      });
    },
    [],
  );

  const playAlert = useCallback(async () => {
    const config = ALERT_CONFIG[alertType];
    if (!config) {
      onDone?.();
      return;
    }

    // Trigger vibration pattern
    if (navigator.vibrate) {
      navigator.vibrate(config.vibrationPattern);
    }

    // Try playing the audio file first
    let audioPlayed = false;
    if (config.audioFile) {
      audioPlayed = await tryPlayAudioFile(config.audioFile);
    }

    // If audio file failed or doesn't exist, use Web Audio API tone
    if (!audioPlayed && !abortRef.current) {
      await playTone(config);
    }

    // Speak the text using speechSynthesis
    if (!abortRef.current) {
      const text = config.text[language] || config.text.en;
      if (text) {
        await speakText(text, language);
      }
    }

    onDone?.();
  }, [alertType, language, onDone, playTone, speakText, tryPlayAudioFile]);

  useEffect(() => {
    abortRef.current = false;

    if (autoPlay) {
      playAlert();
    }

    return () => {
      abortRef.current = true;

      // Cleanup audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Stop vibration
      if (navigator.vibrate) {
        navigator.vibrate(0);
      }
    };
  }, [autoPlay, playAlert]);

  // This component has no visible UI; it only produces audio/haptic output
  return null;
}
