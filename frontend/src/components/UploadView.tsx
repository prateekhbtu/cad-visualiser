import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from 'react'

interface UploadViewProps {
  file: File | null
  onFileSelected: (file: File | null) => void
  onContinue: () => void
}

const ACCEPT = '.png,.jpg,.jpeg,.pdf'
const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function UploadView({ file, onFileSelected, onContinue }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setThumbnailUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setThumbnailUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFile = useCallback(
    (candidate: File | undefined | null) => {
      if (!candidate) return
      const isAccepted =
        ACCEPT_TYPES.includes(candidate.type) ||
        /\.(png|jpe?g|pdf)$/i.test(candidate.name)
      if (!isAccepted) return
      onFileSelected(candidate)
    },
    [onFileSelected],
  )

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
  }

  return (
    <div className="relative min-h-screen w-full grid-bg view-enter">
      <div
        className="fixed top-6 left-6 z-10 select-none"
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '13px',
          letterSpacing: '0.2em',
          color: 'var(--muted)',
        }}
      >
        CAD VISUALIZER
      </div>

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '36px',
                lineHeight: 1.15,
              }}
            >
              Upload Your CAD Drawing
            </h1>
            <p
              className="mt-3"
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '14px',
                color: 'var(--muted)',
              }}
            >
              Drop an architectural floor plan or sketch to begin
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="relative cursor-pointer transition-colors duration-150"
            style={{
              width: 480,
              height: 240,
              border: `1px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
              backgroundColor: isDragging ? 'var(--surface)' : 'transparent',
              borderRadius: '4px',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleChange}
              className="hidden"
            />
            {!file ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isDragging ? 'var(--accent)' : 'var(--muted)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '13px',
                    color: isDragging ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  Drop CAD file here or click to browse
                </span>
                <span
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '11px',
                    color: 'var(--muted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  PNG · JPG · PDF
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center gap-5 px-6">
                <div
                  className="flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: 96,
                    height: 96,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: '11px',
                        color: 'var(--muted)',
                        letterSpacing: '0.15em',
                      }}
                    >
                      PDF
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <span
                    className="truncate"
                    style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '13px',
                      color: 'var(--text)',
                    }}
                  >
                    {file.name}
                  </span>
                  <span
                    style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '11px',
                      color: 'var(--muted)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {formatSize(file.size)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileSelected(null)
                    }}
                    style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '11px',
                      color: 'var(--muted)',
                      letterSpacing: '0.1em',
                      textAlign: 'left',
                    }}
                    className="hover:text-[var(--text)] transition-colors"
                  >
                    Replace file
                  </button>
                </div>
                <div
                  className="absolute top-3 right-3 flex items-center justify-center"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1px solid var(--accent)',
                  }}
                  aria-label="Selected"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onContinue}
            disabled={!file}
            className="transition-colors duration-150"
            style={{
              width: 480,
              backgroundColor: 'var(--accent)',
              color: '#0C0C0C',
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '14px 0',
              borderRadius: '4px',
              opacity: file ? 1 : 0.4,
              cursor: file ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (file) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)'
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
