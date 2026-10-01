package server

import (
	"errors"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate = newValidator()

func newValidator() *validator.Validate {
	v := validator.New(validator.WithRequiredStructEnabled())

	v.RegisterTagNameFunc(func(f reflect.StructField) string {
		name, _, _ := strings.Cut(f.Tag.Get("json"), ",")
		if name == "-" {
			return ""
		}
		return name
	})

	return v
}

func validationErrors(err error) map[string]string {
	errs := map[string]string{}

	var ve validator.ValidationErrors
	if !errors.As(err, &ve) {
		return errs
	}

	for _, fe := range ve {
		switch fe.Tag() {
		case "required":
			errs[fe.Field()] = "is required"
		case "email":
			errs[fe.Field()] = "must be a valid email address"
		case "min":
			errs[fe.Field()] = "must be at least " + fe.Param() + " characters"
		case "max":
			errs[fe.Field()] = "must be at most " + fe.Param() + " characters"
		default:
			errs[fe.Field()] = "is invalid"
		}
	}

	return errs
}
