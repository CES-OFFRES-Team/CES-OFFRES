'use client';

import React, { useState } from 'react';
import styles from './ajouterEtudiant.module.css';

export default function FormEtudiant() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        password: '',
        role: 'etudiant'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Formulaire soumis :', formData);
        // Ajoute ici la logique d'envoi à l'API
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Ajouter un étudiant</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>Nom</label>
                <input name="nom" value={formData.nom} onChange={handleChange} required className={styles.input} />

                <label className={styles.label}>Prénom</label>
                <input name="prenom" value={formData.prenom} onChange={handleChange} required className={styles.input} />

                <label className={styles.label}>Téléphone</label>
                <input name="telephone" value={formData.telephone} onChange={handleChange} required className={styles.input} />

                <label className={styles.label}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.input} />

                <label className={styles.label}>Mot de passe</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className={styles.input} />

                <button type="submit" className={styles.submitButton}>Ajouter</button>
            </form>
        </div>
    );
}
