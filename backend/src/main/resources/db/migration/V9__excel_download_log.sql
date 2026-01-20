-- =====================================================
-- V3__excel_download_log.sql
-- Excel Download Log (Log domain only, minimal)
-- =====================================================

CREATE TABLE excel_download_log (
  download_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- 누가 다운로드했는지
  actor_account_id BIGINT NOT NULL,

  -- 어떤 로그를 다운로드했는지 (구분용)
  resource_code VARCHAR(50) NOT NULL,  -- ACCESS_LOG | LOGIN_LOG | PRIVACY_LOG ...

  -- 다운로드 사유 (프론트 단일 입력)
  reason TEXT NOT NULL,

  -- 다운로드 조건 (누구 / 언제부터~언제까지 등)
  filter_json TEXT NOT NULL,

  -- 다운로드 시점
  downloaded_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_excel_download_actor
    FOREIGN KEY (actor_account_id) REFERENCES account(account_id)
);

CREATE INDEX idx_excel_download_actor_time
  ON excel_download_log (actor_account_id, downloaded_at DESC);

CREATE INDEX idx_excel_download_time
  ON excel_download_log (downloaded_at DESC);

CREATE INDEX idx_excel_download_resource
  ON excel_download_log (resource_code);
