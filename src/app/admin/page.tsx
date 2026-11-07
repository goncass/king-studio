'use client'

import { useState, useEffect } from 'react'
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
}

interface BarberUser {
  username: string
  password: string
  name: string
  role: 'admin' | 'barber'
  avatar?: string
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

const BARBERS = ['King', 'Ricardo', 'Miguel']

// Barber user accounts - in production, store in database/env vars
const BARBER_USERS: BarberUser[] = [
  { username: 'king', password: 'king2020', name: 'King', role: 'admin' },
  { username: 'ricardo', password: 'ricardo2020', name: 'Ricardo', role: 'barber' },
  { username: 'miguel', password: 'miguel2020', name: 'Miguel', role: 'barber' },
  { username: 'admin', password: 'kings2020', name: 'Admin', role: 'admin' },
]

// Demo data - in production this would come from a database
const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'KS-1704067200001',
    service: 'Corte + Barba',
    barber: 'King',
    date: '2024-12-15',
    time: '14:30',
    name: 'João Silva',
    phone: '915 271 491',
    email: 'joao@email.com',
    notes: 'Prefere fade baixo',
    createdAt: '2024-12-10T10:30:00Z',
    status: 'confirmed',
  },
  {
    id: 'KS-1704067200002',
    service: 'Fade Cut',
    barber: 'Ricardo',
    date: '2024-12-15',
    time: '10:00',
    name: 'Miguel Santos',
    phone: '912 345 678',
    email: '',
    notes: '',
    createdAt: '2024-12-11T14:20:00Z',
    status: 'pending',
  },
  {
    id: 'KS-1704067200003',
    service: 'Navalha Quente',
    barber: 'King',
    date: '2024-12-14',
    time: '16:00',
    name: 'Pedro Costa',
    phone: '918 765 432',
    email: 'pedro@email.com',
    notes: 'Pele sensível',
    createdAt: '2024-12-12T09:15:00Z',
    status: 'completed',
  },
  {
    id: 'KS-1704067200004',
    service: 'Corte Criança',
    barber: 'Miguel',
    date: '2024-12-16',
    time: '11:00',
    name: 'André Ferreira',
    phone: '913 456 789',
    email: '',
    notes: 'Primeiro corte do filho (8 anos)',
    createdAt: '2024-12-13T16:45:00Z',
    status: 'confirmed',
  },
  {
    id: 'KS-1704067200005',
    service: 'Coloração',
    barber: 'King',
    date: '2024-12-16',
    time: '15:30',
    name: 'Rui Martins',
    phone: '917 890 123',
    email: 'rui@email.com',
    notes: 'Cobrir brancos - tom natural',
    createdAt: '2024-12-13T18:00:00Z',
    status: 'pending',
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<BarberUser | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS)
  const [filterDate, setFilterDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [filterBarber, setFilterBarber] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'asc' })
  const [stats, setStats] = useState({ today: 0, week: 0, pending: 0, completed: 0 })

  // Check if already authenticated (sessionStorage)
  useEffect(() => {
    const auth = sessionStorage.getItem('kingsstudio_admin_auth')
    const userData = sessionStorage.getItem('kingsstudio_admin_user')
    if (auth === 'true' && userData) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  // Calculate stats based on user role
  useEffect(() => {
    let userBookings = bookings

    // Barbers only see their own bookings
    if (currentUser?.role === 'barber') {
      userBookings = bookings.filter(b => b.barber === currentUser.name)
    }

    const today = startOfDay(new Date())
    const weekStart = startOfDay(subDays(new Date(), 6))
    const weekEnd = endOfDay(new Date())

    const todayCount = userBookings.filter(b => isWithinInterval(parseISO(b.date), { start: today, end: today })).length
    const weekCount = userBookings.filter(b => isWithinInterval(parseISO(b.date), { start: weekStart, end: weekEnd })).length
    const pendingCount = userBookings.filter(b => b.status === 'pending').length
    const completedCount = userBookings.filter(b => b.status === 'completed').length

    setStats({ today: todayCount, week: weekCount, pending: pendingCount, completed: completedCount })
  }, [bookings, currentUser])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = BARBER_USERS.find(u => u.username === username && u.password === password)

    if (user) {
      setIsAuthenticated(true)
      setCurrentUser(user)
      sessionStorage.setItem('kingsstudio_admin_auth', 'true')
      sessionStorage.setItem('kingsstudio_admin_user', JSON.stringify(user))
      setError('')
      setPassword('')
    } else {
      setError('Utilizador ou senha incorretos. Tente novamente.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setUsername('')
    setPassword('')
    sessionStorage.removeItem('kingsstudio_admin_auth')
    sessionStorage.removeItem('kingsstudio_admin_user')
  }

  const handleStatusChange = (id: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que quer eliminar esta reserva?')) {
      setBookings(prev => prev.filter(b => b.id !== id))
    }
  }

  const handleSort = (key: keyof Booking) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Filter bookings based on user role
  const userBookings = currentUser?.role === 'barber'
    ? bookings.filter(b => b.barber === currentUser.name)
    : bookings

  const filteredBookings = userBookings
    .filter(b => {
      if (filterDate && b.date !== filterDate) return false
      if (filterBarber !== 'all' && b.barber !== filterBarber) return false
      if (filterStatus !== 'all' && b.status !== filterStatus) return false
      return true
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

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
    link.download = `kingsstudio-reservas-${currentUser?.name || 'all'}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-noir-1000 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-display font-bold text-white mb-4">
              <Scissors className="w-8 h-8 text-gold-500" />
              <span>KingsStudio <span className="text-gold-400">2020</span></span>
            </Link>
            <Crown className="w-16 h-16 text-gold-500 mx-auto mb-4 opacity-50" />
            <h1 className="font-display text-3xl font-bold text-white mb-2">Painel Admin</h1>
            <p className="text-gold-400">Gestão de Reservas</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="card-luxury p-8 space-y-6">
            <div>
              <label htmlFor="username" className="label-field flex items-center gap-2">
                <User className="w-5 h-5 text-gold-500" aria-hidden="true" />
                Utilizador
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="ex: king, ricardo, miguel"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label-field flex items-center gap-2">
                <Lock className="w-5 h-5 text-gold-500" aria-hidden="true" />
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Digite a senha"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-noir-400 hover:text-gold-500 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2" role="alert">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 text-lg">
              <UserCheck className="w-5 h-5 mr-2" />
              Entrar no Painel
            </button>

            <div className="text-center pt-4 border-t border-noir-800 space-y-3">
              <p className="text-noir-400 text-sm">
                Credenciais de teste:
              </p>
              <div className="text-left space-y-1 text-xs font-mono bg-noir-800 p-3 rounded-lg">
                <div className="flex justify-between text-gold-400">
                  <span><strong>Admin:</strong> admin / kings2020</span>
                  <Shield className="w-3.5 h-3.5 text-gold-500" />
                </div>
                <div className="flex justify-between text-gold-400">
                  <span><strong>King:</strong> king / king2020</span>
                  <Crown className="w-3.5 h-3.5 text-gold-500" />
                </div>
                <div className="flex justify-between text-gold-400">
                  <span><strong>Ricardo:</strong> ricardo / ricardo2020</span>
                </div>
                <div className="flex justify-between text-gold-400">
                  <span><strong>Miguel:</strong> miguel / miguel2020</span>
                </div>
              </div>
              <Link href="/" className="text-gold-400 hover:text-gold-300 text-sm flex items-center justify-center gap-1 mt-2">
                <Sparkles className="w-4 h-4" />
                Voltar ao site
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Determine which barbers to show in filter based on role
  const availableBarbers = currentUser?.role === 'admin' ? BARBERS : (currentUser ? [currentUser.name] : [])

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
              {currentUser?.role === 'barber' && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {currentUser.name}
                </span>
              )}
              {currentUser?.role === 'admin' && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={exportCSV}
                className="btn-secondary gap-2 text-sm hidden sm:flex"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              <button
                onClick={handleLogout}
                className="btn-tertiary gap-2 text-sm"
              >
                <Unlock className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="container-custom py-4 border-t border-noir-800">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input-field pl-10 w-44"
                />
              </div>

              {/* Barber Filter - only for admin */}
              {currentUser?.role === 'admin' && (
                <select
                  value={filterBarber}
                  onChange={(e) => setFilterBarber(e.target.value)}
                  className="input-field w-40"
                >
                  <option value="all">Todos Barbeiros</option>
                  {BARBERS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              )}

              {/* Status Filter */}
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

            {/* Stats Summary */}
            <div className="hidden sm:flex items-center gap-6 text-sm text-noir-500">
              <span>Hoje: <strong className="text-noir-950 dark:text-white">{stats.today}</strong></span>
              <span>Semana: <strong className="text-noir-950 dark:text-white">{stats.week}</strong></span>
              <span className="text-amber-600">Pendentes: <strong>{stats.pending}</strong></span>
              <span className="text-emerald-600">Concluídos: <strong>{stats.completed}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
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
                    ...(currentUser?.role === 'admin' ? [{ key: 'barber', label: 'Barbeiro' }] : []),
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
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={currentUser?.role === 'admin' ? 8 : 7} className="px-4 py-12 text-center">
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
                      {currentUser?.role === 'admin' && (
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
                          {(currentUser?.role === 'admin') && (
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

          {/* Pagination / Info */}
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
                {currentUser?.role === 'admin' && (
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
                {(currentUser?.role === 'admin') && (
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
      </main>
    </div>
  )
}