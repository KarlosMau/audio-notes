// app/controllers/video.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class VideoController extends Controller {
  @tracked transcription = '';

  mediaRecorder = null;
  audioChunks = [];
  audioBlob = null;
  audioURL = null;

  @action
  async startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = this.handleRecordingStop.bind(this);
    } catch (error) {
      console.error('Error accessing microphone', error);
    }
  }

  @action
  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  handleRecordingStop() {
    this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
    this.audioChunks = [];
    this.audioURL = URL.createObjectURL(this.audioBlob);

    const audioElement = document.getElementById('audioPlayback');
    audioElement.src = this.audioURL;
    audioElement.controls = true;

    audioElement.addEventListener('loadeddata', () => {
      audioElement.play();
    });

    this.transcribeAudio(this.audioBlob);
  }

  async transcribeAudio(audioBlob) {
    const reader = new FileReader();

    reader.onload = async () => {
      const audioBuffer = reader.result;

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      await audioContext.decodeAudioData(audioBuffer);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        this.transcription = finalTranscript;
        console.log('Transcription:', finalTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Error in recognition:', event);
      };

      recognition.start();
    };

    reader.readAsArrayBuffer(audioBlob);
  }
}
