const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('medications.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            expiry_date TEXT NOT NULL,
            manufacturer TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Routes
app.get('/api/medications', (req, res) => {
    db.all('SELECT * FROM medications ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/medications', (req, res) => {
    const { name, dosage, quantity, expiry_date, manufacturer, notes } = req.body;
    
    if (!name || !dosage || !quantity || !expiry_date) {
        res.status(400).json({ error: 'Campos obrigatórios faltando' });
        return;
    }

    const sql = `
        INSERT INTO medications (name, dosage, quantity, expiry_date, manufacturer, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, dosage, quantity, expiry_date, manufacturer, notes], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            message: 'Medicamento adicionado com sucesso'
        });
    });
});

app.delete('/api/medications/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM medications WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Medicamento removido com sucesso' });
    });
});

app.get('/api/medications/stats', (req, res) => {
    const stats = {
        total: 0,
        lowStock: 0,
        expiring: 0
    };

    // Get total count
    db.get('SELECT COUNT(*) as total FROM medications', [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        stats.total = row.total;

        // Get low stock count (less than 5)
        db.get('SELECT COUNT(*) as lowStock FROM medications WHERE quantity < 5', [], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            stats.lowStock = row.lowStock;

            // Get expiring soon count (next 30 days)
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            
            db.get(
                'SELECT COUNT(*) as expiring FROM medications WHERE date(expiry_date) <= date(?)',
                [thirtyDaysFromNow.toISOString()],
                (err, row) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    stats.expiring = row.expiring;
                    res.json(stats);
                }
            );
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 