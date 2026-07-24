import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; details?: string[] } | undefined;
    if (data?.details?.length) return data.details.join('\n');
    return data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Une erreur est survenue';
}
