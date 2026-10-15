-- +goose Up
ALTER TABLE users ADD COLUMN company text;

-- +goose Down
ALTER TABLE users DROP COLUMN company;
