// src/App.js
/* global __app_id */
import React, { useState, useEffect } from 'react';
// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Importaciones de los nuevos archivos
import AuthComponent from './components/AuthComponent';
import GameComponent from './components/GameComponent';
import { getNewGameState } from './utils';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDW9F3WKfZTlSOzILrkKSUAmmfQlRajVVg",
  authDomain: "gold-miner-idle-dev.firebaseapp.com",
  projectId: "gold-miner-idle-dev",
  storageBucket: "gold-miner-idle-dev.firebasestorage.app",
  messagingSenderId: "201203457025",
  appId: "1:201203457025:web:680eedc6e8439c7d99f400"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialGameState, setInitialGameState] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const gameDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/gameData`, 'progress');
                const docSnap = await getDoc(gameDocRef);

                if (docSnap.exists()) {
                    setInitialGameState(docSnap.data());
                } else {
                    const newGame = getNewGameState();
                    await setDoc(gameDocRef, newGame);
                    setInitialGameState(newGame);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setInitialGameState(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        const scriptId = 'tailwind-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn.tailwindcss.com';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl font-bold">Cargando...</div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                body { font-family: 'Inter', sans-serif; }
                .floating-number { position: fixed; pointer-events: none; animation: float-up 1s ease-out forwards; font-weight: bold; font-size: 1.5rem; color: #FBBF24; text-shadow: 1px 1px 2px black; z-index: 100; } 
                .modal-backdrop { animation: fade-in 0.3s ease-out forwards; }
                .clickable-nugget { position: absolute; cursor: pointer; animation: pulse 2s infinite; }
                .can-afford { animation: glow 1.5s infinite alternate; }
                .tab-scroll::-webkit-scrollbar { display: none; }
                .tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes float-up { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-50px); opacity: 0; } }
                @keyframes glow { from { box-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #fde047, 0 0 8px #fde047; } to { box-shadow: 0 0 4px #fff, 0 0 8px #fff, 0 0 12px #facc15, 0 0 16px #facc15; } }
            `}</style>
            {user ? <GameComponent user={user} initialGameState={initialGameState} db={db} auth={auth} /> : <AuthComponent auth={auth} />}
        </>
    );
}
