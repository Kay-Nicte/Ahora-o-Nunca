import { useState, useRef } from 'react'
import { Audio } from 'expo-av'
import { Category, EnergyLevel } from '../types'
import { classifyTask } from '../lib/classify'

interface VoiceResult {
  text: string
  category: Category | null
  energyLevels: EnergyLevel[]
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const recordingRef = useRef<Audio.Recording | null>(null)

  const startRecording = async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync()
      if (!granted) return false

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      recordingRef.current = recording
      setRecording(true)
      return true
    } catch (err) {
      console.error('Failed to start recording:', err)
      return false
    }
  }

  const stopRecording = async (): Promise<string | null> => {
    if (!recordingRef.current) return null

    setRecording(false)

    try {
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      return uri
    } catch (err) {
      console.error('Failed to stop recording:', err)
      recordingRef.current = null
      return null
    }
  }

  const cancelRecording = async () => {
    if (!recordingRef.current) return
    try {
      await recordingRef.current.stopAndUnloadAsync()
    } catch (_) {}
    recordingRef.current = null
    setRecording(false)
  }

  // Classify text after speech recognition
  const classifyVoiceText = async (text: string): Promise<VoiceResult> => {
    setProcessing(true)
    try {
      const result = await classifyTask(text)
      setProcessing(false)
      return {
        text,
        category: result.category,
        energyLevels: result.energyLevels,
      }
    } catch (_) {
      setProcessing(false)
      return { text, category: null, energyLevels: [] }
    }
  }

  return { recording, processing, startRecording, stopRecording, cancelRecording, classifyVoiceText }
}
