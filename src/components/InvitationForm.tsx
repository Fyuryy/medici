// src/components/InvitationForm.tsx
'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import styles from '@/styles/components/InvitationForm.module.css'

export interface FormState {
  name: string
  dob: string
  consent: boolean
  reminder: boolean
  phone: string
  email: string
}

interface InvitationFormProps {
  initialValues?: Partial<FormState>
  expectedEmail?: string
  onChange?: (data: FormState) => void
  onSubmit: (data: FormState) => Promise<void>
}

export default function InvitationForm({
  initialValues = {},
  expectedEmail,
  onChange,
  onSubmit,
}: InvitationFormProps) {
  const [form, setForm] = useState<FormState>({
    name: initialValues.name || '',
    dob: initialValues.dob || '',
    consent: initialValues.consent ?? false,
    reminder: initialValues.reminder ?? false,
    phone: initialValues.phone || '',
    email: initialValues.email || '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    onChange?.(form)
  }, [form, onChange])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const calculateAge = (dob: string) => {
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    const newErrors: typeof errors = {}

    if (!form.name.trim()) newErrors.name = 'Le nom est requis'
    else if (!/^[A-Za-z\s]+$/.test(form.name))
      newErrors.name = 'Le nom ne doit contenir que des lettres'

    if (!form.dob) newErrors.dob = 'La date de naissance est requise'
    else if (calculateAge(form.dob) < 18)
      newErrors.dob = 'Vous devez avoir au moins 18 ans'

    if (!form.email) newErrors.email = "L'email est requis"
    else if (!isValidEmail(form.email))
      newErrors.email = 'Entrez un email valide'
    else if (expectedEmail && form.email !== expectedEmail)
      newErrors.email = "L'email doit correspondre à l'invitation"

    if (form.phone && !/^[0-9]+$/.test(form.phone))
      newErrors.phone = 'Le téléphone doit contenir uniquement des chiffres'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(form)
      setSuccessMessage('')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {serverError && <p className={styles.error}>{serverError}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Nom et Prénom <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="dob" className={styles.label}>
          Date de naissance <span className={styles.required}>*</span>
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.dob && <p className={styles.error}>{errors.dob}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          E-mail <span className={styles.required}>*</span>
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.label}>
          Téléphone (optionnel)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.phone && <p className={styles.error}>{errors.phone}</p>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel} htmlFor="consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={form.consent}
            onChange={handleChange}
            className={styles.checkbox}
          />
          J&apos;accepte être pris en photo au cours de l&apos;évènement et que
          ces images soient utilisées à des fins de communication
        </label>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel} htmlFor="reminder">
          <input
            id="reminder"
            name="reminder"
            type="checkbox"
            checked={form.reminder}
            onChange={handleChange}
            className={styles.checkbox}
          />
          Envoyez-moi un rappel par e-mail avant l&apos;événement
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? 'En cours...' : 'Envoyer'}
      </button>
    </form>
  )
}
