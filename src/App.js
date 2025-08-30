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
import GameComponent from './components/GameComponent';
import AuthComponent from './components/AuthComponent';
import { getNewGameState, initializeMissions } from './utils';

// --- Configuración de Firebase ---
let app, auth, db;
try {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
        // Fallback config for local development
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
    const [authError, setAuthError] = useState(null);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        if (!auth || !db) {
            console.error("Firebase no se ha inicializado correctamente.");
            setLoading(false);
            return;
        };
        
        const setupAuthenticationAndLoadData = async () => {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    setAuthError(null);
                    const gameDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/gameData`, 'progress');
                    const docSnap = await getDoc(gameDocRef);
                    let gameStateForUser;
                    const newGameTemplate = getNewGameState();
                     if (!newGameTemplate.activeMissions || newGameTemplate.activeMissions.length === 0) {
                        newGameTemplate.activeMissions = initializeMissions();
                    }


                    if (docSnap.exists()) {
                        const savedData = docSnap.data();
                        // Fusiona inteligentemente los datos guardados con la plantilla
                        gameStateForUser = { 
                            ...newGameTemplate, 
                            ...savedData,
                            stats: { ...newGameTemplate.stats, ...(savedData.stats || {}), },
                            resources: { ...newGameTemplate.resources, ...(savedData.resources || {}), },
                            purchasedInfinityUpgrades: { ...newGameTemplate.purchasedInfinityUpgrades, ...(savedData.purchasedInfinityUpgrades || {}), },
                            // Asegurar que las misiones existan
                            activeMissions: savedData.activeMissions && savedData.activeMissions.length > 0 ? savedData.activeMissions : initializeMissions(),
                        };
                    } else {
                        gameStateForUser = newGameTemplate;
                        await setDoc(gameDocRef, gameStateForUser);
                    }
                    
                    if (!gameStateForUser.stats.totalGoldMined) {
                        gameStateForUser.stats.totalGoldMined = 0;
                    }

                    setInitialGameState(gameStateForUser);

                    const rankingDocRef = doc(db, `artifacts/${appId}/public/data/rankings`, currentUser.uid);
                    await setDoc(rankingDocRef, {
                        email: currentUser.email || `anon-${currentUser.uid.substring(0,6)}`,
                        totalGoldMined: gameStateForUser.stats.totalGoldMined
                    }, { merge: true });

                } else {
                    setUser(null);
                    setInitialGameState(null);
                }
                setLoading(false);
            });

            try {
                if (auth.currentUser) {
                    setLoading(false);
                    return;
                }
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Fallo la autenticación automática:", error);
                setAuthError(error.message);
                setLoading(false);
            }

            return () => unsubscribe();
        };

        setupAuthenticationAndLoadData();

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

        const fontLinkId = 'google-font-link';
        if (!document.getElementById(fontLinkId)) {
            const link = document.createElement('link');
            link.id = fontLinkId;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl font-bold">Cargando...</div>
            </div>
        );
    }
    
    if (!user) {
        return <AuthComponent auth={auth} error={authError} />;
    }

    if (!initialGameState) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
                <div className="text-2xl font-bold">Cargando datos del juego...</div>
            </div>
        );
    }


    return (
        <>
            <style>{`
                body { 
                    font-family: 'Cutive Mono', monospace;
                    background-color: #030712; /* bg-gray-950 */
                    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231f2937' fill-opacity='0.6' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
                }
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
                @keyframes mine-click {
                    0% { transform: scale(1); }
                    50% { transform: scale(0.95) rotate(-2deg); }
                    100% { transform: scale(1); }
                }
                .mine-button-animation {
                    animation: mine-click 0.15s ease-out;
                }
            `}</style>
            <GameComponent user={user} initialGameState={initialGameState} db={db} auth={auth} appId={appId} />
        </>
    );
}
