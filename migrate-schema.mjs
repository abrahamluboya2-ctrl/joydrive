import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log('Updating users table...');
  
  // Add new columns to users table if they don't exist
  await connection.execute(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS photoUrl TEXT,
    ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ratingCount INT DEFAULT 0,
    MODIFY COLUMN role ENUM('user', 'admin', 'driver') DEFAULT 'user' NOT NULL
  `);

  console.log('Creating drivers table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      licenseNumber VARCHAR(50) NOT NULL,
      licenseExpiry TIMESTAMP NOT NULL,
      bankAccount VARCHAR(100) NOT NULL,
      isVerified INT DEFAULT 0 NOT NULL,
      status ENUM('offline', 'online', 'on_ride', 'break') DEFAULT 'offline' NOT NULL,
      currentLocation JSON,
      totalRides INT DEFAULT 0,
      totalEarnings DECIMAL(12,2) DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT 0,
      ratingCount INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX driver_userId_idx (userId)
    )
  `);

  console.log('Creating vehicles table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      driverId INT NOT NULL,
      type ENUM('Lite', 'Drive', 'VIP') NOT NULL,
      licensePlate VARCHAR(20) NOT NULL,
      color VARCHAR(50),
      capacity INT DEFAULT 4,
      make VARCHAR(100),
      model VARCHAR(100),
      year INT,
      photoUrl TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX vehicle_driverId_idx (driverId)
    )
  `);

  console.log('Creating rides table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS rides (
      id INT AUTO_INCREMENT PRIMARY KEY,
      passengerId INT NOT NULL,
      driverId INT,
      vehicleId INT,
      vehicleType ENUM('Lite', 'Drive', 'VIP') NOT NULL,
      pickupLocation JSON NOT NULL,
      dropoffLocation JSON NOT NULL,
      stops JSON,
      estimatedDistance DECIMAL(8,2),
      estimatedDuration INT,
      baseFare DECIMAL(8,2) NOT NULL,
      distanceFare DECIMAL(8,2) DEFAULT 0,
      timeFare DECIMAL(8,2) DEFAULT 0,
      totalFare DECIMAL(8,2) NOT NULL,
      status ENUM('requested', 'accepted', 'driver_arriving', 'in_progress', 'completed', 'cancelled') DEFAULT 'requested' NOT NULL,
      paymentMethod ENUM('card', 'cash') DEFAULT 'card' NOT NULL,
      paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' NOT NULL,
      requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      acceptedAt TIMESTAMP,
      startedAt TIMESTAMP,
      completedAt TIMESTAMP,
      cancelledAt TIMESTAMP,
      cancellationReason TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX ride_passengerId_idx (passengerId),
      INDEX ride_driverId_idx (driverId),
      INDEX ride_status_idx (status),
      INDEX ride_vehicleType_idx (vehicleType)
    )
  `);

  console.log('Creating payments table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rideId INT NOT NULL,
      passengerId INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      method ENUM('card', 'cash') DEFAULT 'card' NOT NULL,
      status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' NOT NULL,
      stripePaymentId VARCHAR(100),
      stripeIntentId VARCHAR(100),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX payment_rideId_idx (rideId),
      INDEX payment_passengerId_idx (passengerId)
    )
  `);

  console.log('Creating notifications table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      rideId INT,
      isRead INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      INDEX notification_userId_idx (userId)
    )
  `);

  console.log('Creating ratings table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fromUserId INT NOT NULL,
      toUserId INT NOT NULL,
      rideId INT NOT NULL,
      score INT NOT NULL,
      comment TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      INDEX rating_fromUserId_idx (fromUserId),
      INDEX rating_toUserId_idx (toUserId),
      INDEX rating_rideId_idx (rideId)
    )
  `);

  console.log('Creating files table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      type ENUM('profile_photo', 'document', 'vehicle_photo') NOT NULL,
      fileKey VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      mimeType VARCHAR(50),
      size INT,
      uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      INDEX file_userId_idx (userId)
    )
  `);

  console.log('Creating voiceMessages table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS voiceMessages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rideId INT NOT NULL,
      fromUserId INT NOT NULL,
      toUserId INT NOT NULL,
      audioUrl TEXT NOT NULL,
      transcription TEXT,
      duration INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      INDEX voiceMessage_rideId_idx (rideId)
    )
  `);

  console.log('Creating rideHistory table...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS rideHistory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rideId INT NOT NULL,
      passengerId INT NOT NULL,
      driverId INT NOT NULL,
      fromLocation VARCHAR(255) NOT NULL,
      toLocation VARCHAR(255) NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      rideType ENUM('Lite', 'Drive', 'VIP') NOT NULL,
      distance DECIMAL(8,2),
      duration INT,
      completedAt TIMESTAMP NOT NULL,
      INDEX rideHistory_passengerId_idx (passengerId),
      INDEX rideHistory_driverId_idx (driverId)
    )
  `);

  console.log('✅ Database schema updated successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error updating database schema:', error.message);
  process.exit(1);
} finally {
  await connection.end();
}
