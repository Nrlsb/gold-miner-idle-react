// src/components/AuthComponent.js
import React, { useState } from 'react';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";

const AuthComponent = ({ auth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-700">
                <h1 className="text-3xl font-bold text-yellow-400 text-center mb-4">Gold Miner Idle</h1>
                <p className="text-gray-400 text-center mb-8">Inicia sesión o regístrate para jugar</p>
                <div className="flex border-b border-gray-600 mb-6">
                    <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 font-semibold transition ${isLogin ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}>Iniciar Sesión</button>
                    <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 font-semibold transition ${!isLogin ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}>Registrarse</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg text-lg transition transform active:scale-95 shadow-lg shadow-yellow-500/20">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</button>
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AuthComponent;
