import { GenerateResponse, Preferences, SectionResult } from '../types'
import { downloadImage } from '../utils/download'

interface ResultsViewProps {
  preferences: Preferences
  results: GenerateResponse | null
  isLoading: boolean
  onBack: () => void
  onGenerateNext: () => void
}

const SKELETON_SECTION_COUNT = 4

function MetaChip({ children }: { children: string }) {
  return (
    <span
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '11px',
        color: 'var(--muted)',
        border: '1px solid var(--border)',
        padding: '4px 10px',
        borderRadius: '4px',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ImageCard({
  sectionName,
  viewpoint,
  index,
  imageBase64,
  mimeType,
}: {
  sectionName: string
  viewpoint: string
  index: number
  imageBase64: string
  mimeType: string
}) {
  const src = `data:${mimeType};base64,${imageBase64}`
  const downloadName = `${sectionName}_v${index}`

  return (
    <div
      className="relative group transition-colors duration-150 overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        aspectRatio: '4 / 3',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <img
        src={src}
        alt={`${sectionName} variation ${index}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      <div
        className="absolute top-2 left-2"
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          backgroundColor: 'rgba(0,0,0,0.65)',
          color: 'var(--accent)',
          padding: '4px 8px',
          borderRadius: '2px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        V{index}
      </div>

      <div
        className="absolute left-2 right-14 bottom-2 flex flex-col gap-0.5"
        style={{
          backgroundColor: 'rgba(0,0,0,0.65)',
          padding: '6px 10px',
          borderRadius: '2px',
        }}
      >
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            color: 'var(--text)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {sectionName}
        </span>
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '0.02em',
            lineHeight: 1.3,
          }}
        >
          {viewpoint}
        </span>
      </div>

      <button
        onClick={() => downloadImage(imageBase64, downloadName, index)}
        aria-label={`Download ${sectionName} variation ${index}`}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: 'var(--text)',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <DownloadIcon />
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      className="skeleton"
      style={{
        border: '1px solid var(--border)',
        borderRadius: '4px',
        aspectRatio: '4 / 3',
      }}
    />
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-6 text-center"
      style={{
        border: '1px solid var(--error)',
        borderRadius: '4px',
        aspectRatio: '4 / 3',
        backgroundColor: 'var(--surface)',
      }}
    >
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '12px',
          color: 'var(--error)',
          letterSpacing: '0.05em',
        }}
      >
        Generation failed
      </span>
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: 'var(--muted)',
          lineHeight: 1.4,
          maxWidth: 260,
        }}
      >
        {message}
      </span>
    </div>
  )
}

function SectionBlock({ section, index }: { section: SectionResult; index: number }) {
  return (
    <section className="mb-12">
      <div
        className="flex items-start justify-between gap-4 mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                color: 'var(--muted)',
                letterSpacing: '0.2em',
              }}
            >
              0{index + 1}
            </span>
            <h3
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '22px',
                lineHeight: 1.2,
                color: 'var(--text)',
              }}
            >
              {section.name}
            </h3>
          </div>
          <p
            className="mt-2"
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '12px',
              color: 'var(--muted)',
              lineHeight: 1.5,
              maxWidth: 720,
            }}
          >
            {section.description}
          </p>
          <p
            className="mt-1"
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              color: 'var(--muted)',
              letterSpacing: '0.05em',
              opacity: 0.75,
            }}
          >
            <span style={{ color: 'var(--accent)' }}>↳ </span>
            {section.viewpoint}
          </p>
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        {section.error ? (
          <>
            <ErrorCard message={section.errorMessage ?? 'Unknown error'} />
            <ErrorCard message={section.errorMessage ?? 'Unknown error'} />
          </>
        ) : (
          section.variations.map((v) => (
            <ImageCard
              key={v.index}
              sectionName={section.name}
              viewpoint={section.viewpoint}
              index={v.index}
              imageBase64={v.imageBase64}
              mimeType={v.mimeType}
            />
          ))
        )}
      </div>
    </section>
  )
}

function SkeletonBlock({ index }: { index: number }) {
  return (
    <section className="mb-12">
      <div
        className="flex items-start gap-4 mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                color: 'var(--muted)',
                letterSpacing: '0.2em',
              }}
            >
              0{index + 1}
            </span>
            <div
              className="skeleton"
              style={{ height: 22, width: 180, borderRadius: '2px' }}
            />
          </div>
          <div
            className="skeleton mt-3"
            style={{ height: 12, width: '70%', borderRadius: '2px' }}
          />
          <div
            className="skeleton mt-2"
            style={{ height: 10, width: '40%', borderRadius: '2px' }}
          />
        </div>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  )
}

export function ResultsView({
  preferences,
  results,
  isLoading,
  onBack,
  onGenerateNext,
}: ResultsViewProps) {
  const showSkeletons = isLoading && !results

  return (
    <div className="min-h-screen w-full view-enter flex flex-col">
      <header
        className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6"
        style={{
          backgroundColor: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          height: 56,
        }}
      >
        <div className="flex items-center gap-5 min-w-0">
          <button
            onClick={onBack}
            disabled={isLoading}
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              color: 'var(--muted)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '4px 0',
              opacity: isLoading ? 0.4 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
            className="hover:text-[var(--text)] transition-colors"
          >
            ← Back
          </button>
          <div
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              letterSpacing: '0.2em',
              color: 'var(--text)',
            }}
          >
            VISUALIZATIONS
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {preferences.style && <MetaChip>{preferences.style}</MetaChip>}
          {preferences.vibe && <MetaChip>{preferences.vibe}</MetaChip>}
        </div>
      </header>

      <main className="flex-1 px-6 py-8 mx-auto w-full" style={{ maxWidth: 1100 }}>
        {isLoading && (
          <div
            className="mb-8 px-4 py-3 flex items-center gap-3"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '4px',
              backgroundColor: 'var(--surface)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                animation: 'skeletonPulse 1.4s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '12px',
                color: 'var(--muted)',
                letterSpacing: '0.05em',
              }}
            >
              {results
                ? 'Finalising renders'
                : 'Analysing floorplan & generating section renders'}
              <span className="loading-dots" />
            </span>
          </div>
        )}

        {showSkeletons &&
          Array.from({ length: SKELETON_SECTION_COUNT }).map((_, i) => (
            <SkeletonBlock key={i} index={i} />
          ))}

        {!showSkeletons && results && results.sections.length === 0 && (
          <div
            className="py-16 text-center"
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              color: 'var(--muted)',
            }}
          >
            No sections could be identified in this CAD. Try a clearer drawing.
          </div>
        )}

        {!showSkeletons &&
          results?.sections.map((section, i) => (
            <SectionBlock key={`${section.name}-${i}`} section={section} index={i} />
          ))}

        {!isLoading && results && results.sections.length > 0 && (
          <div
            className="mt-6 pt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '11px',
                color: 'var(--muted)',
                letterSpacing: '0.05em',
              }}
            >
              {results.sections.length} section
              {results.sections.length === 1 ? '' : 's'} rendered · Nano Banana on Vertex AI
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '13px',
                  color: 'var(--muted)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '12px 22px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                }}
                className="hover:text-[var(--text)] hover:border-[var(--muted)] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={onGenerateNext}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#0C0C0C',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  padding: '12px 24px',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--accent)')
                }
              >
                Generate Next →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
