// TASK 1.1 — User Model
// Buat file backend/models/User.js

// Kriteria yang harus dipenuhi:

//  Field: name (string, required), email (string, required, unique), password (string, required)
//  Field opsional: avatar (string, untuk URL foto profil)
//  Password otomatis di-hash sebelum disimpan ke database
//  Ada method untuk membandingkan password (saat login)
//  Ada timestamps (createdAt, updatedAt)
// Konsep yang perlu dipelajari dulu:
// Mongoose Schema & Model
// pre('save') hook
// bcryptjs

