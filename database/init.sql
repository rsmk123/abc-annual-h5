-- ====================
-- ABC银行集五福H5 - 数据库初始化脚本
-- ====================

-- 1. 用户表
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(11) NOT NULL,
  phone_hash VARCHAR(64) UNIQUE NOT NULL,
  phone_encrypted TEXT,

  -- 收集状态（JSONB核心）
  cards JSONB DEFAULT '{}',
  collected_count SMALLINT DEFAULT 0 CHECK (collected_count >= 0 AND collected_count <= 5),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  -- 统计
  draw_count INTEGER DEFAULT 0,
  last_draw_at TIMESTAMP,

  -- 防刷
  ip VARCHAR(45),
  device_id VARCHAR(64),
  user_agent TEXT,

  -- 元数据
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_phone_hash ON users(phone_hash);
CREATE INDEX idx_completed ON users(is_completed, completed_at) WHERE is_completed = true;
CREATE INDEX idx_ip ON users(ip);
CREATE INDEX idx_cards ON users USING GIN (cards);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.cards IS '收集状态JSON：{0: {collected: true, collectedAt: "2025-01-01"}}';

-- ====================
-- 2. 抽卡日志表
-- ====================
CREATE TABLE draw_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  card_index SMALLINT CHECK (card_index >= 0 AND card_index <= 4),
  card_text VARCHAR(10),
  is_new BOOLEAN,
  ip VARCHAR(45),
  user_agent TEXT,
  draw_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_draw ON draw_logs(user_id, draw_at DESC);
CREATE INDEX idx_draw_time ON draw_logs(draw_at DESC);

COMMENT ON TABLE draw_logs IS '抽卡日志表';

-- ====================
-- 3. 短信日志表
-- ====================
CREATE TABLE sms_logs (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(11) NOT NULL,
  code VARCHAR(6),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  ip VARCHAR(45)
);

CREATE INDEX idx_phone_sent ON sms_logs(phone, sent_at DESC);
CREATE INDEX idx_expires ON sms_logs(expires_at);

COMMENT ON TABLE sms_logs IS '短信验证码日志表';

-- ====================
-- 4. 触发器（自动更新updated_at）
-- ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ====================
-- 5. 插入测试数据（可选）
-- ====================
INSERT INTO users (phone, phone_hash, phone_encrypted, cards) VALUES
('13800138000',
 encode(sha256('13800138000'::bytea), 'hex'),
 '13800138000',
 '{"0": {"collected": true, "collectedAt": "2025-01-01T10:00:00Z"}}'::jsonb
);

-- ====================
-- 验证表创建成功
-- ====================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- 应该看到：draw_logs, sms_logs, users
