import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 180,
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          letterSpacing: '-4px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 50%, #3b82f6 100%)',
            opacity: 0.15,
          }}
        />
        <span style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #93b5f8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          K2
        </span>
      </div>
    ),
    { ...size }
  )
}
