import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import fetch from 'fetch';

export default class VoiceAiController extends Controller {
  @tracked transcription = '';

  @service router;

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

  async handleRecordingStop() {
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
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await fetch('http://127.0.0.1:3001/transcriptions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.transcription = data.transcription;
      console.log('Transcription:', data.transcription);
    } catch (error) {
      console.error('Error transcribing the audio:', error);
    }
  }
}
