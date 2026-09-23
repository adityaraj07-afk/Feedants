import { ICompetition, IUser, IWinner, IReferralInfo, IRegistration, ISubmission } from '../types';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'An error occurred while communicating with the server');
  }
  return data;
}

export async function fetchUsers(): Promise<IUser[]> {
  const res = await fetch(`${API_BASE_URL}/users`);
  const data = await handleResponse<{ success: boolean; users: IUser[] }>(res);
  return data.users;
}

export async function fetchCompetitions(userId?: string): Promise<ICompetition[]> {
  const headers: Record<string, string> = {};
  if (userId) headers['x-user-id'] = userId;

  const res = await fetch(`${API_BASE_URL}/competitions`, { headers });
  const data = await handleResponse<{ success: boolean; competitions: ICompetition[] }>(res);
  return data.competitions;
}

export async function fetchCompetitionById(id: string, userId?: string): Promise<ICompetition> {
  const headers: Record<string, string> = {};
  if (userId) headers['x-user-id'] = userId;

  const res = await fetch(`${API_BASE_URL}/competitions/${id}`, { headers });
  const data = await handleResponse<{ success: boolean; competition: ICompetition }>(res);
  return data.competition;
}

export async function registerForCompetition(
  competitionId: string,
  userId: string,
  referralCode?: string
): Promise<{ success: boolean; message: string; registration: IRegistration; spotsLeft: number }> {
  const res = await fetch(`${API_BASE_URL}/competitions/${competitionId}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ referralCode }),
  });
  return handleResponse(res);
}

export async function submitProject(
  competitionId: string,
  userId: string,
  payload: { title: string; description?: string; mediaUrl: string }
): Promise<{ success: boolean; message: string; submission: ISubmission }> {
  const res = await fetch(`${API_BASE_URL}/competitions/${competitionId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchWinners(competitionId: string): Promise<IWinner[]> {
  const res = await fetch(`${API_BASE_URL}/competitions/${competitionId}/winners`);
  const data = await handleResponse<{ success: boolean; winners: IWinner[] }>(res);
  return data.winners;
}

export async function fetchReferralInfo(competitionId: string, userId: string): Promise<IReferralInfo> {
  const res = await fetch(`${API_BASE_URL}/competitions/${competitionId}/referral`, {
    headers: {
      'x-user-id': userId,
    },
  });
  const data = await handleResponse<{ success: boolean; referral: IReferralInfo }>(res);
  return data.referral;
}

export const api = {
  getUsers: async () => {
    const users = await fetchUsers();
    return { users };
  },
  getCompetitions: async (userId?: string) => {
    const competitions = await fetchCompetitions(userId);
    return { competitions };
  },
  getCompetitionById: async (id: string, userId?: string) => {
    const competition = await fetchCompetitionById(id, userId);
    return { competition };
  },
  registerForCompetition,
  submitProject,
  getCompetitionWinners: async (id: string) => {
    const winners = await fetchWinners(id);
    return { winners };
  },
  getReferralDetails: fetchReferralInfo,
};

