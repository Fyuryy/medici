'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import InvitationForm, { FormState } from '@/components/InvitationForm'
import Countdown from '@/components/Countdown'
import splashStyles from '@/styles/HomePage.module.css'
import formStyles from '@/styles/RsvpPage.module.css'

export default function PublicRSVPPage() {
  // splash visibility + fade trigger
  const [showSplash, setShowSplash] = useState(true)
  const [fadeSplash, setFadeSplash] = useState(false)
  const [rsvpError, setRsvpError] = useState('')

  const [formState, setFormState] = useState<FormState>({
    email: '',
    phone: '',
    consent: false,
    name: '',
    dob: '',
    reminder: false,
  })

  // Trigger fade after 5s
  useEffect(() => {
    const timer = setTimeout(() => setFadeSplash(true), 4500)
    return () => clearTimeout(timer)
  }, [])

  // After fade completes, hide splash
  const onFadeComplete = () => {
    if (fadeSplash) setShowSplash(false)
  }

  // RSVP handler
  const handleRSVP = async (values: FormState) => {
    setRsvpError('')
    try {
      const res = await fetch('/api/rsvp/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: !!values.consent,
          name: values.name,
          birthdate: values.dob,
          phone: values.phone,
          email: values.email,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
      )
      await stripe!.redirectToCheckout({ sessionId: json.sessionId })
    } catch (e) {
      setRsvpError(
        e instanceof Error ? e.message : 'An unexpected error occurred.'
      )
    }
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className={splashStyles.container}
            initial={{ opacity: 1 }}
            animate={{ opacity: fadeSplash ? 0 : 1 }}
            transition={{ duration: 1 }}
            onAnimationComplete={onFadeComplete}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <div className={splashStyles.logo}>
              <Image
                src="/logo_no_bg.png"
                alt="MEDICI Logo"
                width={722}
                height={153}
                priority
                sizes="(max-width: 768px) 80vw, 50vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className={splashStyles.countdown}>
              <Countdown date={new Date('2025-09-03T17:00:00')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <div className={formStyles.container}>
          <h1 className={formStyles.heading}>
            Insérez vos données personnelles <br /> et procédez au payement
          </h1>
          {rsvpError && <p style={{ color: 'red' }}>{rsvpError}</p>}
          <InvitationForm
            initialValues={formState}
            onChange={setFormState}
            onSubmit={handleRSVP}
          />
          <Image
            src="/logo_no_bg.png"
            alt="MEDICI Logo"
            width={120}
            height={25}
          />
        </div>
      )}
    </>
  )
}
