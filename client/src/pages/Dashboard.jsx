import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General'
  })
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/tickets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFormData({ title: '', description: '', priority: 'Medium', category: 'General' })
      setShowForm(false)
      setMessage('Ticket created successfully!')
      setTimeout(() => setMessage(''), 3000)
      fetchTickets()
    } catch (error) {
      console.error(error)
      setMessage('Failed to create ticket')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/tickets/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTickets()
    } catch (error) {
      console.error(error)
    }
  }

  // Statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  }

  // Filtered tickets
  const filteredTickets = filter === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filter)

  const statusColor = {
    'Open': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Resolved': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Closed': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  const priorityColor = {
    'Low': 'text-slate-400',
    'Medium': 'text-blue-400',
    'High': 'text-orange-400',
    'Critical': 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">SupportDesk Pro</h1>
            <p className="text-sm text-slate-400">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Success / Error Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm">
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">Open</p>
            <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-400 mb-1">Closed</p>
            <p className="text-2xl font-bold text-slate-400">{stats.closed}</p>
          </div>
        </div>

        {/* Actions + Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  filter === status
                    ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition"
          >
            {showForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <form onSubmit={handleCreateTicket} className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 space-y-4">
            <h3 className="font-semibold text-lg mb-2">Create New Ticket</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Brief summary of the issue"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="3"
                placeholder="Describe the problem in detail..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Hardware, Software, Network"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Create Ticket
            </button>
          </form>
        )}

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
            <p className="text-slate-400 text-lg">No tickets found</p>
            <p className="text-slate-500 text-sm mt-2">
              {filter === 'All' ? 'Create your first ticket to get started' : `No tickets with status "${filter}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <p className="text-sm text-slate-500">
                      #{ticket.id} • Created by {ticket.creator_name} • {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${statusColor[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{ticket.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`font-medium ${priorityColor[ticket.priority]}`}>
                    {ticket.priority} Priority
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{ticket.category}</span>

                  <div className="ml-auto flex flex-wrap gap-2">
                    {ticket.status === 'Open' && (
                      <button
                        onClick={() => updateStatus(ticket.id, 'In Progress')}
                        className="text-xs border border-slate-700 hover:border-yellow-500 hover:text-yellow-400 px-3 py-1.5 rounded-lg transition"
                      >
                        Start Working
                      </button>
                    )}
                    {(ticket.status === 'Open' || ticket.status === 'In Progress') && (
                      <button
                        onClick={() => updateStatus(ticket.id, 'Resolved')}
                        className="text-xs border border-slate-700 hover:border-green-500 hover:text-green-400 px-3 py-1.5 rounded-lg transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {ticket.status === 'Resolved' && (
                      <button
                        onClick={() => updateStatus(ticket.id, 'Closed')}
                        className="text-xs border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard