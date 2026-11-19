CREATE DATABASE IF NOT EXISTS bloodbank_db;
USE bloodbank_db;

CREATE TABLE IF NOT EXISTS donor (
  donor_id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  date_of_birth DATE,
  blood_group VARCHAR(10) NOT NULL,
  phone_number VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  last_donation_date DATE,
  eligibility_status VARCHAR(20) DEFAULT 'Eligible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bloodbank (
  bank_id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital (
  hospital_id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipient (
  recipient_id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation (
  donation_id CHAR(36) PRIMARY KEY,
  donor_id CHAR(36) NOT NULL,
  bank_id CHAR(36) NOT NULL,
  donation_date DATETIME NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  units_collected DECIMAL(5,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Collected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES donor(donor_id) ON DELETE CASCADE,
  CONSTRAINT fk_donation_bank FOREIGN KEY (bank_id) REFERENCES bloodbank(bank_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donation_screening (
  screening_id CHAR(36) PRIMARY KEY,
  donation_id CHAR(36) UNIQUE NOT NULL,
  screening_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hemoglobin_level DECIMAL(4,2),
  blood_pressure VARCHAR(20),
  pulse_rate INT,
  rr_rate VARCHAR(20),
  temperature DECIMAL(4,2),
  weight_kg DECIMAL(5,2),
  eligibility_status VARCHAR(20),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_screening_donation FOREIGN KEY (donation_id) REFERENCES donation(donation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_test (
  test_id CHAR(36) PRIMARY KEY,
  donation_id CHAR(36) NOT NULL,
  test_type VARCHAR(100) NOT NULL,
  result VARCHAR(255),
  units VARCHAR(20),
  test_date DATE,
  performed_by VARCHAR(255),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_test_donation FOREIGN KEY (donation_id) REFERENCES donation(donation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_inventory (
  inventory_id CHAR(36) PRIMARY KEY,
  bank_id CHAR(36) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  units_available DECIMAL(5,2) DEFAULT 0,
  expiry_date DATE,
  storage_temp DECIMAL(4,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_bank FOREIGN KEY (bank_id) REFERENCES bloodbank(bank_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request (
  request_id CHAR(36) PRIMARY KEY,
  recipient_id CHAR(36) NOT NULL,
  bank_id CHAR(36) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  units_required DECIMAL(5,2) NOT NULL,
  request_date DATETIME NOT NULL,
  priority VARCHAR(20) DEFAULT 'Normal',
  status VARCHAR(20) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_recipient FOREIGN KEY (recipient_id) REFERENCES recipient(recipient_id) ON DELETE CASCADE,
  CONSTRAINT fk_request_bank FOREIGN KEY (bank_id) REFERENCES bloodbank(bank_id) ON DELETE CASCADE
);
