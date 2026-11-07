'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  BarChart2,
  Trash2,
  Edit,
  Crown,
  Sparkles,
  UserCheck,
  Shield,
  LogOut,
  Users,
  UserPlus,
  Key,
  Save,
  X,
  Hash,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { format, parseISO, startOfDay, endOfDay, isWithinInterval, subDays } from 'date-fns'
import { pt } from 'date-fns/locale'

interface Booking {
  id: string
  service: string
  barber: string
  date: string
  time: string
  name: string
  phone: string
  email: string
  notes: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  duration?: number
}

interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'barber'
}

interface AdminUser {
  id: string
  username: string
  name: string
  role: 'admin' | 'barber'
}

const STATUS_LABELS: Record<Booking['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const BARBERS = ['Nuno', 'Ruben', 'Bruno', 'Vitor']

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bookings' | 'users'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [filterBarber, setFilterBarber] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'asc' })
  const [stats, setStats] = useState({ today: 0, week: 0, pending: 0, completed: 0 })

  // User management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [userForm, setUserForm] = useState({ username: '', name: '', role: 'barber' as 'admin' | 'barber', password: '', confirmPassword: '' })
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({})
  const [savingUser, setSavingUser] = useState(false)

  // Fetch current user session
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [router])

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    if (!user) return
    setBookingsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterDate) params.set('date', filterDate)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (user.role === 'admin' && filterBarber !== 'all') params.set('barber', filterBarber)
      // For barbers, the API will filter by their name automatically

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Fetch bookings error:', error)
    } finally {
      setBookingsLoading(false)
    }
  }, [user, filterDate, filterStatus, filterBarber])

  // Load bookings when filters change or user loads
  useEffect(() => {
    if (user && activeTab === 'bookings') {
      fetchBookings()
    }
  }, [user, activeTab, fetchBookings])

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setAdminUsers(data.users)
      }
    } catch (error) {
      console.error('Fetch users error:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Load users when admin tab is activated
  useEffect(() => {
    if (activeTab === 'users' && user?.role === 'admin') {
      fetchAdminUsers()
    }
  }, [activeTab, user])

  // Calculate stats based on user role
  useEffect(() => {
    if (!user) return

    let userBookings = bookings

    if (user.role === 'barber') {
      userBookings = bookings.filter(b => b.barber === user.name)
    }

    const today = startOfDay(new Date())
    const weekStart = startOfDay(subDays(new Date(), 6))
    const weekEnd = endOfDay(new Date())

    const todayCount = userBookings.filter(b => isWithinInterval(parseISO(b.date), { start: today, end: today })).length
    const weekCount = userBookings.filter(b => isWithinInterval(parseISO(b.date), { start: weekStart, end: weekEnd })).length
    const pendingCount = userBookings.filter(b => b.status === 'pending').length
    const completedCount = userBookings.filter(b => b.status === 'completed').length

    setStats({ today: todayCount, week: weekCount, pending: pendingCount, completed: completedCount })
  }, [bookings, user])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!response.ok) throw new Error('Erro ao atualizar')
      // Optimistic update
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    } catch (error) {
      console.error('Status change error:', error)
      alert('Erro ao atualizar estado')
      fetchBookings() // Refetch on error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que quer eliminar esta reserva?')) return

    try {
      const response = await fetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao eliminar')
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Erro ao eliminar reserva')
    }
  }

  const handleSort = (key: keyof Booking) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // User Management Functions
  const openUserModal = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setEditingUser(userToEdit)
      setUserForm({ username: userToEdit.username, name: userToEdit.name, role: userToEdit.role, password: '', confirmPassword: '' })
    } else {
      setEditingUser(null)
      setUserForm({ username: '', name: '', role: 'barber', password: '', confirmPassword: '' })
    }
    setUserFormErrors({})
    setShowUserModal(true)
  }

  const closeUserModal = () => {
    setShowUserModal(false)
    setEditingUser(null)
    setUserForm({ username: '', name: '', role: 'barber', password: '', confirmPassword: '' })
    setUserFormErrors({})
  }

  const validateUserForm = () => {
    const errors: Record<string, string> = {}
    if (!userForm.username.trim()) errors.username = 'Utilizador obrigatório'
    if (!userForm.name.trim()) errors.name = 'Nome obrigatório'
    if (!editingUser && !userForm.password) errors.password = 'Senha obrigatória'
    if (userForm.password && userForm.password.length < 8) errors.password = 'Mínimo 8 caracteres'
    if (userForm.password !== userForm.confirmPassword) errors.confirmPassword = 'Senhas não coincidem'
    setUserFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateUserForm()) return

    setSavingUser(true)
    try {
      const payload = {
        username: userForm.username.trim(),
        name: userForm.name.trim(),
        role: userForm.role,
        ...(userForm.password ? { password: userForm.password } : {}),
        ...(editingUser ? { id: editingUser.id } : {}),
      }

      const url = '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao guardar')
      }

      closeUserModal()
      fetchAdminUsers()
    } catch (error: any) {
      setUserFormErrors({ submit: error.message })
    } finally {
      setSavingUser(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem a certeza que quer eliminar este utilizador?')) return

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao eliminar')
      }
      fetchAdminUsers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const filteredBookings = (user?.role === 'barber'
    ? bookings.filter(b => b.barber === user.name)
    : bookings
  )
    .filter(b => {
      if (filterDate && b.date !== filterDate) return false
      if (filterBarber !== 'all' && b.barber !== filterBarber) return false
      if (filterStatus !== 'all' && b.status !== filterStatus) return false
      return true
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key] as string | number | undefined
      const bVal = b[sortConfig.key] as string | number | undefined
      if (aVal === undefined || bVal === undefined) return 0
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

  const userBookings = user?.role === 'barber'
    ? bookings.filter(b => b.barber === user.name)
    : bookings

  const exportCSV = () => {
    const headers = ['ID', 'Serviço', 'Barbeiro', 'Data', 'Hora', 'Cliente', 'Telefone', 'Email', 'Observações', 'Estado', 'Criado em']
    const rows = filteredBookings.map(b => [
      b.id, b.service, b.barber, format(parseISO(b.date), 'dd/MM/yyyy', { locale: pt }),
      b.time, b.name, b.phone, b.email || '-', b.notes || '-', STATUS_LABELS[b.status],
      format(parseISO(b.createdAt), 'dd/MM/yyyy HH:mm', { locale: pt })
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `kingsstudio-reservas-${user?.name || 'all'}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-noir-50 dark:bg-noir-1000 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gold-400">A carregar...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-noir-50 dark:bg-noir-1000">
      {/* Admin Header */}
      <header className="bg-noir-1000 border-b border-noir-800 sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-xl font-display font-bold text-white">
                <Scissors className="w-7 h-7 text-gold-500" />
                <span>KingsStudio <span className="text-gold-400">2020</span></span>
              </Link>
              <span className="hidden sm:block px-3 py-1 bg-gold-500/10 text-gold-400 text-xs font-medium rounded-full border border-gold-500/20">
                PAINEL ADMIN
              </span>
              {user.role === 'barber' && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {user.name}
                </span>
              )}
              {user.role === 'admin' && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {activeTab === 'bookings' && (
                <button
                  onClick={exportCSV}
                  className="btn-secondary gap-2 text-sm hidden sm:flex"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              )}
              <button
                onClick={handleLogout}
                className="btn-tertiary gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container-custom border-t border-noir-800">
          <nav className="flex gap-1 pb-2" role="tablist" aria-label="Secções do painel">
            <button
              role="tab"
              aria-selected={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-noir-50 dark:bg-noir-900 text-gold-500 border-b-2 border-gold-500'
                  : 'text-noir-500 hover:text-noir-700 dark:hover:text-noir-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Reservas
            </button>
            {user.role === 'admin' && (
              <button
                role="tab"
                aria-selected={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-noir-50 dark:bg-noir-900 text-gold-500 border-b-2 border-gold-500'
                    : 'text-noir-500 hover:text-noir-700 dark:hover:text-noir-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Utilizadores
              </button>
            )}
          </nav>
        </div>

        {/* Filters Bar - only for bookings tab */}
        {activeTab === 'bookings' && (
          <div className="container-custom py-4 border-t border-noir-800">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-400" />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="input-field pl-10 w-44"
                  />
                </div>

                {user.role === 'admin' && (
                  <select
                    value={filterBarber}
                    onChange={(e) => setFilterBarber(e.target.value)}
                    className="input-field w-40"
                  >
                    <option value="all">Todos Barbeiros</option>
                    {BARBERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field w-36"
                >
                  <option value="all">Todos Estados</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>

                <button
                  onClick={() => {
                    setFilterDate(format(new Date(), 'yyyy-MM-dd'))
                    setFilterBarber('all')
                    setFilterStatus('all')
                  }}
                  className="btn-tertiary text-sm gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Limpar
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-6 text-sm text-noir-500">
                <span>Hoje: <strong className="text-noir-950 dark:text-white">{stats.today}</strong></span>
                <span>Semana: <strong className="text-noir-950 dark:text-white">{stats.week}</strong></span>
                <span className="text-amber-600">Pendentes: <strong>{stats.pending}</strong></span>
                <span className="text-emerald-600">Concluídos: <strong>{stats.completed}</strong></span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            {/* Stats Cards Mobile */}
            <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
              <div className="card-luxury p-4 text-center">
                <div className="text-2xl font-bold text-gold-500">{stats.today}</div>
                <div className="text-xs text-noir-500">Hoje</div>
              </div>
              <div className="card-luxury p-4 text-center">
                <div className="text-2xl font-bold text-gold-500">{stats.week}</div>
                <div className="text-xs text-noir-500">Semana</div>
              </div>
              <div className="card-luxury p-4 text-center">
                <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
                <div className="text-xs text-noir-500">Pendentes</div>
              </div>
              <div className="card-luxury p-4 text-center">
                <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
                <div className="text-xs text-noir-500">Concluídos</div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="card-luxury overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead className="bg-noir-50 dark:bg-noir-900 border-b border-noir-200 dark:border-noir-800">
                    <tr>
                      {[
                        { key: 'date', label: 'Data' },
                        { key: 'time', label: 'Hora' },
                        { key: 'service', label: 'Serviço' },
                        ...(user.role === 'admin' ? [{ key: 'barber', label: 'Barbeiro' }] : []),
                        { key: 'name', label: 'Cliente' },
                        { key: 'phone', label: 'Telefone' },
                        { key: 'status', label: 'Estado' },
                        { key: 'actions', label: 'Ações' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-noir-500 dark:text-noir-400 uppercase tracking-wider cursor-pointer hover:text-gold-500 transition-colors"
                          onClick={() => col.key !== 'actions' && handleSort(col.key as keyof Booking)}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortConfig.key === col.key && (
                              sortConfig.direction === 'asc'
                                ? <ChevronUp className="w-4 h-4 text-gold-500" />
                                : <ChevronDown className="w-4 h-4 text-gold-500" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-noir-200 dark:divide-noir-800">
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={user.role === 'admin' ? 8 : 7} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-3 text-noir-400">
                            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
                            <p className="font-medium">A carregar reservas...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={user.role === 'admin' ? 8 : 7} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-3 text-noir-400">
                            <Calendar className="w-12 h-12 opacity-30" />
                            <p className="font-medium">Nenhuma reserva encontrada</p>
                            <p className="text-sm">Ajuste os filtros ou aguarde novas reservas</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-noir-50 dark:hover:bg-noir-900/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-medium text-noir-950 dark:text-white">
                              {format(parseISO(booking.date), 'dd/MM/yyyy', { locale: pt })}
                            </div>
                            <div className="text-xs text-noir-400">
                              {format(parseISO(booking.date), 'EEEE', { locale: pt })}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-mono text-noir-950 dark:text-white">
                            {booking.time}
                          </td>
                          <td className="px-4 py-4">
                            <span className="badge-gold">{booking.service}</span>
                          </td>
                          {user.role === 'admin' && (
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-gold-500" />
                                <span className="font-medium text-noir-950 dark:text-white">{booking.barber}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-noir-950 dark:text-white">{booking.name}</div>
                              {booking.email && (
                                <div className="text-xs text-noir-400">{booking.email}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <a href={`tel:${booking.phone.replace(/\s/g, '')}`} className="text-noir-600 dark:text-noir-400 hover:text-gold-500 transition-colors">
                              {booking.phone}
                            </a>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]} border border-transparent appearance-none cursor-pointer`}
                            >
                              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStatusChange(booking.id, booking.status === 'completed' ? 'confirmed' : 'completed')}
                                className="p-2 rounded-lg bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 hover:bg-gold-200 dark:hover:bg-gold-900/50 transition-colors"
                                aria-label={booking.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluído'}
                                title={booking.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluído'}
                              >
                                {booking.status === 'completed'
                                  ? <ChevronLeft className="w-4 h-4" />
                                  : <CheckCircle className="w-4 h-4 fill-current" />}
                              </button>
                              {(user.role === 'admin') && (
                                <button
                                  onClick={() => handleDelete(booking.id)}
                                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                  aria-label="Eliminar reserva"
                                  title="Eliminar reserva"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-4 border-t border-noir-200 dark:border-noir-800 flex items-center justify-between">
                <p className="text-sm text-noir-500">
                  A mostrar <strong>{filteredBookings.length}</strong> de <strong>{userBookings.length}</strong> reservas
                </p>
                <button
                  onClick={exportCSV}
                  className="btn-secondary gap-2 text-sm sm:hidden w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden mt-4 space-y-3">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="card-luxury p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gold-500" />
                        <span className="font-medium text-noir-950 dark:text-white">
                          {format(parseISO(booking.date), 'dd/MM/yyyy (EEEE)', { locale: pt })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="w-4 h-4 text-gold-500" />
                        <span className="font-mono font-medium text-noir-950 dark:text-white">{booking.time}</span>
                      </div>
                    </div>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]} border border-transparent appearance-none cursor-pointer`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-xs text-noir-400 block mb-1">Serviço</span>
                      <span className="font-medium text-noir-950 dark:text-white">{booking.service}</span>
                    </div>
                    {user.role === 'admin' && (
                      <div>
                        <span className="text-xs text-noir-400 block mb-1">Barbeiro</span>
                        <div className="flex items-center gap-1 font-medium text-noir-950 dark:text-white">
                          <Crown className="w-4 h-4 text-gold-500" />
                          {booking.barber}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-noir-400 block mb-1">Cliente</span>
                      <span className="font-medium text-noir-950 dark:text-white">{booking.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-noir-400 block mb-1">Telefone</span>
                      <a href={`tel:${booking.phone.replace(/\s/g, '')}`} className="text-noir-600 dark:text-noir-400 hover:text-gold-500">{booking.phone}</a>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="p-3 bg-noir-50 dark:bg-noir-900 rounded-lg mb-3">
                      <span className="text-xs text-noir-400 block mb-1">Observações</span>
                      <span className="text-sm text-noir-700 dark:text-noir-300">{booking.notes}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-noir-200 dark:border-noir-800">
                    <button
                      onClick={() => handleStatusChange(booking.id, booking.status === 'completed' ? 'confirmed' : 'completed')}
                      className="btn-tertiary flex-1 gap-1 text-sm py-2"
                    >
                      {booking.status === 'completed'
                        ? <>
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Reabrir
                          </>
                        : <>
                            <CheckCircle className="w-3.5 h-3.5 fill-current" />
                            Concluir
                          </>
                      }
                    </button>
                    {(user.role === 'admin') && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="btn-tertiary flex-1 gap-1 text-sm py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Users Tab - Admin Only */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-noir-950 dark:text-white">Gestão de Utilizadores</h2>
              <button
                onClick={() => openUserModal()}
                className="btn-primary gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Novo Utilizador
              </button>
            </div>

            {/* Users Table */}
            <div className="card-luxury overflow-hidden">
              {usersLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-noir-500">A carregar utilizadores...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full" role="table">
                      <thead className="bg-noir-50 dark:bg-noir-900 border-b border-noir-200 dark:border-noir-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-noir-500 dark:text-noir-400 uppercase tracking-wider">Utilizador</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-noir-500 dark:text-noir-400 uppercase tracking-wider">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-noir-500 dark:text-noir-400 uppercase tracking-wider">Função</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-noir-500 dark:text-noir-400 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-noir-200 dark:divide-noir-800">
                        {adminUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center gap-3 text-noir-400">
                                <Users className="w-12 h-12 opacity-30" />
                                <p className="font-medium">Nenhum utilizador encontrado</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          adminUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-noir-50 dark:hover:bg-noir-900/50 transition-colors">
                              <td className="px-4 py-4 font-mono text-sm text-noir-950 dark:text-white">{u.username}</td>
                              <td className="px-4 py-4 font-medium text-noir-950 dark:text-white">{u.name}</td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                  {u.role === 'admin' ? 'Administrador' : 'Barbeiro'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openUserModal(u)}
                                    className="p-2 rounded-lg bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 hover:bg-gold-200 dark:hover:bg-gold-900/50 transition-colors"
                                    aria-label="Editar utilizador"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  {(u.id !== user.id) && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                      aria-label="Eliminar utilizador"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Notas Importantes
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• As senhas são guardadas com <strong>bcrypt (hash seguro)</strong> - nunca são visíveis</li>
                <li>• Mínimo 8 caracteres para novas senhas</li>
                <li>• Não pode eliminar a si próprio nem o último administrador</li>
                <li>• Barbeiros só veem as suas próprias reservas</li>
                <li>• Dados guardados no Supabase (PostgreSQL)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Users Tab - Not Admin */}
        {activeTab === 'users' && user.role !== 'admin' && (
          <div className="card-luxury p-8 text-center">
            <Shield className="w-16 h-16 text-noir-300 dark:text-noir-700 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-noir-950 dark:text-white mb-2">Acesso Restrito</h3>
            <p className="text-noir-600 dark:text-noir-400">
              Apenas administradores podem gerir utilizadores.
            </p>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-1000/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="w-full max-w-md bg-white dark:bg-noir-1000 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-down border border-noir-200 dark:border-noir-800">
              <div className="flex items-center justify-between p-6 border-b border-noir-200 dark:border-noir-800 sticky top-0 bg-white/95 dark:bg-noir-1000/95 backdrop-blur-sm z-10 rounded-t-2xl">
                <h3 id="user-modal-title" className="font-display text-xl font-bold text-noir-950 dark:text-white">
                  {editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
                </h3>
                <button
                  onClick={closeUserModal}
                  className="p-2 rounded-lg text-noir-500 hover:text-noir-700 dark:hover:text-noir-300 hover:bg-noir-100 dark:hover:bg-noir-800 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="username" className="label-field flex items-center gap-2">
                    <User className="w-5 h-5 text-gold-500" />
                    Nome de Utilizador
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    className={`input-field ${userFormErrors.username ? 'border-red-500' : ''}`}
                    placeholder="ex: joao, maria, admin2"
                    disabled={!!editingUser || savingUser}
                    required
                  />
                  {userFormErrors.username && <p className="mt-1 text-sm text-red-500">{userFormErrors.username}</p>}
                  {editingUser && <p className="mt-1 text-xs text-noir-400">Não pode alterar o nome de utilizador</p>}
                </div>

                <div>
                  <label htmlFor="name" className="label-field flex items-center gap-2">
                    <User className="w-5 h-5 text-gold-500" />
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`input-field ${userFormErrors.name ? 'border-red-500' : ''}`}
                    placeholder="João Silva"
                    required
                    disabled={savingUser}
                  />
                  {userFormErrors.name && <p className="mt-1 text-sm text-red-500">{userFormErrors.name}</p>}
                </div>

                <div>
                  <label className="label-field flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold-500" />
                    Função
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'barber' }))}
                    className="input-field"
                    disabled={savingUser}
                  >
                    <option value="barber">Barbeiro (vê só as suas reservas)</option>
                    <option value="admin">Administrador (vê tudo, gere utilizadores)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="label-field flex items-center gap-2">
                    <Key className="w-5 h-5 text-gold-500" />
                    {editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      className={`input-field pr-12 ${userFormErrors.password ? 'border-red-500' : ''}`}
                      placeholder={editingUser ? 'Deixe vazio para não alterar' : 'Mínimo 8 caracteres'}
                      autoComplete={editingUser ? 'off' : 'new-password'}
                      required={!editingUser}
                      disabled={savingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setUserForm(prev => ({ ...prev, password: '', confirmPassword: '' }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-noir-400 hover:text-gold-500 text-xs"
                      disabled={savingUser}
                    >
                      Limpar
                    </button>
                  </div>
                  {userFormErrors.password && <p className="mt-1 text-sm text-red-500">{userFormErrors.password}</p>}
                  <p className="mt-1 text-xs text-noir-400">Mínimo 8 caracteres. Guardada com bcrypt hash.</p>
                </div>

                {editingUser && (
                  <div>
                    <label htmlFor="confirmPassword" className="label-field flex items-center gap-2">
                      <Key className="w-5 h-5 text-gold-500" />
                      Confirmar Nova Senha
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(e) => setUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`input-field ${userFormErrors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Repita a nova senha"
                      autoComplete="off"
                      disabled={savingUser}
                    />
                    {userFormErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{userFormErrors.confirmPassword}</p>}
                  </div>
                )}

                {!editingUser && (
                  <div>
                    <label htmlFor="confirmPasswordNew" className="label-field flex items-center gap-2">
                      <Key className="w-5 h-5 text-gold-500" />
                      Confirmar Senha
                    </label>
                    <input
                      id="confirmPasswordNew"
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(e) => setUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`input-field ${userFormErrors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                      required
                      disabled={savingUser}
                    />
                    {userFormErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{userFormErrors.confirmPassword}</p>}
                  </div>
                )}

                {userFormErrors.submit && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm" role="alert">
                    {userFormErrors.submit}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    className="btn-secondary flex-1"
                    disabled={savingUser}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={savingUser}
                  >
                    {savingUser ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        A guardar...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {editingUser ? 'Atualizar' : 'Criar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}