INSERT INTO account (login_id, password_hash, account_type, status, created_at, updated_at)
VALUES ('a20001122', '$2a$10$eD8KuAUmLj7dHUsWqKGGBeliZrp6TKE0KC5agMEV.whhqjSQpCOfC', 'ADMIN', 'ACTIVE', now(), now())
ON CONFLICT (login_id) DO NOTHING;

INSERT INTO admin_profile (account_id, name, email, phone, memo, created_at, updated_at)
SELECT a.account_id, '관리자', 'admin@example.com', NULL, 'seed admin (a20001122)', now(), now()
FROM account a
WHERE a.login_id = 'a20001122'
ON CONFLICT (account_id) DO NOTHING;
