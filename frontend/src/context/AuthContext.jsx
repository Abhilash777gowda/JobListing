import React, { createContext, useState, useEffect } from 'react';
import API from '../api';
import { io } from 'socket.io-client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // Initialize socket connection
    const connectSocket = (userId) => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('join_user_room', userId);
        });
        setSocket(newSocket);
        return newSocket;
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${token}` }
                    };
                    const res = await API.get('/api/auth/me', config);
                    setUser(res.data);
                    connectSocket(res.data._id);
                } catch (error) {
                    console.error('Invalid token', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
        
        return () => disconnectSocket();
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        connectSocket(res.data._id);
    };

    const register = async (userData) => {
        const res = await API.post('/api/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        connectSocket(res.data._id);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, socket }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
