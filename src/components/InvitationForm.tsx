// src/components/InvitationForm.tsx
'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'

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
  onChange?: (data: FormState) => void
  onSubmit: (data: FormState) => Promise<void>
}

export default function InvitationForm({
  initialValues = {},
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

    // Name
    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (!/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = 'Name can only contain letters and spaces'
    }

    // Birthdate & age ≥ 18
    if (!form.dob) {
      newErrors.dob = 'Birthdate is required'
    } else if (calculateAge(form.dob) < 18) {
      newErrors.dob = 'You must be at least 18 years old'
    }

    // Email (optional) validation
    if (form.email && !isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone (optional) validation
    if (form.phone && !/^[0-9]+$/.test(form.phone)) {
      newErrors.phone = 'Phone number must contain digits only'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(form)
      setSuccessMessage('Thank you! Your RSVP has been submitted.')
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {serverError && <p className="error">{serverError}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="form-group">
        <label htmlFor="name">
          Name <span className="required">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="dob">
          Birthdate <span className="required">*</span>
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
        />
        {errors.dob && <p className="error">{errors.dob}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email (optional)</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <p className="hint">
          If left blank, we will use your invitation email.
        </p>
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone (optional)</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}
      </div>

      <div className="form-group">
        <label className="checkbox-label" htmlFor="consent">
          <input type="hidden" name="consent" value="false" />
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={form.consent}
            onChange={handleChange}
          />
          I consent to photos being used for marketing purposes{' '}
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label" htmlFor="reminder">
          <input
            id="reminder"
            name="reminder"
            type="checkbox"
            checked={form.reminder}
            onChange={handleChange}
          />
          I want to receive reminders by email or phone message
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="submit-button">
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </button>

      <style jsx>{`
        .form-container {
          max-width: 500px;
          margin: 2rem auto;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
        }
        .form-group {
          margin-bottom: 1rem;
          width: 90%;
        }
        label {
          font-weight: bold;
          margin-bottom: 0.25rem;
          display: block;
        }
        .hint {
          font-size: 0.875rem;
          color: #555;
          margin: 0.25rem 0;
        }
        input[type='text'],
        input[type='date'],
        input[type='email'],
        input[type='tel'] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
        }
        .checkbox-label input {
          margin-right: 0.5rem;
        }
        .error {
          color: #c00;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .success {
          color: #060;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .required {
          color: #c00;
        }
        .submit-button {
          width: 100%;
          padding: 0.75rem;
          background: #1f2937;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .submit-button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .submit-button:hover:not(:disabled) {
          background: #374151;
        }
      `}</style>
    </form>
  )
}
