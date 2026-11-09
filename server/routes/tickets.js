const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Middleware to protect routes (MOVED TO THE TOP)
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get ticket summary counts (NOW AUTH IS DEFINED ABOVE IT)
router.get('/summary', auth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS openTickets,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTickets,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolvedTickets
            FROM tickets
        `);
        
        const summary = {
            total: rows[0].total || 0,
            open: Number(rows[0].openTickets) || 0,
            inProgress: Number(rows[0].inProgressTickets) || 0,
            resolved: Number(rows[0].resolvedTickets) || 0
        };

        res.json(summary);
    } catch (error) {
        console.error("Summary Error:", error);
        res.status(500).json({ message: 'Server error fetching summary' });
    }
});

// Get all tickets
router.get('/', auth, async (req, res) => {
  try {
    const [tickets] = await db.query(`
      SELECT t.*, u.name as creator_name 
      FROM tickets t 
      LEFT JOIN users u ON t.created_by = u.id 
      ORDER BY t.created_at DESC
    `);
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new ticket
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const [result] = await db.query(
      'INSERT INTO tickets (title, description, priority, category, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, priority || 'Medium', category || 'General', req.user.id]
    );

    res.status(201).json({ message: 'Ticket created', ticketId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;