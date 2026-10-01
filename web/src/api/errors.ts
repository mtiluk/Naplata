export type ServerError = {
  status: number;
  error?: string;
  errors?: Record<string, string>;
};

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Password",
  given_name: "Given name",
  family_name: "Family name",
};

type StatusMessages = Record<number, string | Record<string, string>>;

export function parseServerError(
  error: unknown,
  statusMessages: StatusMessages = {},
) {
  const fieldErrors: Record<string, string> = {};
  let formError: string | undefined;

  if (!error) {
    return { fieldErrors, formError };
  }

  const { status, errors } = error as ServerError;
  const message = statusMessages[status];

  if (status === 422) {
    for (const [field, text] of Object.entries(errors ?? {})) {
      fieldErrors[field] = `${FIELD_LABELS[field] ?? field} ${text}`;
    }
  } else if (typeof message === "string") {
    formError = message;
  } else if (message) {
    Object.assign(fieldErrors, message);
  } else {
    formError = "Something went wrong. Please try again.";
  }

  return { fieldErrors, formError };
}
