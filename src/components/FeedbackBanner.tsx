type Props = {
  tone: 'idle' | 'good' | 'try'
  message: string
}

export function FeedbackBanner({ tone, message }: Props) {
  return (
    <div className={`feedback feedback-${tone}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
