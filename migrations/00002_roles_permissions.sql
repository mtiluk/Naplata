-- +goose Up
CREATE TABLE roles (
    id         integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name       text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id          integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name        text NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id       integer NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    permission_id integer NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
    created_at    timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX role_permissions_permission_id_idx ON role_permissions (permission_id);

CREATE TABLE user_roles (
    user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id    integer NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX user_roles_role_id_idx ON user_roles (role_id);

-- +goose Down
DROP TABLE user_roles;
DROP TABLE role_permissions;
DROP TABLE permissions;
DROP TABLE roles;
