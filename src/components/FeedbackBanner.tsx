type Props = {
  tone: 'idle' | 'good' | 'try'
  message: string
}

export function FeedbackBanner({ tone, message }: Props) {
  const live = tone === 'try' ? 'assertive' : 'polite'
  return (
    <div
      className={`feedback feedback-${tone}`}
      role="status"
      aria-live={live}
      aria-atomic="true"
    >
      {message || '\u00a0'}
    </div>
  )
}
