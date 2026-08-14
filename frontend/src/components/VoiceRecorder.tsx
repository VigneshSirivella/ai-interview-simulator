import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Mic,
  MicOff,
  Sparkles,
} from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptChange: (
    transcript: string
  ) => void;

  currentValue: string;
}

export const VoiceRecorder: React.FC<
  VoiceRecorderProps
> = ({
  onTranscriptChange,
  currentValue,
}) => {
  const [isListening, setIsListening] =
    useState(false);

  const [isSupported, setIsSupported] =
    useState(true);

  const [
    interimTranscript,
    setInterimTranscript,
  ] = useState("");

  const [voiceError, setVoiceError] =
    useState("");

  const recognitionRef =
    useRef<any>(null);

  /*
   * Keeps the latest textarea value
   * without recreating SpeechRecognition.
   */
  const currentValueRef =
    useRef(currentValue);

  /*
   * Tracks if user manually stopped
   * listening.
   */
  const manuallyStoppedRef =
    useRef(false);

  useEffect(() => {
    currentValueRef.current =
      currentValue;
  }, [currentValue]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onresult = (
      event: any
    ) => {
      let interim = "";
      let finalText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]
            .transcript;

        if (
          event.results[i].isFinal
        ) {
          finalText +=
            transcript.trim() + " ";
        } else {
          interim += transcript;
        }
      }

      /*
       * Append final speech instead
       * of replacing previous answer.
       */
      if (finalText.trim()) {
        const existing =
          currentValueRef.current
            .trim();

        const newText =
          finalText.trim();

        const combined =
          existing
            ? `${existing} ${newText}`
            : newText;

        currentValueRef.current =
          combined;

        onTranscriptChange(
          combined
        );
      }

      setInterimTranscript(
        interim.trim()
      );
    };

    recognition.onerror = (
      event: any
    ) => {
      console.warn(
        "Speech recognition error:",
        event.error
      );

      if (
        event.error ===
        "not-allowed"
      ) {
        setVoiceError(
          "Microphone permission was denied."
        );
      } else if (
        event.error ===
        "no-speech"
      ) {
        setVoiceError(
          "No speech detected. You can continue speaking."
        );
      } else {
        setVoiceError(
          "Voice recognition had a temporary problem."
        );
      }

      setInterimTranscript("");
    };

    recognition.onend = () => {
      setInterimTranscript("");

      /*
       * Chrome may stop recognition
       * automatically after silence.
       * Restart it unless the user
       * pressed Stop Listening.
       */
      if (
        !manuallyStoppedRef.current
      ) {
        try {
          recognition.start();
        } catch {
          // Ignore duplicate start errors.
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current =
      recognition;

    return () => {
      manuallyStoppedRef.current =
        true;

      try {
        recognition.stop();
      } catch {
        // Ignore cleanup errors.
      }

      recognitionRef.current =
        null;
    };
  }, [onTranscriptChange]);

  const startListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    manuallyStoppedRef.current =
      false;

    setVoiceError("");
    setInterimTranscript("");

    /*
     * Capture current typed text
     * before starting voice.
     */
    currentValueRef.current =
      currentValue;

    try {
      recognitionRef.current
        .start();

      setIsListening(true);
    } catch (error) {
      console.error(
        "Failed to start speech recognition:",
        error
      );
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    manuallyStoppedRef.current =
      true;

    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore stop errors.
    }

    setIsListening(false);
    setInterimTranscript("");
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col gap-2">

      <div className="flex flex-wrap items-center gap-2">

        <button
          type="button"
          onClick={
            toggleListening
          }
          disabled={
            !isSupported
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            isListening
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
          } disabled:opacity-50`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Speak Answer
            </>
          )}
        </button>

        {isListening && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />

            Listening...
          </div>
        )}

      </div>

      {!isSupported && (
        <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />

          Browser voice recognition is not supported.
          Please type your answer.
        </div>
      )}

      {voiceError && (
        <div className="text-xs text-amber-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />

          {voiceError}
        </div>
      )}

      {interimTranscript && (
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 italic">
          <Sparkles className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />

          Listening: "
          {interimTranscript}
          "
        </div>
      )}

    </div>
  );
};