'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});

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
        console.log("Tentative de connexion à l'API...");
        
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
        
        if (data.status === 'success' && data.data) {
          console.log("Nombre d'entreprises:", data.data.length);
          setEntreprises(data.data);
        } else if (data.records) {
          // Format alternatif possible
          console.log("Format alternatif détecté - Nombre d'entreprises:", data.records.length);
          setEntreprises(data.records);
        } else {
          console.log("Format de données inconnu, utilisation des données de test");
          // Utilisation des données de test en cas d'erreur
          setEntreprises(entreprisesDeTest);
          setError("Format de réponse non reconnu, affichage des données de test");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des entreprises:", err);
        setError(`Erreur: ${err.message}. Affichage des données de test.`);
        // Utilisation des données de test en cas d'erreur
        setEntreprises(entreprisesDeTest);
      } finally {
        setLoading(false);
      }
    };

    fetchEntreprises();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Test - Liste des Entreprises</h1>
      
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
                className="border rounded-lg overflow-hidden shadow-lg bg-white"
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
