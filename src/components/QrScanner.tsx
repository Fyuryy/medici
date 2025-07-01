// src/components/QrScanner.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QrScannerProps {
  onScan: (decodedText: string) => void
  onError?: (errorMessage: string) => void
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scanner, setScanner] = useState<Html5QrcodeScanner>()
  console.log('QrScanner initialized: ', scanner)

  useEffect(() => {
    if (!containerRef.current) return

    const cfg = { fps: 10, qrbox: 250 }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      containerRef.current.id,
      cfg,
      /* verbose= */ false
    )

    html5QrcodeScanner.render(
      (decodedText) => {
        console.log('🔍 Scanned text:', decodedText)
        onScan(decodedText)
        html5QrcodeScanner.clear().catch(console.error)
      },
      (errorMessage) => {
        if (onError) onError(errorMessage)
      }
    )

    setScanner(html5QrcodeScanner)
    return () => {
      html5QrcodeScanner.clear().catch(console.error)
    }
  }, [containerRef, onScan, onError])

  return <div id="html5qr-code-full-region" ref={containerRef} />
}
