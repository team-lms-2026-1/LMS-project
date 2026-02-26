ALTER TABLE alarm
    ADD COLUMN title_key VARCHAR(200) NULL,
    ADD COLUMN message_key VARCHAR(200) NULL,
    ADD COLUMN message_args TEXT NULL;
