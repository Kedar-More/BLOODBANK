USE bloodbank_db;

INSERT INTO bloodbank (
  bank_id, name, phone, email, address_line1, city, state, postal_code, country
) VALUES
  (UUID(), 'City Blood Bank', '9876500001', 'citybank@example.com', 'MG Road', 'Bengaluru', 'Karnataka', '560001', 'India'),
  (UUID(), 'LifeCare Blood Center', '9876500002', 'lifecare@example.com', 'Anna Salai', 'Chennai', 'Tamil Nadu', '600002', 'India');

INSERT INTO donor (
  donor_id, full_name, gender, date_of_birth, blood_group, phone_number, email, address, eligibility_status
) VALUES
  (UUID(), 'Rahul Sharma', 'Male', '1996-04-12', 'A+', '9000000001', 'rahul@example.com', 'Bengaluru', 'Eligible'),
  (UUID(), 'Priya Nair', 'Female', '1998-09-21', 'O+', '9000000002', 'priya@example.com', 'Chennai', 'Eligible'),
  (UUID(), 'Aman Verma', 'Male', '1995-01-10', 'B-', '9000000003', 'aman@example.com', 'Bengaluru', 'Eligible');

INSERT INTO recipient (
  recipient_id, full_name, gender, date_of_birth, blood_group, phone_number, email, address
) VALUES
  (UUID(), 'Suresh Iyer', 'Male', '1988-06-15', 'A+', '9111111111', 'suresh@example.com', 'Chennai'),
  (UUID(), 'Neha Gupta', 'Female', '1992-02-17', 'O+', '9222222222', 'neha@example.com', 'Bengaluru');

INSERT INTO hospital (
  hospital_id, name, phone, email, address_line1, city, state, postal_code, country
) VALUES
  (UUID(), 'Apollo Hospital', '9800000001', 'apollo@example.com', 'Greams Road', 'Chennai', 'Tamil Nadu', '600006', 'India'),
  (UUID(), 'Fortis Hospital', '9800000002', 'fortis@example.com', 'Bannerghatta Road', 'Bengaluru', 'Karnataka', '560076', 'India');

SET @bank1 := (SELECT bank_id FROM bloodbank WHERE name = 'City Blood Bank' LIMIT 1);
SET @bank2 := (SELECT bank_id FROM bloodbank WHERE name = 'LifeCare Blood Center' LIMIT 1);

SET @donor1 := (SELECT donor_id FROM donor WHERE full_name = 'Rahul Sharma' LIMIT 1);
SET @donor2 := (SELECT donor_id FROM donor WHERE full_name = 'Priya Nair' LIMIT 1);

SET @recipient1 := (SELECT recipient_id FROM recipient WHERE full_name = 'Suresh Iyer' LIMIT 1);
SET @recipient2 := (SELECT recipient_id FROM recipient WHERE full_name = 'Neha Gupta' LIMIT 1);

INSERT INTO donation (
  donation_id, donor_id, bank_id, donation_date, blood_group, units_collected, status
) VALUES
  (UUID(), @donor1, @bank1, NOW(), 'A+', 1.0, 'Collected'),
  (UUID(), @donor2, @bank2, NOW(), 'O+', 1.5, 'Collected');

INSERT INTO blood_inventory (
  inventory_id, bank_id, blood_group, units_available, expiry_date, storage_temp
) VALUES
  (UUID(), @bank1, 'A+', 5.0, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 4.0),
  (UUID(), @bank2, 'O+', 7.5, DATE_ADD(CURDATE(), INTERVAL 28 DAY), 4.0),
  (UUID(), @bank1, 'B-', 2.0, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 4.0);

INSERT INTO request (
  request_id, recipient_id, bank_id, blood_group, units_required, request_date, priority, status, notes
) VALUES
  (UUID(), @recipient1, @bank1, 'A+', 1.0, NOW(), 'High', 'Pending', 'Urgent surgery case'),
  (UUID(), @recipient2, @bank2, 'O+', 2.0, NOW(), 'Normal', 'Pending', 'Scheduled treatment');
