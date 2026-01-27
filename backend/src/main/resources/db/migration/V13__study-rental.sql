-- =======================================================
-- 1. Study Space (스터디 공간)
-- =======================================================
CREATE TABLE study_space (
    space_id BIGSERIAL PRIMARY KEY,
    space_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit Info
    created_by BIGINT NOT NULL,
    updated_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys (Audit)
    CONSTRAINT fk_study_space_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_study_space_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id)
);

CREATE INDEX idx_study_space_active ON study_space(is_active);


-- =======================================================
-- 2. Study Room (스터디 룸)
-- =======================================================
CREATE TABLE study_room (
    room_id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL,
    
    room_name VARCHAR(255) NOT NULL,
    
    min_people INT NOT NULL DEFAULT 1,
    max_people INT NOT NULL,
    description TEXT,
    
    operation_start_date DATE NOT NULL,
    operation_end_date DATE NOT NULL,
    
    rentable_start_time TIME NOT NULL,
    rentable_end_time TIME NOT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit Info
    created_by BIGINT NOT NULL,
    updated_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_study_room_space FOREIGN KEY (space_id) REFERENCES study_space(space_id),
    CONSTRAINT fk_study_room_created_by FOREIGN KEY (created_by) REFERENCES account(account_id),
    CONSTRAINT fk_study_room_updated_by FOREIGN KEY (updated_by) REFERENCES account(account_id),
    
    -- Logic Constraints
    CONSTRAINT chk_people_limit CHECK (min_people <= max_people),
    CONSTRAINT chk_rentable_time CHECK (rentable_start_time < rentable_end_time)
);

-- Indexes
CREATE UNIQUE INDEX idx_study_room_unique_name ON study_room(space_id, room_name);
CREATE INDEX idx_study_room_space_active ON study_room(space_id, is_active);
CREATE INDEX idx_study_room_operation_dates ON study_room(operation_start_date, operation_end_date);


-- =======================================================
-- 3. Study Space Image (스터디 공간 이미지)
-- =======================================================
CREATE TABLE study_space_image (
    image_id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL,
    
    image_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    
    -- Foreign Key
    CONSTRAINT fk_space_image_space FOREIGN KEY (space_id) REFERENCES study_space(space_id)
);

CREATE INDEX idx_space_image_order ON study_space_image(space_id, sort_order);


-- =======================================================
-- 4. Study Room Rental (대여/예약)
-- =======================================================
CREATE TABLE study_room_rental (
    rental_id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    applicant_account_id BIGINT NOT NULL,
    
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    
    status VARCHAR(50) NOT NULL, -- 'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELED'
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    processed_by BIGINT,
    processed_at TIMESTAMP,
    rejection_reason VARCHAR(255),
    
    -- Foreign Keys
    CONSTRAINT fk_rental_room FOREIGN KEY (room_id) REFERENCES study_room(room_id),
    CONSTRAINT fk_rental_applicant FOREIGN KEY (applicant_account_id) REFERENCES account(account_id),
    CONSTRAINT fk_rental_processor FOREIGN KEY (processed_by) REFERENCES account(account_id)
);

-- Comments
COMMENT ON COLUMN study_room_rental.status IS 'REQUESTED | APPROVED | REJECTED | CANCELED';
COMMENT ON TABLE study_room_rental IS 'Prevent time overlap only for APPROVED rentals';

-- Indexes
CREATE INDEX idx_rental_room_start ON study_room_rental(room_id, start_at);
CREATE INDEX idx_rental_applicant_applied ON study_room_rental(applicant_account_id, applied_at);
CREATE INDEX idx_rental_status_applied ON study_room_rental(status, applied_at);


-- =======================================================
-- 5. Study Space Rule (이용 규칙)
-- =======================================================
CREATE TABLE study_space_rule (
    rule_id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL,
    
    content TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    
    -- Audit Info
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_space_rule_space FOREIGN KEY (space_id) REFERENCES study_space(space_id),
    CONSTRAINT fk_space_rule_created_by FOREIGN KEY (created_by) REFERENCES account(account_id)
);

CREATE INDEX idx_space_rule_order ON study_space_rule(space_id, sort_order);