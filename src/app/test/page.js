'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});
  const [cacheInfo, setCacheInfo] = useState({ used: false, timestamp: null });

  // Utilisation de données de test en cas d'échec de l'API
  const entreprisesDeTest = [
    {
      id_entreprise: 1,
      nom_entreprise: 'TechCorp',
      adresse: 'Paris, France',
      email: 'contact@techcorp.fr',
      téléphone: '01 23 45 67 89',
      moyenne_eval: 4.5,
      description: 'Entreprise spécialisée dans le développement informatique',
    },
    {
      id_entreprise: 2,
      nom_entreprise: 'EcoSolutions',
      adresse: 'Lyon, France',
      email: 'info@ecosolutions.fr',
      téléphone: '04 56 78 90 12',
      moyenne_eval: 4.2,
      description: 'Spécialiste des solutions écologiques',
    },
  ];

  useEffect(() => {
    const fetchEntreprises = async () => {
      try {
        setLoading(true);
        console.log("Vérification du cache...");
        
        // Vérifier si des données sont en cache
        const cachedData = localStorage.getItem('entreprisesCache');
        const cacheTimestamp = localStorage.getItem('entreprisesCacheTimestamp');
        
        // Si des données sont en cache et le cache a moins de 10 minutes
        if (cachedData && cacheTimestamp) {
          const parsedData = JSON.parse(cachedData);
          const timestamp = parseInt(cacheTimestamp);
          const now = new Date().getTime();
          const cacheAge = now - timestamp;
          const cacheMaxAge = 10 * 60 * 1000; // 10 minutes en millisecondes
          
          if (cacheAge < cacheMaxAge && parsedData.length > 0) {
            console.log("Utilisation des données en cache");
            setEntreprises(parsedData);
            setCacheInfo({ 
              used: true, 
              timestamp: new Date(timestamp).toLocaleString(),
              age: Math.round(cacheAge / 1000 / 60) + " minutes"
            });
            setLoading(false);
            return;
          } else {
            console.log("Cache expiré ou vide, nouvelle requête à l'API");
          }
        } else {
          console.log("Pas de cache disponible, première requête à l'API");
        }
        
        // URL de l'API
        const API_URL = 'http://20.19.36.124:8000/api/entreprises';
        console.log("URL de l'API:", API_URL);
        
        // Début du fetch
        const startTime = new Date();
        
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit'
        });
        
        // Fin du fetch et calcul du temps d'exécution
        const endTime = new Date();
        const executionTime = endTime - startTime;
        
        console.log("Statut de la réponse:", response.status);
        console.log("Temps d'exécution:", executionTime, "ms");
        
        // Enregistrement des infos de debug
        setDebug({
          url: API_URL,
          status: response.status,
          statusText: response.statusText,
          executionTime: executionTime
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("La réponse n'est pas au format JSON");
        }
        
        const data = await response.json();
        console.log("Données reçues:", data);
        
        let entreprisesData = [];
        
        if (data.status === 'success' && data.data) {
          console.log("Nombre d'entreprises:", data.data.length);
          entreprisesData = data.data;
        } else if (data.records) {
          // Format alternatif possible
          console.log("Format alternatif détecté - Nombre d'entreprises:", data.records.length);
          entreprisesData = data.records;
        } else {
          console.log("Format de données inconnu, utilisation des données de test");
          entreprisesData = entreprisesDeTest;
          setError("Format de réponse non reconnu, affichage des données de test");
        }
        
        // Mise à jour de l'état
        setEntreprises(entreprisesData);
        
        // Mise en cache des données
        localStorage.setItem('entreprisesCache', JSON.stringify(entreprisesData));
        const timestamp = new Date().getTime();
        localStorage.setItem('entreprisesCacheTimestamp', timestamp);
        setCacheInfo({ 
          used: false, 
          timestamp: new Date(timestamp).toLocaleString(),
          fresh: true
        });
        
      } catch (err) {
        console.error("Erreur lors de la récupération des entreprises:", err);
        
        // Essayer de récupérer les données du cache en cas d'erreur
        const cachedData = localStorage.getItem('entreprisesCache');
        if (cachedData) {
          console.log("Utilisation du cache suite à une erreur");
          const parsedData = JSON.parse(cachedData);
          const cacheTimestamp = localStorage.getItem('entreprisesCacheTimestamp');
          
          setEntreprises(parsedData);
          setError(`Erreur API: ${err.message}. Affichage des données en cache.`);
          setCacheInfo({ 
            used: true, 
            timestamp: cacheTimestamp ? new Date(parseInt(cacheTimestamp)).toLocaleString() : "inconnu",
            fromError: true
          });
        } else {
          // Utilisation des données de test en dernier recours
          setError(`Erreur: ${err.message}. Affichage des données de test.`);
          setEntreprises(entreprisesDeTest);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEntreprises();
  }, []);

  const forceRefresh = () => {
    // Supprimer le cache
    localStorage.removeItem('entreprisesCache');
    localStorage.removeItem('entreprisesCacheTimestamp');
    // Recharger la page
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Test - Liste des Entreprises</h1>
      
      {/* Informations sur le cache */}
      {cacheInfo.used && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <p>
            <strong>Données en cache</strong> - Chargées le {cacheInfo.timestamp} 
            {cacheInfo.age && <span> (il y a {cacheInfo.age})</span>}
            {cacheInfo.fromError && <span> suite à une erreur API</span>}
          </p>
          <button 
            onClick={forceRefresh}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Forcer le rafraîchissement
          </button>
        </div>
      )}
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Erreur:</strong> {error}</p>
        </div>
      )}
      
      {/* État de chargement */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg">Chargement des données...</p>
          <div className="mt-4 w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Nombre d'entreprises */}
          <div className="bg-blue-50 p-4 mb-6 rounded">
            <p className="text-lg">
              Nombre d'entreprises: <span className="font-bold">{entreprises.length}</span>
            </p>
          </div>
          
          {/* Liste des entreprises */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entreprises.map((entreprise) => (
              <div 
                key={entreprise.id_entreprise} 
                className="border rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{entreprise.nom_entreprise}</h2>
                  <p className="text-gray-600 mb-4">{entreprise.adresse}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="flex items-center">
                      <span className="font-medium w-24">Email:</span> 
                      <span>{entreprise.email}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-24">Téléphone:</span> 
                      <span>{entreprise.téléphone}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium w-24">Évaluation:</span> 
                      <span>{entreprise.moyenne_eval}</span>
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-4">
                    {entreprise.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Informations de débogage */}
          <div className="mt-10 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Informations de débogage</h2>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
              {JSON.stringify({
                api_info: debug,
                cache_info: cacheInfo,
                entreprises_count: entreprises.length,
                first_entreprise: entreprises.length > 0 ? entreprises[0] : null
              }, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
