import { ReactNode } from 'react'
import { PALETTES, Preferences, STYLES, VIBES } from '../types'

interface PreferencesViewProps {
  filename: string
  preferences: Preferences
  onChange: (next: Preferences) => void
  onGenerate: () => void
  onBack: () => void
  isLoading: boolean
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected?: boolean
  onClick?: () => void
}) {
  const isInteractive = onClick !== undefined
  return (
    <span
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className="inline-flex items-center gap-2 transition-colors duration-150 select-none"
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '12px',
        padding: '8px 16px',
        borderRadius: '999px',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: selected ? 'var(--accent-tint)' : 'transparent',
        color: selected ? 'var(--text)' : 'var(--muted)',
        cursor: isInteractive ? 'pointer' : 'default',
        letterSpacing: '0.05em',
      }}
    >
      {label}
    </span>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <div className="ui-label">{children}</div>
}

function Section({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="py-8" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-baseline gap-3">
        <SectionLabel>{label}</SectionLabel>
        {hint && (
          <span
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              color: 'var(--muted)',
              opacity: 0.75,
            }}
          >
            {hint}
          </span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function PreferencesView({
  filename,
  preferences,
  onChange,
  onGenerate,
  onBack,
  isLoading,
}: PreferencesViewProps) {
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    onChange({ ...preferences, [key]: value })
  }

  const selectedPaletteIndex = PALETTES.findIndex(
    (p) =>
      p.colors.length === preferences.colorPalette.length &&
      p.colors.every((c, i) => c === preferences.colorPalette[i]),
  )

  const canGenerate =
    !!preferences.style &&
    !!preferences.vibe &&
    preferences.colorPalette.length > 0 &&
    !isLoading

  return (
    <div className="min-h-screen w-full view-enter">
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

      <div
        className="mx-auto px-6"
        style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 64 }}
      >
        <div className="flex items-start justify-between gap-6 mb-2">
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
            }}
            className="hover:text-[var(--text)] transition-colors"
          >
            ← Back
          </button>
          <span
            className="flex-shrink-0 truncate"
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              padding: '6px 10px',
              borderRadius: '4px',
              maxWidth: 240,
              letterSpacing: '0.05em',
            }}
            title={filename}
          >
            {filename}
          </span>
        </div>

        <h2
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '28px',
            lineHeight: 1.15,
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          Configure Your Vision
        </h2>
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '12px',
            color: 'var(--muted)',
            letterSpacing: '0.02em',
          }}
        >
          Set the tone, accent, and vibe. Nano Banana will analyze the CAD and
          render each key section for you — no room-by-room setup needed.
        </p>

        <Section label="Design Style" hint="tone">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={preferences.style === s}
                onClick={() => update('style', s)}
              />
            ))}
          </div>
        </Section>

        <Section label="Vibe" hint="atmosphere">
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip
                key={v}
                label={v}
                selected={preferences.vibe === v}
                onClick={() => update('vibe', v)}
              />
            ))}
          </div>
        </Section>

        <Section label="Color Palette" hint="accent">
          <div className="flex flex-col gap-2">
            {PALETTES.map((palette, i) => {
              const selected = i === selectedPaletteIndex
              return (
                <div
                  key={palette.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => update('colorPalette', palette.colors)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      update('colorPalette', palette.colors)
                    }
                  }}
                  className="flex items-center gap-4 cursor-pointer transition-colors duration-150"
                  style={{
                    padding: '12px 16px',
                    borderLeft: `2px solid ${selected ? 'var(--accent)' : 'transparent'}`,
                    backgroundColor: selected ? 'var(--surface)' : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    className="w-32 flex-shrink-0"
                    style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: '11px',
                      color: 'var(--muted)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {palette.name}
                  </span>
                  <div className="flex gap-2">
                    {palette.colors.map((c) => (
                      <div
                        key={c}
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: c,
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        <div className="pt-8 flex gap-3">
          <button
            onClick={onBack}
            disabled={isLoading}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--muted)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '14px 24px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              opacity: isLoading ? 0.4 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.borderColor = 'var(--muted)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            ← Back
          </button>
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="flex-1 transition-colors duration-150"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#0C0C0C',
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '14px 0',
              borderRadius: '4px',
              opacity: canGenerate ? 1 : 0.4,
              cursor: canGenerate ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (canGenerate) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)'
            }}
          >
            {isLoading ? (
              <span>
                Rendering<span className="loading-dots" />
              </span>
            ) : (
              <>Generate Visualizations →</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
