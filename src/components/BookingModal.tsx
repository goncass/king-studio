'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, Clock, User, Phone, Mail, Scissors, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { services, barbers } from '@/lib/data'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'

const bookingSchema = z.object({
  service: z.string().min(1, 'Selecione um serviço'),
  barber: z.string().min(1, 'Selecione um barbeiro'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione uma hora'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(9, 'Telefone inválido').regex(/^[0-9+\-\s()]{9,}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  preSelectedService?: string
}

export function BookingModal({ isOpen, onClose, preSelectedService }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: preSelectedService || '',
      barber: '',
      date: '',
      time: '',
      name: '',
      phone: '',
      email: '',
      notes: '',
    },
  })

  const selectedService = watch('service')
  const selectedBarber = watch('barber')
  const selectedDate = watch('date')

  // Generate time slots (9:00 to 18:30, 30min intervals)
  const generateTimeSlots = () => {
    const slots: string[] = []
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }
    return slots
  }

  const allTimeSlots = generateTimeSlots()

  // Simulate fetching available slots (in real app, this would be an API call)
  useEffect(() => {
    if (selectedService && selectedBarber && selectedDate) {
      // Simulate some slots being booked
      const bookedSlots = ['10:00', '11:00', '14:30', '16:00']
      const available = allTimeSlots.filter((slot) => !bookedSlots.includes(slot))
      setAvailableSlots(available)
    } else {
      setAvailableSlots([])
    }
  }, [selectedService, selectedBarber, selectedDate])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset({
        service: preSelectedService || '',
        barber: '',
        date: '',
        time: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
      })
      setStep(1)
      setSubmitStatus('idle')
      setErrorMessage('')
    }
  }, [isOpen, reset, preSelectedService])

  const serviceData = services.find((s) => s.id === selectedService)
  const barberData = barbers.find((b) => b.id === selectedBarber)

  const handleNext = () => {
    if (step === 1 && selectedService && selectedBarber) {
      setStep(2)
    } else if (step === 2 && selectedDate && getValues('time')) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsLoading(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // In production, this would be an API call to your backend
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Erro ao agendar')

      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Não foi possível processar o agendamento. Tente novamente ou ligue para 915 271 491.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const minDate = format(startOfDay(new Date()), 'yyyy-MM-dd')
  const maxDate = format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') // 60 days ahead

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-800 sticky top-0 bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <h2 id="booking-title" className="font-display text-2xl font-bold text-dark-900 dark:text-white">
            Agendamento Online
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            aria-label="Fechar agendamento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Serviço', icon: Scissors },
              { num: 2, label: 'Data/Hora', icon: Calendar },
              { num: 3, label: 'Dados', icon: User },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step >= s.num
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-100 dark:bg-dark-800 text-dark-400 dark:text-dark-500'
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${step >= s.num ? 'text-dark-900 dark:text-white' : 'text-dark-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`hidden md:block h-0.5 flex-1 mx-2 transition-colors ${
                      step > s.num ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Step 1: Service & Barber */}
          {step === 1 && (
            <div className="space-y-6" data-step="1">
              <div>
                <label className="label-field flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Serviço
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Escolha o serviço">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        selectedService === service.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('service')}
                        value={service.id}
                        className="sr-only"
                        aria-label={service.name}
                      />
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <Scissors className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-dark-900 dark:text-white truncate pr-2">
                              {service.name}
                            </h4>
                            {service.popular && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium flex-shrink-0">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-1">{service.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-dark-500 dark:text-dark-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                              {service.duration}
                            </span>
                            <span className="font-medium text-dark-900 dark:text-white">{service.price}</span>
                          </div>
                        </div>
                      </div>
                      {selectedService === service.id && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-primary-500 fill-current" aria-hidden="true" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.service && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.service.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-field flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Barbeiro
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Escolha o barbeiro">
                  {barbers.map((barber) => (
                    <label
                      key={barber.id}
                      className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
                        selectedBarber === barber.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('barber')}
                        value={barber.id}
                        className="sr-only"
                        aria-label={barber.name}
                      />
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-dark-100 dark:bg-dark-800 relative">
                        <img
                          src={barber.image}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="font-semibold text-dark-900 dark:text-white text-sm">{barber.name}</h4>
                      <p className="text-xs text-primary-500 dark:text-primary-400 mt-0.5">{barber.role}</p>
                      {selectedBarber === barber.id && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-primary-500 fill-current" aria-hidden="true" />
                      )}
                    </label>
                  ))}
                </div>
                {errors.barber && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.barber.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedService || !selectedBarber}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-6" data-step="2">
              <div>
                <label className="label-field flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Data
                </label>
                <input
                  type="date"
                  {...register('date')}
                  min={minDate}
                  max={maxDate}
                  className="input-field"
                  aria-describedby={errors.date ? 'date-error' : undefined}
                />
                {errors.date && (
                  <p id="date-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-field flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Hora
                </label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Escolha a hora">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue('time', slot)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                        getValues('time') === slot
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                      }`}
                      aria-pressed={getValues('time') === slot}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableSlots.length === 0 && selectedDate && (
                    <p className="text-sm text-dark-500 dark:text-dark-400 col-span-full text-center py-4">
                      Sem horários disponíveis para esta data. Escolha outra data.
                    </p>
                  )}
                  {availableSlots.length === 0 && !selectedDate && (
                    <p className="text-sm text-dark-500 dark:text-dark-400 col-span-full text-center py-4">
                      Selecione uma data para ver horários disponíveis
                    </p>
                  )}
                </div>
                {errors.time && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.time.message}
                  </p>
                )}
              </div>

              {/* Summary */}
              {(serviceData || barberData) && (
                <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                  <h4 className="font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-500" aria-hidden="true" />
                    Resumo
                  </h4>
                  <div className="space-y-2 text-sm">
                    {serviceData && (
                      <div className="flex justify-between">
                        <span className="text-dark-600 dark:text-dark-400">Serviço:</span>
                        <span className="font-medium text-dark-900 dark:text-white">{serviceData.name}</span>
                      </div>
                    )}
                    {barberData && (
                      <div className="flex justify-between">
                        <span className="text-dark-600 dark:text-dark-400">Barbeiro:</span>
                        <span className="font-medium text-dark-900 dark:text-white">{barberData.name}</span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="text-dark-600 dark:text-dark-400">Data:</span>
                        <span className="font-medium text-dark-900 dark:text-white">
                          {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: pt })}
                        </span>
                      </div>
                    )}
                    {getValues('time') && (
                      <div className="flex justify-between">
                        <span className="text-dark-600 dark:text-dark-400">Hora:</span>
                        <span className="font-medium text-dark-900 dark:text-white">{getValues('time')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedDate || !getValues('time')}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Personal Data */}
          {step === 3 && (
            <div className="space-y-6" data-step="3">
              <div>
                <label htmlFor="name" className="label-field flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="input-field"
                  placeholder="João Silva"
                  autoComplete="name"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="label-field flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="input-field"
                  placeholder="915 271 491"
                  autoComplete="tel"
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="label-field flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Email <span className="text-dark-400 text-sm font-normal">(opcional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="input-field"
                  placeholder="joao@email.com"
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="label-field flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Observações <span className="text-dark-400 text-sm font-normal">(opcional)</span>
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Alguma preferência especial, alergias a produtos, etc."
                  rows={3}
                />
              </div>

              {/* Final Summary */}
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <h4 className="font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  Confirmação do Agendamento
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-600 dark:text-dark-400">Serviço:</span>
                    <span className="font-medium text-dark-900 dark:text-white">{serviceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600 dark:text-dark-400">Barbeiro:</span>
                    <span className="font-medium text-dark-900 dark:text-white">{barberData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600 dark:text-dark-400">Data:</span>
                    <span className="font-medium text-dark-900 dark:text-white">
                      {selectedDate ? format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: pt }) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600 dark:text-dark-400">Hora:</span>
                    <span className="font-medium text-dark-900 dark:text-white">{getValues('time')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600 dark:text-dark-400">Preço:</span>
                    <span className="font-medium text-dark-900 dark:text-white">{serviceData?.price}</span>
                  </div>
                </div>
              </div>

              {submitStatus === 'error' && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3" role="alert">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="btn-secondary flex-1">
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      A agendar...
                    </>
                  ) : (
                    <>
                      Confirmar Agendamento
                      <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {submitStatus === 'success' && (
            <div className="text-center py-8" data-step="success">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500 fill-current" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-bold text-dark-900 dark:text-white mb-2">
                Agendamento Confirmado!
              </h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Receberá uma confirmação por SMS/Email. Aguardamos por si na KingsStudio 2020!
              </p>
              <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Serviço:</span>
                  <span className="font-medium text-dark-900 dark:text-white">{serviceData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Barbeiro:</span>
                  <span className="font-medium text-dark-900 dark:text-white">{barberData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Data:</span>
                  <span className="font-medium text-dark-900 dark:text-white">
                    {selectedDate ? format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: pt }) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Hora:</span>
                  <span className="font-medium text-dark-900 dark:text-white">{getValues('time')}</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}