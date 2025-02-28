-- 1) Create customer_details table (unchanged)
CREATE TABLE customer_details (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_number VARCHAR(15) UNIQUE NOT NULL,
    last_pickup_location VARCHAR(255),
    last_drop_location VARCHAR(255),
    number_of_rides INT DEFAULT 0,
    total_spendings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Create driver_details table with driver_id as VARCHAR(11)
CREATE TABLE driver_details (
    driver_id VARCHAR(11) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_number VARCHAR(15) UNIQUE NOT NULL,
    vehicle_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_rides INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Create ride_details table with driver_id as VARCHAR(11)
CREATE TABLE ride_details (
    ride_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_number VARCHAR(15) NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    drop_location VARCHAR(255) NOT NULL,
    ride_vehicle_type VARCHAR(50) NOT NULL,
    num_passengers INT,
    journey_on DATE,
    pickup_time TIME,
    return_date DATE,
    return_time TIME,
    journey_type VARCHAR(10),
    estimated_km VARCHAR(20),
    estimated_price DECIMAL(10,2),
    driver_id VARCHAR(11) DEFAULT NULL,
    driver_name VARCHAR(100) DEFAULT NULL,
    driver_number VARCHAR(15) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_number) REFERENCES customer_details(customer_number),
    FOREIGN KEY (driver_id) REFERENCES driver_details(driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
