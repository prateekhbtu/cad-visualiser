import axios, { AxiosError } from 'axios'
import { ApiError, GenerateResponse, Preferences } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function generateVisualizations(
  file: File,
  preferences: Preferences,
): Promise<GenerateResponse> {
  const formData = new FormData()
  formData.append('cadFile', file)
  formData.append('preferences', JSON.stringify(preferences))

  try {
    const response = await axios.post<GenerateResponse>(
      `${API_BASE_URL}/api/generate`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      },
    )

    if (!response.data.success) {
      throw new ApiError('Generation failed', response.status)
    }
    return response.data
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ error?: string; success?: boolean }>
      const message =
        axiosErr.response?.data?.error ??
        axiosErr.message ??
        'Network error while generating visualizations'
      throw new ApiError(message, axiosErr.response?.status)
    }
    throw new ApiError(err instanceof Error ? err.message : 'Unknown error')
  }
}
