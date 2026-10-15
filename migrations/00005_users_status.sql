-- +goose Up
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'closed');

ALTER TABLE users ADD COLUMN status user_status NOT NULL DEFAULT 'active';

-- +goose Down
ALTER TABLE users DROP COLUMN status;

DROP TYPE user_status;
