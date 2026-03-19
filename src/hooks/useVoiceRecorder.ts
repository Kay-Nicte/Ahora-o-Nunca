import { useState } from 'react'
import { Audio } from 'expo-av'
import { readAsStringAsync } from 'expo-file-system/legacy'
import { Category, EnergyLevel } from '../types'
import { supabase } from '../lib/supabase'

interface VoiceResult {
  text: string
  category: Category | null
  energyLevels: EnergyLevel[]
}

// Convert Uint8Array to base64 string
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null)

  const startRecording = async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync()
      if (!granted) return false

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        },
      })

      setRecordingInstance(recording)
      setRecording(true)
      return true
    } catch (err) {
      console.error('Failed to start recording:', err)
      return false
    }
  }

  const stopAndTranscribe = async (): Promise<VoiceResult | null> => {
    if (!recordingInstance) return null

    setRecording(false)
    setProcessing(true)

    try {
      await recordingInstance.stopAndUnloadAsync()
      const uri = recordingInstance.getURI()
      setRecordingInstance(null)

      if (!uri) {
        setProcessing(false)
        return null
      }

      // Read file as base64
      const base64 = await readAsStringAsync(uri, { encoding: 'base64' })

      console.log('[Voice] Audio base64 length:', base64.length)

      // Send to Edge Function
      const { data, error } = await supabase.functions.invoke('transcribe-task', {
        body: { audio: base64 },
      })

      console.log('[Voice] Response:', JSON.stringify({ data, error }))

      if (error || !data || !data.text) {
        console.log('[Voice] No result — error:', error, 'data:', data)
        setProcessing(false)
        return null
      }

      const validCategories: Category[] = ['home', 'work', 'mobile', 'errands', 'personal']
      const validEnergy: EnergyLevel[] = ['high', 'calm', 'short_time', 'mobile_only']

      setProcessing(false)
      return {
        text: data.text,
        category: validCategories.includes(data.category) ? data.category : null,
        energyLevels: Array.isArray(data.energyLevels)
          ? data.energyLevels.filter((l: string) => validEnergy.includes(l as EnergyLevel))
          : [],
      }
    } catch (err) {
      console.error('Transcription failed:', err)
      setProcessing(false)
      return null
    }
  }

  const cancelRecording = async () => {
    if (!recordingInstance) return
    try {
      await recordingInstance.stopAndUnloadAsync()
    } catch (_) {}
    setRecordingInstance(null)
    setRecording(false)
  }

  return { recording, processing, startRecording, stopAndTranscribe, cancelRecording }
}
