import { DEFAULT_SCRIPTS, type AacScript, type AacScriptLine } from '../data/aacExtras'

type Props = {
  customScripts: AacScript[]
  onSpeakLine: (line: AacScriptLine) => void
  onClose: () => void
}

export function AacScriptsPanel({ customScripts, onSpeakLine, onClose }: Props) {
  const scripts = [...DEFAULT_SCRIPTS, ...customScripts]

  return (
    <div className="aac-scripts-panel" aria-label="Social scripts">
      <div className="aac-folder-open-bar">
        <button type="button" className="btn btn-primary aac-back-to-core" onClick={onClose}>
          ← Back to Core Board
        </button>
        <p className="aac-folder-open-title">
          <span aria-hidden="true">💬</span> Scripts
        </p>
      </div>
      <p className="fine-print">Ready-made phrases for greetings, classroom, medical, and mealtime.</p>
      <div className="aac-scripts-list">
        {scripts.map((script) => (
          <section key={script.id} className="aac-script-block">
            <h3>
              <span aria-hidden="true">{script.emoji}</span> {script.title}
            </h3>
            <p className="fine-print">{script.blurb}</p>
            <div className="aac-comm-grid cols-3" role="list">
              {script.lines.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  className="aac-comm-card aac-tile-slp is-fitzgerald"
                  role="listitem"
                  onClick={() => onSpeakLine(line)}
                  style={{
                    background: '#E1BEE7',
                    borderColor: '#8E24AA',
                    borderWidth: 4,
                    borderStyle: 'solid',
                  }}
                >
                  <span className="aac-comm-label">{line.label}</span>
                  <span className="aac-comm-emoji" aria-hidden="true">
                    {line.emoji}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
