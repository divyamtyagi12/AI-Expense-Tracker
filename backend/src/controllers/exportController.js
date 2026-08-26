// backend/src/controllers/exportController.js
// Streams a CSV of the authenticated user's expenses.
// Applies the same filters as GET /api/expenses.

const { pool } = require('../config/db');

// Escape a CSV field: wrap in quotes, escape internal quotes.
function csvField(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function csvRow(fields) {
  return fields.map(csvField).join(',');
}

// GET /api/export/expenses.csv?month=&year=&category=
async function exportExpensesCsv(req, res, next) {
  try {
    const { month, year, category } = req.query;
    const userId = req.userId;

    // Build query dynamically (same logic as expenseModel.findAllForUser)
    let sql = `
      SELECT e.expense_date, c.name AS category_name, e.note, e.amount
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      WHERE e.user_id = $1
    `;
    const params = [userId];

    if (month && year) {
      params.push(Number(month), Number(year));
      sql += ` AND EXTRACT(MONTH FROM e.expense_date) = $${params.length - 1} AND EXTRACT(YEAR FROM e.expense_date) = $${params.length}`;
    } else if (year) {
      params.push(Number(year));
      sql += ` AND EXTRACT(YEAR FROM e.expense_date) = $${params.length}`;
    }

    if (category) {
      params.push(Number(category));
      sql += ` AND e.category_id = $${params.length}`;
    }

    sql += ' ORDER BY e.expense_date DESC, e.id DESC';

    const { rows } = await pool.query(sql, params);

    // Build a descriptive filename
    let suffix = 'all';
    if (month && year) suffix = `${year}-${String(month).padStart(2, '0')}`;
    else if (year) suffix = String(year);

    const filename = `expenses-${suffix}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Header row
    res.write(csvRow(['Date', 'Category', 'Note', 'Amount (INR)']) + '\n');

    for (const row of rows) {
      const dateStr =
        row.expense_date instanceof Date
          ? row.expense_date.toISOString().slice(0, 10)
          : String(row.expense_date).slice(0, 10);

      res.write(
        csvRow([dateStr, row.category_name, row.note || '', row.amount]) + '\n'
      );
    }

    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { exportExpensesCsv };
