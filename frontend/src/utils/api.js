import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Get or create userId from localStorage replacement (in-memory)
let _userId = null;

export function getUserId() {
  if (!_userId) {
    // Generate a simple unique ID
    _userId = 'web_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  return _userId;
}

// Chat API
export async function sendMessage(message) {
  const response = await api.post('/api/chat/message', {
    message,
    userId: getUserId(),
    channel: 'web',
  });
  return response.data;
}

// User API
export async function getUser() {
  const response = await api.get(`/api/user/${getUserId()}`);
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.put(`/api/user/${getUserId()}`, data);
  return response.data;
}

export async function calculateBMI(weight, height) {
  const response = await api.post('/api/user/bmi', { weight, height });
  return response.data;
}

// Progress API
export async function logWeight(weight) {
  const response = await api.post(`/progress/${getUserId()}/weight`, { weight });
  return response.data;
}

export async function logWorkout(data) {
  const response = await api.post(`/api/progress/${getUserId()}/workout`, data);
  return response.data;
}

export async function getWeeklyReport() {
  const response = await api.get(`/api/progress/${getUserId()}/weekly-report`);
  return response.data;
}

export async function getChartData(days = 30) {
  const response = await api.get(`/api/progress/${getUserId()}/charts?days=${days}`);
  return response.data;
}

export async function getGamificationData() {
  const response = await api.get(`/api/progress/${getUserId()}/gamification`);
  return response.data;
}

// Dashboard API
export async function getDashboard() {
  const response = await api.get(`/api/dashboard/${getUserId()}`);
  return response.data;
}

// Exercise search
export async function searchExercises(query) {
  const response = await api.get(`/api/dashboard/exercises/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

export default api;
