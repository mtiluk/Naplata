package database

import (
	"context"
	"fmt"

	"github.com/mtiluk/naplata/internal/permissions"
)

func (s *Store) SeedPermissions(ctx context.Context, perms []permissions.Permission) error {
	names := make([]string, len(perms))
	descriptions := make([]string, len(perms))
	for i, p := range perms {
		names[i] = p.Name
		descriptions[i] = p.Description
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin seed: %w", err)
	}
	defer tx.Rollback(ctx)

	// Only insert missing rows: INSERT ... ON CONFLICT draws an id even when it conflicts.
	if _, err := tx.Exec(ctx, `
		INSERT INTO permissions (name, description)
		SELECT t.name, t.description
		FROM unnest($1::text[], $2::text[]) AS t(name, description)
		WHERE NOT EXISTS (SELECT 1 FROM permissions p WHERE p.name = t.name)
		ON CONFLICT (name) DO NOTHING`,
		names, descriptions,
	); err != nil {
		return fmt.Errorf("seed permissions: %w", err)
	}

	if _, err := tx.Exec(ctx, `
		UPDATE permissions p
		SET description = t.description, updated_at = now()
		FROM unnest($1::text[], $2::text[]) AS t(name, description)
		WHERE p.name = t.name AND p.description IS DISTINCT FROM t.description`,
		names, descriptions,
	); err != nil {
		return fmt.Errorf("update permission descriptions: %w", err)
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO roles (name)
		SELECT 'admin'
		WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin')
		ON CONFLICT (name) DO NOTHING`,
	); err != nil {
		return fmt.Errorf("seed admin role: %w", err)
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id
		FROM roles r
		CROSS JOIN permissions p
		WHERE r.name = 'admin'
		ON CONFLICT DO NOTHING`,
	); err != nil {
		return fmt.Errorf("grant admin permissions: %w", err)
	}

	return tx.Commit(ctx)
}
