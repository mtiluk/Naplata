package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	NAPLATA_DATABASE_URL string
	NAPLATA_LISTEN_ADDR  string
}

func NewConfig() *Config {
	return &Config{
		NAPLATA_DATABASE_URL: os.Getenv("NAPLATA_DATABASE_URL"),
		NAPLATA_LISTEN_ADDR:  os.Getenv("NAPLATA_LISTEN_ADDR"),
	}
}

var ErrEnvEmpty = errors.New("Missing environment variables")

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	if os.Getenv("NAPLATA_DATABASE_URL") == "" || os.Getenv("NAPLATA_LISTEN_ADDR") == "" {
		return nil, ErrEnvEmpty
	}

	cfg := NewConfig()

	return cfg, nil
}
