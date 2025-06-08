import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Save, Share2, Edit3, Trash2, Plus, Eye, EyeOff, Type, Mail, Phone, Calendar, Hash, ToggleLeft, List, FileText, Star, MapPin, Clock, DollarSign, Link as LinkIcon, Image, Upload, CheckSquare, Radio, Sliders as Slider, X, Check, AlertCircle, Loader2, Volume2, VolumeX, Settings, Copy, ExternalLink } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  description?: string;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  shareUrl?: string;
}

interface VoiceFormBuilderProps {
  onClose: () => void;
}

const VoiceFormBuilder: React.FC<VoiceFormBuilderProps> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentForm, setCurrentForm] = useState<FormData>({
    id: uuidv4(),
    name: '',
    description: '',
    fields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false
  });
  const [mode, setMode] = useState<'create' | 'edit' | 'preview'>('create');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ElevenLabs API configuration
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Default voice ID (Adam)

  // Check if API key is configured and valid
  const isApiKeyConfigured = ELEVENLABS_API_KEY && 
    ELEVENLABS_API_KEY !== 'your-elevenlabs-api-key' && 
    ELEVENLABS_API_KEY.startsWith('sk_') && 
    ELEVENLABS_API_KEY.length > 20;

  const startListening = async () => {
    try {
      setError(null);
      
      if (!isApiKeyConfigured) {
        setError('ElevenLabs API key not configured properly. Please check your .env file and restart the development server.');
        return;
      }

      setIsListening(true);
      setTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Use webm format for better compatibility
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback to default format
        mediaRecorderRef.current = new MediaRecorder(stream);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
          });
          
          // Check if audio blob has content
          if (audioBlob.size === 0) {
            throw new Error('No audio data recorded');
          }
          
          await processAudioWithElevenLabs(audioBlob);
        } catch (error) {
          console.error('Error in onstop handler:', error);
          setError('Failed to process recorded audio. Please try again.');
        } finally {
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      
      // Provide audio feedback only if API key is configured
      if (isApiKeyConfigured) {
        await playAudioFeedback('Recording started. Please speak your form requirements.');
      }
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start voice recording. Please check your microphone permissions.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const processAudioWithElevenLabs = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      if (!isApiKeyConfigured) {
        // Fallback to browser Speech Recognition API
        const transcriptText = await fallbackSpeechToText();
        setTranscript(transcriptText);
        
        if (transcriptText.trim()) {
          const processedForm = await parseVoiceToForm(transcriptText.trim());
          setCurrentForm(prev => ({
            ...prev,
            ...processedForm,
            updatedAt: new Date().toISOString()
          }));
          
          setSuccess('Form updated successfully using browser speech recognition!');
        }
        return;
      }

      // Validate audio blob
      if (audioBlob.size === 0) {
        throw new Error('No audio data to process');
      }

      // Use ElevenLabs Speech-to-Text with improved error handling
      const transcriptText = await speechToText(audioBlob);
      setTranscript(transcriptText);
      
      if (transcriptText.trim()) {
        const processedForm = await parseVoiceToForm(transcriptText.trim());
        setCurrentForm(prev => ({
          ...prev,
          ...processedForm,
          updatedAt: new Date().toISOString()
        }));
        
        // Provide audio confirmation
        await playAudioFeedback(`Form updated successfully. Added ${processedForm.fields?.length || 0} new fields.`);
        setSuccess('Form updated successfully!');
      } else {
        setError('No speech detected. Please try speaking more clearly.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('422')) {
          setError('Invalid audio format or API key issue. Please check your ElevenLabs API key and try again.');
        } else if (error.message.includes('401')) {
          setError('Invalid ElevenLabs API key. Please check your .env file.');
        } else if (error.message.includes('429')) {
          setError('API rate limit exceeded. Please wait a moment and try again.');
        } else {
          setError(`Failed to process voice command: ${error.message}`);
        }
      } else {
        setError('Failed to process voice command. Please try again.');
      }
      
      if (isApiKeyConfigured) {
        await playAudioFeedback('Sorry, I could not process your voice command. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackSpeechToText = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  };

  const speechToText = async (audioBlob: Blob): Promise<string> => {
    try {
      // Validate API key format
      if (!ELEVENLABS_API_KEY || !ELEVENLABS_API_KEY.startsWith('sk_')) {
        throw new Error('Invalid ElevenLabs API key format');
      }

      // Convert audio blob to proper format if needed
      let processedBlob = audioBlob;
      
      // If the blob is webm, convert to a more compatible format
      if (audioBlob.type.includes('webm')) {
        // For now, we'll try to send it as is, but with proper filename
        processedBlob = new Blob([audioBlob], { type: 'audio/webm' });
      }

      // Create FormData object for multipart/form-data request
      const formData = new FormData();
      formData.append('file', processedBlob, 'audio.webm');
      formData.append('model_id', 'whisper-1');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
          // Note: Don't set Content-Type header - let fetch set it automatically for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `ElevenLabs API error: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            // Handle different types of detail responses
            if (typeof errorData.detail === 'string') {
              errorMessage += ` - ${errorData.detail}`;
            } else if (Array.isArray(errorData.detail)) {
              // If detail is an array of error objects
              const messages = errorData.detail.map((item: any) => {
                if (typeof item === 'string') return item;
                if (item.msg) return item.msg;
                if (item.message) return item.message;
                return JSON.stringify(item);
              }).join(', ');
              errorMessage += ` - ${messages}`;
            } else if (typeof errorData.detail === 'object') {
              // If detail is an object
              if (errorData.detail.msg) {
                errorMessage += ` - ${errorData.detail.msg}`;
              } else if (errorData.detail.message) {
                errorMessage += ` - ${errorData.detail.message}`;
              } else {
                // Extract meaningful information from the object
                const detailStr = Object.entries(errorData.detail)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ');
                errorMessage += ` - ${detailStr}`;
              }
            }
          } else if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          } else if (errorData.error) {
            errorMessage += ` - ${errorData.error}`;
          }
        } catch {
          // If error response is not JSON, use the text
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.text) {
        throw new Error('No transcription returned from API');
      }
      
      return result.text;
    } catch (error) {
      console.error('ElevenLabs Speech-to-Text error:', error);
      throw error;
    }
  };

  const textToSpeech = async (text: string): Promise<Blob> => {
    if (!isApiKeyConfigured) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS API error: ${response.status} - ${errorText}`);
    }

    return await response.blob();
  };

  const playAudioFeedback = async (text: string) => {
    if (!isApiKeyConfigured) {
      console.log('Audio feedback:', text); // Log instead of playing audio
      return;
    }

    try {
      setIsPlayingAudio(true);
      const audioBlob = await textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio feedback:', error);
      setIsPlayingAudio(false);
    }
  };

  const stopAudioFeedback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const parseVoiceToForm = async (command: string): Promise<Partial<FormData>> => {
    const lowerCommand = command.toLowerCase();
    
    // Extract form name and description
    let formName = '';
    let formDescription = '';
    let fields: FormField[] = [...currentForm.fields];

    // Parse form name
    const nameMatch = lowerCommand.match(/(?:create|make|build)?\s*(?:a|an)?\s*(?:form|survey)?\s*(?:called|named|titled)\s*["']?([^"']+)["']?/);
    if (nameMatch) {
      formName = nameMatch[1].trim();
    } else if (lowerCommand.includes('form') && !currentForm.name) {
      const formMatch = lowerCommand.match(/(?:create|make|build)\s+(?:a|an)?\s*([^.]+?)\s*form/);
      if (formMatch) {
        formName = formMatch[1].trim();
      }
    }

    // Parse description
    const descMatch = lowerCommand.match(/(?:description|about|for)\s*["']?([^"']+)["']?/);
    if (descMatch) {
      formDescription = descMatch[1].trim();
    }

    // Enhanced field parsing with more patterns
    const fieldPatterns = [
      // Text fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*(?:text|input)?\s*field\s+(?:for|called|named)\s*["']?([^"']+)["']?/g, type: 'text' },
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*name\s*field/g, type: 'text', label: 'Full Name' },
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*first\s*name\s*field/g, type: 'text', label: 'First Name' },
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*last\s*name\s*field/g, type: 'text', label: 'Last Name' },
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*address\s*field/g, type: 'text', label: 'Address' },
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*company\s*field/g, type: 'text', label: 'Company' },
      
      // Email fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*email\s*(?:field|address)?/g, type: 'email', label: 'Email Address' },
      
      // Phone fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*phone\s*(?:number|field)?/g, type: 'tel', label: 'Phone Number' },
      
      // Date fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*(?:date|birthday|birth\s*date)\s*field/g, type: 'date', label: 'Date' },
      
      // Number fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*(?:number|age|quantity)\s*field/g, type: 'number', label: 'Number' },
      
      // Textarea fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*(?:textarea|text\s*area|comment|message|description)\s*field/g, type: 'textarea', label: 'Comments' },
      
      // Select fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*(?:dropdown|select|choice)\s*field\s+(?:for|called|named)\s*["']?([^"']+)["']?/g, type: 'select' },
      
      // Checkbox fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*checkbox\s*(?:field)?\s*(?:for|called|named)\s*["']?([^"']+)["']?/g, type: 'checkbox' },
      
      // Radio fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*radio\s*(?:button|field)?\s*(?:for|called|named)\s*["']?([^"']+)["']?/g, type: 'radio' },
      
      // File upload fields
      { pattern: /(?:add|include|create)\s+(?:a|an)?\s*(?:file|upload)\s*field/g, type: 'file', label: 'File Upload' },
    ];

    fieldPatterns.forEach(({ pattern, type, label: defaultLabel }) => {
      let match;
      while ((match = pattern.exec(lowerCommand)) !== null) {
        const fieldLabel = match[1] || defaultLabel || type.charAt(0).toUpperCase() + type.slice(1);
        
        const newField: FormField = {
          id: uuidv4(),
          type,
          label: fieldLabel,
          required: lowerCommand.includes('required') || lowerCommand.includes('mandatory'),
          placeholder: `Enter ${fieldLabel.toLowerCase()}`,
        };

        // Add options for select/radio fields
        if (type === 'select' || type === 'radio') {
          newField.options = ['Option 1', 'Option 2', 'Option 3'];
        }

        fields.push(newField);
      }
    });

    // Parse options for select/radio fields
    const optionsMatch = lowerCommand.match(/(?:options|choices)\s+(?:are|include)?\s*["']?([^"']+)["']?/);
    if (optionsMatch && fields.length > 0) {
      const lastField = fields[fields.length - 1];
      if (lastField.type === 'select' || lastField.type === 'radio') {
        const options = optionsMatch[1].split(/,|\sand\s|\sor\s/).map(opt => opt.trim()).filter(opt => opt);
        lastField.options = options;
      }
    }

    // Handle field modifications
    if (lowerCommand.includes('make') && lowerCommand.includes('required')) {
      const fieldNameMatch = lowerCommand.match(/make\s+(?:the\s+)?([^"']+?)\s+(?:field\s+)?required/);
      if (fieldNameMatch) {
        const fieldName = fieldNameMatch[1].trim();
        fields = fields.map(field => 
          field.label.toLowerCase().includes(fieldName.toLowerCase()) 
            ? { ...field, required: true }
            : field
        );
      }
    }

    if (lowerCommand.includes('remove') || lowerCommand.includes('delete')) {
      const removeMatch = lowerCommand.match(/(?:remove|delete)\s+(?:the\s+)?([^"']+?)\s*field/);
      if (removeMatch) {
        const fieldName = removeMatch[1].trim();
        fields = fields.filter(field => 
          !field.label.toLowerCase().includes(fieldName.toLowerCase())
        );
      }
    }

    return {
      name: formName || currentForm.name,
      description: formDescription || currentForm.description,
      fields
    };
  };

  const getFieldIcon = (type: string) => {
    const icons = {
      text: Type,
      email: Mail,
      tel: Phone,
      date: Calendar,
      number: Hash,
      textarea: FileText,
      select: List,
      checkbox: CheckSquare,
      radio: Radio,
      file: Upload,
      url: LinkIcon,
      time: Clock,
      range: Slider,
      color: Star,
      password: EyeOff
    };
    return icons[type] || Type;
  };

  const addField = (type: string) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder: `Enter ${type}`,
    };

    if (type === 'select' || type === 'radio') {
      newField.options = ['Option 1', 'Option 2', 'Option 3'];
    }

    setCurrentForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteField = (fieldId: string) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
      updatedAt: new Date().toISOString()
    }));
  };

  const saveForm = async () => {
    if (!currentForm.name.trim()) {
      setError('Please provide a form name');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shareUrl = `${window.location.origin}/form/${currentForm.id}`;
      setCurrentForm(prev => ({ ...prev, shareUrl }));
      
      setSuccess('Form saved successfully!');
      setShowSaveDialog(false);
      
      // Audio confirmation only if API key is configured
      if (isApiKeyConfigured) {
        await playAudioFeedback('Form has been saved successfully and is ready to share.');
      }
    } catch (error) {
      setError('Failed to save form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = () => {
    if (currentForm.shareUrl) {
      navigator.clipboard.writeText(currentForm.shareUrl);
      setSuccess('Share link copied to clipboard!');
    }
  };

  const readFormSummary = async () => {
    const summary = `Your form "${currentForm.name || 'Untitled Form'}" contains ${currentForm.fields.length} fields: ${currentForm.fields.map(f => f.label).join(', ')}. ${currentForm.description ? `Description: ${currentForm.description}` : ''}`;
    await playAudioFeedback(summary);
  };

  const fieldTypes = [
    { type: 'text', label: 'Text', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'tel', label: 'Phone', icon: Phone },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'textarea', label: 'Textarea', icon: FileText },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'radio', label: 'Radio', icon: Radio },
    { type: 'file', label: 'File Upload', icon: Upload },
  ];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex">
        {/* Left Panel - Voice Controls & Form Builder */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">AI Voice Form Builder</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mode Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => setMode('create')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'create' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'edit' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isApiKeyConfigured ? 'ElevenLabs Voice AI' : 'Browser Speech Recognition'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={readFormSummary}
                  disabled={isPlayingAudio || currentForm.fields.length === 0 || !isApiKeyConfigured}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Read form summary"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                {isPlayingAudio && (
                  <button
                    onClick={stopAudioFeedback}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Stop audio"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* API Key Warning */}
            {!isApiKeyConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    ElevenLabs API key not configured properly.
                  </p>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Add a valid VITE_ELEVENLABS_API_KEY to your .env file and restart the server.
                </p>
              </div>
            )}
            
            {/* Voice Recording Button */}
            <div className="text-center mb-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isPlayingAudio}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white disabled:opacity-50 shadow-lg`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isListening ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                {isProcessing ? (isApiKeyConfigured ? 'Processing with ElevenLabs...' : 'Processing with browser...') : 
                 isListening ? 'Recording... Click to stop' : 
                 'Click to start voice input'}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">{transcript}</p>
              </div>
            )}

            {/* Voice Command Examples */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Example Commands:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• "Create a contact form"</li>
                <li>• "Add an email field"</li>
                <li>• "Add a dropdown for country with options USA, Canada, UK"</li>
                <li>• "Make the name field required"</li>
                <li>• "Remove the phone field"</li>
                <li>• "Add a file upload field"</li>
              </ul>
            </div>
          </div>

          {/* Manual Field Addition */}
          {mode === 'edit' && (
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Fields</h3>
              <div className="grid grid-cols-2 gap-2">
                {fieldTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={!currentForm.fields.length}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={() => setShowShareDialog(true)}
                disabled={!currentForm.shareUrl}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Preview/Editor */}
        <div className="flex-1 flex flex-col">
          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                {mode === 'edit' ? (
                  <input
                    type="text"
                    value={currentForm.name}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Form Name"
                    className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">{currentForm.name || 'Untitled Form'}</h2>
                )}
                
                {mode === 'edit' ? (
                  <textarea
                    value={currentForm.description}
                    onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Form description"
                    className="text-gray-600 bg-transparent border-none outline-none w-full resize-none mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-600">{currentForm.description || 'No description'}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{currentForm.fields.length} fields • {isApiKeyConfigured ? 'Powered by ElevenLabs AI' : 'Browser Speech Recognition'}</span>
              <span>Last updated: {new Date(currentForm.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentForm.fields.length === 0 ? (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No fields yet</h3>
                <p className="text-gray-600">Use voice commands or manual controls to add form fields</p>
                <p className="text-sm text-blue-600 mt-2">Try saying: "Create a contact form with name and email fields"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentForm.fields.map((field, index) => {
                  const FieldIcon = getFieldIcon(field.type);
                  
                  return (
                    <div
                      key={field.id}
                      className={`border rounded-lg p-4 transition-all ${
                        selectedField === field.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FieldIcon className="w-5 h-5 text-gray-600 mr-2" />
                          {mode === 'edit' ? (
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="font-medium text-gray-900 bg-transparent border-none outline-none"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{field.label}</span>
                          )}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        
                        {mode === 'edit' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateField(field.id, { required: !field.required })}
                              className={`p-1 rounded ${field.required ? 'text-red-600' : 'text-gray-400'}`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteField(field.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Field Input */}
                      <div className="mb-3">
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            disabled={mode !== 'preview'}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={mode !== 'preview'}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => (
                              <label key={idx} className="flex items-center">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={option}
                                  className="mr-2"
                                  disabled={mode !== 'preview'}
                                />
                                {mode === 'edit' ? (
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions[idx] = e.target.value;
                                      updateField(field.id, { options: newOptions });
                                    }}
                                    className="bg-transparent border-none outline-none"
                                  />
                                ) : (
                                  <span>{option}</span>
                                )}
                              </label>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              disabled={mode !== 'preview'}
                            />
                            <span>{field.label}</span>
                          </label>
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={mode !== 'preview'}
                          />
                        )}
                      </div>

                      {/* Field Options for Edit Mode */}
                      {mode === 'edit' && (field.type === 'select' || field.type === 'radio') && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Options:</label>
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])];
                                  newOptions[idx] = e.target.value;
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = field.options?.filter((_, i) => i !== idx);
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                              updateField(field.id, { options: newOptions });
                            }}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded text-sm flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Form</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                <input
                  type="text"
                  value={currentForm.name}
                  onChange={(e) => setCurrentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter form name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={currentForm.description}
                  onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter form description"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={currentForm.isPublic}
                  onChange={(e) => setCurrentForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">Make form publicly accessible</label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                disabled={isSaving || !currentForm.name.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && currentForm.shareUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Share Form</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentForm.shareUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                  <button
                    onClick={copyShareLink}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Form Settings</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {currentForm.fields.length} fields</li>
                  <li>• {currentForm.isPublic ? 'Public access' : 'Private access'}</li>
                  <li>• Responses will be collected automatically</li>
                  <li>• {isApiKeyConfigured ? 'Powered by ElevenLabs AI' : 'Browser Speech Recognition'}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowShareDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.open(currentForm.shareUrl, '_blank')}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center z-70">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-800 text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-3 text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center z-70">
          <Check className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800 text-sm">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-3 text-green-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceFormBuilder;