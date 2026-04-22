import { useCallback, useState } from 'react'
import { PreferencesView } from './components/PreferencesView'
import { ResultsView } from './components/ResultsView'
import { Toast } from './components/Toast'
import { UploadView } from './components/UploadView'
import { generateVisualizations } from './services/api'
import {
  ApiError,
  GenerateResponse,
  PALETTES,
  Preferences,
  View,
} from './types'

const INITIAL_PREFERENCES: Preferences = {
  style: 'Modern',
  vibe: 'Warm & Cozy',
  colorPalette: PALETTES[0].colors,
}

export function App() {
  const [view, setView] = useState<View>('upload')
  const [cadFile, setCadFile] = useState<File | null>(null)
  const [preferences, setPreferences] = useState<Preferences>(INITIAL_PREFERENCES)
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const runGeneration = useCallback(async (prefs: Preferences, file: File) => {
    setIsLoading(true)
    try {
      const data = await generateVisualizations(file, prefs)
      setResults(data)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Generation failed'
      setToastMessage(msg)
      setResults({ success: false, sections: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleGenerate = () => {
    if (!cadFile) return
    setResults(null)
    setView('results')
    void runGeneration(preferences, cadFile)
  }

  const handleGenerateNext = () => {
    if (!cadFile || isLoading) return
    setResults(null)
    void runGeneration(preferences, cadFile)
  }

  const handleBackToUpload = () => {
    if (isLoading) return
    setView('upload')
    setCadFile(null)
    setPreferences(INITIAL_PREFERENCES)
    setResults(null)
  }

  return (
    <>
      {view === 'upload' && (
        <UploadView
          file={cadFile}
          onFileSelected={setCadFile}
          onContinue={() => setView('preferences')}
        />
      )}
      {view === 'preferences' && cadFile && (
        <PreferencesView
          filename={cadFile.name}
          preferences={preferences}
          onChange={setPreferences}
          onGenerate={handleGenerate}
          onBack={handleBackToUpload}
          isLoading={isLoading}
        />
      )}
      {view === 'results' && (
        <ResultsView
          preferences={preferences}
          results={results}
          isLoading={isLoading}
          onBack={handleBackToUpload}
          onGenerateNext={handleGenerateNext}
        />
      )}
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  )
}
