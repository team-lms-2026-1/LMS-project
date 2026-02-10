-- Password reset token table
CREATE TABLE password_reset_token (
    token_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_ip VARCHAR(64) NULL
);

ALTER TABLE password_reset_token
    ADD CONSTRAINT fk_password_reset_token_account
    FOREIGN KEY (account_id) REFERENCES account (account_id);

CREATE UNIQUE INDEX uq_password_reset_token_hash ON password_reset_token (token_hash);
CREATE INDEX idx_password_reset_token_account ON password_reset_token (account_id);
CREATE INDEX idx_password_reset_token_expires ON password_reset_token (expires_at);
CREATE INDEX idx_password_reset_token_used ON password_reset_token (used_at);
