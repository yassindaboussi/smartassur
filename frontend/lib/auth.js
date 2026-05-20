'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    Cookies.set('token', data.token, { expires: 7 });
    Cookies.set('user', JSON.stringify(data), { expires: 7 });
    setUser(data);
    return data;
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.role !== 'admin') {
      throw { response: { data: { message: 'Accès refusé : compte non administrateur' } } };
    }
    Cookies.set('token', data.token, { expires: 7 });
    Cookies.set('user', JSON.stringify(data), { expires: 7 });
    setUser(data);
    return data;
  };

  const register = async (formData, isMultipart = false) => {
    const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const { data } = await api.post('/auth/register', formData, config);
    Cookies.set('token', data.token, { expires: 7 });
    Cookies.set('user', JSON.stringify(data), { expires: 7 });
    setUser(data);
    return data;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    window.location.href = '/';
  };

  // Call this after updating profile so context + cookie stay in sync
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    Cookies.set('user', JSON.stringify(merged), { expires: 7 });
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
