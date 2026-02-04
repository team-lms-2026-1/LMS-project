-- Add audit columns to extra_curricular_competency_map
ALTER TABLE extra_curricular_competency_map ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE extra_curricular_competency_map ADD COLUMN created_by BIGINT;
ALTER TABLE extra_curricular_competency_map ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE extra_curricular_competency_map ADD COLUMN updated_by BIGINT;

-- Add foreign key constraints for audit columns
ALTER TABLE extra_curricular_competency_map 
    ADD CONSTRAINT fk_eccm_created_by FOREIGN KEY (created_by) REFERENCES account(account_id);
ALTER TABLE extra_curricular_competency_map 
    ADD CONSTRAINT fk_eccm_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id);

-- Change weight column type to INT for consistency with entity and curricular domain
ALTER TABLE extra_curricular_competency_map ALTER COLUMN weight TYPE INT USING weight::INT;

-- Add index on competency_id for performance (matching Entity @Table annotation)
CREATE INDEX idx_eccm_competency_id ON extra_curricular_competency_map(competency_id);
