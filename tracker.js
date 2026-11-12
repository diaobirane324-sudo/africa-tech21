/* TRACKER AFRICA.TECH21 */
(function() {
    'use strict';

    const SUPABASE_URL = 'https://olgrpycxudzuxtzjxoma.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3JweWN4dWR6dXh0emp4b21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMzA4MDUsImV4cCI6MjEwNTkwNjgwNX0.Day-sMRM-l6bBWuqCsho6vBPCKNxZaqUB1TgHbF6-TE';

    // Fonction pour envoyer les données à Supabase
    async function supaInsert(table, data) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) console.warn('Erreur tracker:', table, await res.text());
            return res.ok;
        } catch (e) {
            console.warn('[Tracker] Erreur:', e);
            return false;
        }
    }

    // Récupération des infos du membre
    const memberId = localStorage.getItem('memberId') || localStorage.getItem('cours_member_id');
    if (!memberId) return; // Si pas connecté, on ne fait rien

    const memberNom = ((localStorage.getItem('memberPrenom') || '') + ' ' + (localStorage.getItem('memberNom') || '')).trim() || 'Inconnu';
    const memberEmail = localStorage.getItem('memberEmail') || '';
    const fonction = localStorage.getItem('memberFonction') || 'Membre';
    const pageActuelle = window.location.pathname.split('/').pop() || 'index.html';

    // 1. Enregistrer la session
    async function demarrerSession() {
        const sessionKey = 'surv_session_started_' + memberId;
        if (sessionStorage.getItem(sessionKey)) return; // Déjà compté

        await supaInsert('surveillance_sessions', {
            member_id: memberId,
            member_nom: memberNom,
            member_email: memberEmail,
            fonction: fonction,
            page_entree: pageActuelle,
            navigateur: navigator.userAgent,
            active: true
        });

        sessionStorage.setItem(sessionKey, 'true');
    }

    // 2. Enregistrer la page vue
    async function trackPageView() {
        await supaInsert('surveillance_activites', {
            member_id: memberId,
            member_nom: memberNom,
            fonction: fonction,
            type_action: 'page_view',
            page: pageActuelle
        });
    }

    // 3. Enregistrer le temps passé (toutes les 30s)
    let lastTrack = Date.now();
    setInterval(() => {
        const duree = Math.floor((Date.now() - lastTrack) / 1000);
        if (duree >= 30) {
            supaInsert('surveillance_activites', {
                member_id: memberId,
                member_nom: memberNom,
                fonction: fonction,
                type_action: 'temps_passe',
                page: pageActuelle,
                duree_page: duree
            });
            lastTrack = Date.now();
        }
    }, 30000);

    // Lancer au chargement de la page
    window.addEventListener('load', () => {
        demarrerSession();
        trackPageView();
    });

})();
