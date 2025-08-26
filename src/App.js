// src/App.js
/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously, 
    signInWithCustomToken 
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Importaciones de los componentes
import AuthComponent from './components/AuthComponent';
import GameComponent from './components/GameComponent';
import { getNewGameState } from './utils';

// --- Configuración de Firebase ---
let app, auth, db;
try {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
        apiKey: "AIzaSyDW9F3WKfZTlSOzILrkKSUAmmfQlRajVVg",
        authDomain: "gold-miner-idle-dev.firebaseapp.com",
        projectId: "gold-miner-idle-dev",
        storageBucket: "gold-miner-idle-dev.firebasestorage.app",
        messagingSenderId: "201203457025",
        appId: "1:201203457025:web:680eedc6e8439c7d99f400"
    };
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.error("Error inicializando Firebase:", e);
}


export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialGameState, setInitialGameState] = useState(null);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        if (!auth || !db) {
            setLoading(false);
            return;
        };

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Referencia a los datos privados del juego del usuario
                const gameDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/gameData`, 'progress');
                const docSnap = await getDoc(gameDocRef);
                let gameStateForUser;

                if (docSnap.exists()) {
                    gameStateForUser = docSnap.data();
                } else {
                    const newGame = getNewGameState();
                    await setDoc(gameDocRef, newGame);
                    gameStateForUser = newGame;
                }

                // Asegurarse de que el estado del juego tenga el nuevo campo para el ranking
                if (!gameStateForUser.stats.totalGoldMined) {
                    gameStateForUser.stats.totalGoldMined = 0;
                }

                setInitialGameState(gameStateForUser);

                // Referencia al documento público del ranking del usuario
                const rankingDocRef = doc(db, `artifacts/${appId}/public/data/rankings`, currentUser.uid);
                const rankingSnap = await getDoc(rankingDocRef);
                if (!rankingSnap.exists()) {
                    await setDoc(rankingDocRef, {
                        email: currentUser.email || `anon-${currentUser.uid.substring(0,6)}`,
                        totalGoldMined: gameStateForUser.stats.totalGoldMined
                    });
                }

                setUser(currentUser);
            } else {
                setUser(null);
                setInitialGameState(null);
            }
            setLoading(false);
        });
        
        // Autenticación
        (async () => {
             if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                try {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } catch (e) {
                    console.error("Error al iniciar sesión con token personalizado, intentando anónimo", e);
                    await signInAnonymously(auth);
                }
            } else {
                 await signInAnonymously(auth);
            }
        })();


        return () => unsubscribe();
    }, [appId]);
    
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

    if (loading || (user && !initialGameState)) {
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
            {user ? <GameComponent user={user} initialGameState={initialGameState} db={db} auth={auth} appId={appId} /> : <AuthComponent auth={auth} />}
        </>
    );
}
