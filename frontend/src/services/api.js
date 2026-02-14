import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const getWorlds = async (token) => {
  const { data } = await api.get('/worlds', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createWorld = async (token, payload) => {
  const { data } = await api.post('/worlds', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateWorld = async (token, id, payload) => {
  const { data } = await api.put(`/worlds/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteWorld = async (token, id) => {
  await api.delete(`/worlds/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Characters
export const getCharactersByWorld = async (token, worldId) => {
  const { data } = await api.get(`/worlds/${worldId}/characters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createCharacter = async (token, worldId, payload) => {
  const { data } = await api.post(`/worlds/${worldId}/characters`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateCharacter = async (token, id, payload) => {
  const { data } = await api.put(`/characters/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteCharacter = async (token, id) => {
  await api.delete(`/characters/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCharacterById = async (token, id) => {
  const { data } = await api.get(`/characters/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Notes
export const getNotesByWorld = async (token, worldId) => {
  const { data } = await api.get(`/worlds/${worldId}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getNoteById = async (token, id) => {
  const { data } = await api.get(`/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createNote = async (token, worldId, payload) => {
  const { data } = await api.post(`/worlds/${worldId}/notes`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateNote = async (token, id, payload) => {
  const { data } = await api.put(`/notes/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteNote = async (token, id) => {
  await api.delete(`/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;
