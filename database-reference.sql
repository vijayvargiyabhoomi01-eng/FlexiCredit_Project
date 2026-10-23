
CREATE DATABASE IF NOT EXISTS personal_finance;
USE personal_finance;

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(60) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    notes VARCHAR(255) DEFAULT '',
    CONSTRAINT chk_transaction_type CHECK (type IN ('INCOME', 'EXPENSE')),
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);
