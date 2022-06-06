import axios, { AxiosError } from "axios";

export interface ClientError {
  status: number;
  message: string
}

export function getStatus(error: Error | AxiosError): number {
  return axios.isAxiosError(error)
    ? error.response?.status || 500
    : 500
};

export function getMessage(error: Error | AxiosError): string {
  if (axios.isAxiosError(error) && error.response) {
    return typeof error.response.data  == "string"
      ? error.response.data
      : JSON.stringify(error.response.data)
  }

  return error.message || "Unknown error"
}