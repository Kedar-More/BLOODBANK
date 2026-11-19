const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function normalizeValue(value) {
  if (value === "") return null;
  return value;
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", message: "API and database are connected." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/dashboard", async (_req, res) => {
  try {
    const [[donors]] = await pool.query("SELECT COUNT(*) AS totalDonors FROM donor");
    const [[banks]] = await pool.query("SELECT COUNT(*) AS totalBanks FROM bloodbank");
    const [[hospitals]] = await pool.query("SELECT COUNT(*) AS totalHospitals FROM hospital");
    const [[requests]] = await pool.query(
      "SELECT COUNT(*) AS pendingRequests FROM request WHERE status = 'Pending'"
    );
    const [inventory] = await pool.query(
      "SELECT blood_group, SUM(units_available) AS units_available FROM blood_inventory GROUP BY blood_group ORDER BY blood_group"
    );

    res.json({
      donors: donors.totalDonors,
      bloodBanks: banks.totalBanks,
      hospitals: hospitals.totalHospitals,
      pendingRequests: requests.pendingRequests,
      inventoryByGroup: bloodGroups.map((group) => {
        const row = inventory.find((item) => item.blood_group === group);
        return { blood_group: group, units_available: Number(row?.units_available || 0) };
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function registerCrudRoutes(resource) {
  const {
    route,
    table,
    idField,
    selectColumns = "*",
    writableColumns,
    requiredColumns = [],
    orderBy = `${idField} DESC`,
    customCreate,
  } = resource;

  app.get(`/api/${route}`, async (_req, res) => {
    try {
      const [rows] = await pool.query(`SELECT ${selectColumns} FROM ${table} ORDER BY ${orderBy}`);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get(`/api/${route}/:id`, async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT ${selectColumns} FROM ${table} WHERE ${idField} = ? LIMIT 1`,
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: `${table} record not found` });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(`/api/${route}`, async (req, res) => {
    try {
      const missingFields = requiredColumns.filter((column) => !req.body[column]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      if (customCreate) {
        return customCreate(req, res);
      }

      const payload = writableColumns.map((column) =>
        normalizeValue(req.body[column] ?? null)
      );
      const [result] = await pool.query(
        `INSERT INTO ${table} (${idField}, ${writableColumns.join(", ")}) VALUES (UUID(), ${writableColumns
          .map(() => "?")
          .join(", ")})`,
        payload
      );

      res.status(201).json({ message: `${table} record created`, affectedRows: result.affectedRows });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(`/api/${route}/:id`, async (req, res) => {
    try {
      const assignments = writableColumns.map((column) => `${column} = ?`).join(", ");
      const payload = writableColumns.map((column) =>
        normalizeValue(req.body[column] ?? null)
      );
      payload.push(req.params.id);

      const [result] = await pool.query(
        `UPDATE ${table} SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = ?`,
        payload
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `${table} record not found` });
      }
      res.json({ message: `${table} record updated` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`/api/${route}/:id`, async (req, res) => {
    try {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: `${table} record not found` });
      }
      res.json({ message: `${table} record deleted` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

registerCrudRoutes({
  route: "donors",
  table: "donor",
  idField: "donor_id",
  writableColumns: [
    "full_name",
    "gender",
    "date_of_birth",
    "blood_group",
    "phone_number",
    "email",
    "address",
    "last_donation_date",
    "eligibility_status",
  ],
  requiredColumns: ["full_name", "blood_group"],
  orderBy: "created_at DESC",
});

registerCrudRoutes({
  route: "bloodbanks",
  table: "bloodbank",
  idField: "bank_id",
  writableColumns: [
    "name",
    "phone",
    "email",
    "address_line1",
    "address_line2",
    "city",
    "state",
    "postal_code",
    "country",
  ],
  requiredColumns: ["name"],
  orderBy: "created_at DESC",
});

registerCrudRoutes({
  route: "hospitals",
  table: "hospital",
  idField: "hospital_id",
  writableColumns: [
    "name",
    "phone",
    "email",
    "address_line1",
    "address_line2",
    "city",
    "state",
    "postal_code",
    "country",
  ],
  requiredColumns: ["name"],
  orderBy: "created_at DESC",
});

registerCrudRoutes({
  route: "recipients",
  table: "recipient",
  idField: "recipient_id",
  writableColumns: [
    "full_name",
    "gender",
    "date_of_birth",
    "blood_group",
    "phone_number",
    "email",
    "address",
  ],
  requiredColumns: ["full_name"],
  orderBy: "created_at DESC",
});

registerCrudRoutes({
  route: "donations",
  table: "donation",
  idField: "donation_id",
  writableColumns: [
    "donor_id",
    "bank_id",
    "donation_date",
    "blood_group",
    "units_collected",
    "status",
  ],
  requiredColumns: ["donor_id", "bank_id", "donation_date", "blood_group", "units_collected"],
  orderBy: "donation_date DESC",
  customCreate: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const donationPayload = [
        req.body.donor_id,
        req.body.bank_id,
        req.body.donation_date,
        req.body.blood_group,
        req.body.units_collected,
        req.body.status ?? "Collected",
      ];

      const [insertDonationResult] = await connection.query(
        "INSERT INTO donation (donation_id, donor_id, bank_id, donation_date, blood_group, units_collected, status) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
        donationPayload
      );

      const [existingInventory] = await connection.query(
        "SELECT inventory_id FROM blood_inventory WHERE bank_id = ? AND blood_group = ? ORDER BY updated_at DESC LIMIT 1",
        [req.body.bank_id, req.body.blood_group]
      );

      if (existingInventory.length > 0) {
        await connection.query(
          "UPDATE blood_inventory SET units_available = units_available + ?, updated_at = CURRENT_TIMESTAMP WHERE inventory_id = ?",
          [req.body.units_collected, existingInventory[0].inventory_id]
        );
      } else {
        await connection.query(
          "INSERT INTO blood_inventory (inventory_id, bank_id, blood_group, units_available) VALUES (UUID(), ?, ?, ?)",
          [req.body.bank_id, req.body.blood_group, req.body.units_collected]
        );
      }

      await connection.commit();
      res.status(201).json({
        message: "donation created and inventory updated",
        affectedRows: insertDonationResult.affectedRows,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
});

registerCrudRoutes({
  route: "requests",
  table: "request",
  idField: "request_id",
  writableColumns: [
    "recipient_id",
    "bank_id",
    "blood_group",
    "units_required",
    "request_date",
    "priority",
    "status",
    "notes",
  ],
  requiredColumns: ["recipient_id", "bank_id", "blood_group", "units_required", "request_date"],
  orderBy: "request_date DESC",
});

registerCrudRoutes({
  route: "inventory",
  table: "blood_inventory",
  idField: "inventory_id",
  writableColumns: ["bank_id", "blood_group", "units_available", "expiry_date", "storage_temp"],
  requiredColumns: ["bank_id", "blood_group"],
  orderBy: "updated_at DESC",
});

registerCrudRoutes({
  route: "screenings",
  table: "donation_screening",
  idField: "screening_id",
  writableColumns: [
    "donation_id",
    "screening_date",
    "hemoglobin_level",
    "blood_pressure",
    "pulse_rate",
    "rr_rate",
    "temperature",
    "weight_kg",
    "eligibility_status",
    "remarks",
  ],
  requiredColumns: ["donation_id"],
  orderBy: "screening_date DESC",
});

registerCrudRoutes({
  route: "tests",
  table: "blood_test",
  idField: "test_id",
  writableColumns: [
    "donation_id",
    "test_type",
    "result",
    "units",
    "test_date",
    "performed_by",
    "remarks",
  ],
  requiredColumns: ["donation_id", "test_type"],
  orderBy: "test_date DESC",
});

app.listen(PORT, () => {
  console.log(`Blood Bank API running on port ${PORT}`);
});
