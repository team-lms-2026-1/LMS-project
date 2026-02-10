-- Enforce NOT NULL + UNIQUE on email per profile table (per-table uniqueness)
ALTER TABLE student_profile
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE professor_profile
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE admin_profile
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE student_profile
    ADD CONSTRAINT uq_student_profile_email UNIQUE (email);

ALTER TABLE professor_profile
    ADD CONSTRAINT uq_professor_profile_email UNIQUE (email);

ALTER TABLE admin_profile
    ADD CONSTRAINT uq_admin_profile_email UNIQUE (email);
