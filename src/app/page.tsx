'use client'

import Image from 'next/image'
import '../styles/globals.css'
import Link from 'next/link'
import Countdown from '@/components/Countdown'

// Dynamically load react-countdown so that it only renders on the client

export default function HomePage() {
  const eventDate = new Date('2025-08-22T19:00:00')

  return (
    <>
      <div className="testBox">
        <div>
          <p>Admin Page:</p>
          <Link href="/admin">Go to Admin Panel</Link>
        </div>
      </div>

      <div className="container">
        <div>
          <div className="logo">
            <Image
              src="/LOGOTYPO_MEDICI_NOIR.jpg"
              alt="MEDICI Logo"
              className="logo"
              width={722}
              height={153}
              priority
            />
          </div>

          <h1 className="title">Inauguration de MEDICI</h1>

          <div className="countdown">
            <Countdown date={eventDate} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
        .card {
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -4px rgba(0, 0, 0, 0.1);
          padding: 32px;
          max-width: 448px;
          width: 100%;
          flex-direction: column;
          align-items: center;
          display: flex;
        }
        .logo {
          flex-shrink: 0;
        }
        .title {
          margin-top: 24px;
          font-size: 30px;
          font-family: sans-serif;
          color: #1f2937;
          text-align: center;
        }
        .testBox {
          background-color: #ef4444;
          padding: 16px;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .subtitle {
          margin-top: 24px;
          font-size: 30px;
          font-family: sans-serif;
          color: #1f2937;
        }
        .countdown {
          margin-top: 16px;
          font-size: 20px;
          color: #4b5563;
          text-align: center;
        }
        @media (min-width: 768px) {
          .title {
            font-size: 48px;
          }
          .subtitle {
            font-size: 48px;
          }
          .countdown {
            font-size: 30px;
          }
        }
      `}</style>
    </>
  )
}
