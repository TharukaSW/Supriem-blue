-- Drop old production_lines table
DROP TABLE IF EXISTS production_lines CASCADE;

-- Drop existing production_days table
DROP TABLE IF EXISTS production_days CASCADE;

-- Add new movement type
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'PRODUCTION_ADJUSTMENT';

-- Recreate production_days table with new structure
CREATE TABLE production_days (
    production_day_id BIGSERIAL PRIMARY KEY,
    production_date DATE NOT NULL,
    finished_product_id BIGINT NOT NULL REFERENCES items(item_id),
    quantity DECIMAL(12,3) NOT NULL,
    scrap_quantity DECIMAL(12,3) DEFAULT 0,
    notes TEXT,
    is_closed BOOLEAN DEFAULT FALSE,
    closed_at TIMESTAMP,
    closed_by BIGINT REFERENCES users(user_id),
    reopen_reason TEXT,
    reopened_by BIGINT REFERENCES users(user_id),
    reopened_at TIMESTAMP,
    created_by BIGINT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(production_date, finished_product_id)
);

-- Create indexes
CREATE INDEX idx_production_date ON production_days(production_date);
CREATE INDEX idx_finished_product ON production_days(finished_product_id);
CREATE INDEX idx_production_closed ON production_days(is_closed);
