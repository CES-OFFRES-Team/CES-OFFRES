'use client';

import { memo, useState } from 'react';

const TestAPI = memo(() => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSystemTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://20.19.36.142:8000/test_system.php');
      const data = await response.json();
      setTestResults(data);
      console.log('Résultats des tests système:', data);
    } catch (error) {
      setError('Erreur lors des tests système: ' + error.message);
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://20.19.36.142:8000/api/users');
      const data = await response.json();
      setTestResults({ users: data });
      console.log('Utilisateurs:', data);
    } catch (error) {
      setError('Erreur lors de la récupération des utilisateurs: ' + error.message);
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const createUser = async () => {
    setLoading(true);
    setError(null);
    const userData = {
      name: "Test User",
      email: "test" + Date.now() + "@example.com",
      password: "password123"
    };

    try {
      const response = await fetch('http://20.19.36.142:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      setTestResults({ createUser: data });
      console.log('Réponse de création:', data);
    } catch (error) {
      setError('Erreur lors de la création: ' + error.message);
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  return (
    <section className="test-api-section">
      <h2>Tests du Système</h2>
      
      {loading && <div className="test-loading">Chargement en cours...</div>}
      
      {error && (
        <div className="test-error">
          {error}
        </div>
      )}

      <div className="test-buttons">
        <button 
          onClick={runSystemTest} 
          className="test-button"
          disabled={loading}
        >
          Tester le Système
        </button>
        <button 
          onClick={createUser} 
          className="test-button"
          disabled={loading}
        >
          Créer un utilisateur test
        </button>
        <button 
          onClick={fetchUsers} 
          className="test-button"
          disabled={loading}
        >
          Voir les utilisateurs
        </button>
      </div>

      {testResults.tests && (
        <div className="test-results">
          <h3>Résultats des tests système :</h3>
          <ul>
            {Object.entries(testResults.tests).map(([test, result]) => (
              <li key={test} className={result ? 'test-success' : 'test-failure'}>
                {test}: {result ? '✅' : '❌'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {testResults.users && (
        <div className="test-results">
          <h3>Utilisateurs :</h3>
          <pre>{JSON.stringify(testResults.users, null, 2)}</pre>
        </div>
      )}

      {testResults.createUser && (
        <div className="test-results">
          <h3>Résultat création utilisateur :</h3>
          <pre>{JSON.stringify(testResults.createUser, null, 2)}</pre>
        </div>
      )}
    </section>
  );
});

export default TestAPI; 