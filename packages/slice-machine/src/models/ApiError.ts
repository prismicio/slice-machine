// User friendly traduction of custom type API response
export enum ApiError {
  INVALID_MODEL = "invalid_model", // bad request
  NOT_LOGIN = "not_login", // forbidden
  NOT_REPOSITORY_ADMIN = "not_repository_admin", // unauthorized
}
