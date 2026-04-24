import { FLATICON } from '../flaticon/icons'
import './FlaticonIcon.css'

export default function FlaticonIcon({
  name,
  size = 18,
  className = '',
  variant = 'inherit',
}) {
  const src = FLATICON[name]
  if (!src) return null

  if (variant === 'original') {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={`flaticon-icon flaticon-icon--bitmap${className ? ` ${className}` : ''}`}
        loading="lazy"
        decoding="async"
        aria-hidden
      />


      
    )
  }

  const dim = `${size}px`
  const maskStyle = {
    width: dim,
    height: dim,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
  }

  const mono = (
    <span
      className={`flaticon-icon-mono${className ? ` ${className}` : ''}`}
      style={maskStyle}
      aria-hidden
    />
  )

  if (variant === 'toolbar') {
    return <span className="flaticon-icon-toolbar">{mono}</span>
  }

  return mono
}
