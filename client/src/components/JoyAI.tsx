import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader } from "lucide-react";
import { toast } from "sonner";

interface JoyAIProps {
  onCommandReceived?: (command: string) => void;
}

export default function JoyAI({ onCommandReceived }: JoyAIProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "fr-FR";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(transcript);
          processCommand(transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      toast.error(`Erreur de reconnaissance: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processCommand = async (command: string) => {
    setIsProcessing(true);
    try {
      // Simulate command processing
      const lowerCommand = command.toLowerCase();

      if (lowerCommand.includes("réserver") || lowerCommand.includes("course")) {
        toast.success("Joy AI: Je vais vous aider à réserver une course");
        onCommandReceived?.("book_ride");
      } else if (lowerCommand.includes("historique") || lowerCommand.includes("mes courses")) {
        toast.success("Joy AI: Affichage de votre historique de courses");
        onCommandReceived?.("view_rides");
      } else if (lowerCommand.includes("annuler")) {
        toast.success("Joy AI: Quelle course souhaitez-vous annuler?");
        onCommandReceived?.("cancel_ride");
      } else if (lowerCommand.includes("tarif") || lowerCommand.includes("prix")) {
        toast.success("Joy AI: Voici les tarifs de nos services");
        onCommandReceived?.("show_pricing");
      } else {
        toast.info(`Joy AI: Commande reçue: "${command}"`);
      }
    } catch (error) {
      toast.error("Erreur lors du traitement de la commande");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle>Joy AI - Assistant Vocal</CardTitle>
            <CardDescription>Commandez par la voix</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Listening Status */}
        {isListening && (
          <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
            <Loader className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-800">À l'écoute...</span>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="p-3 bg-white rounded-lg border border-indigo-200">
            <p className="text-sm text-gray-600">Vous avez dit:</p>
            <p className="font-medium text-indigo-600">"{transcript}"</p>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg">
            <Loader className="w-4 h-4 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-800">Traitement en cours...</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isListening ? (
            <Button
              onClick={startListening}
              disabled={isProcessing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              Commencer
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              variant="destructive"
              className="flex-1"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Arrêter
            </Button>
          )}
        </div>

        {/* Commands Help */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
          <p className="font-medium mb-2">Commandes disponibles:</p>
          <ul className="space-y-1">
            <li>• "Réserver une course"</li>
            <li>• "Voir mes courses"</li>
            <li>• "Annuler une course"</li>
            <li>• "Afficher les tarifs"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
