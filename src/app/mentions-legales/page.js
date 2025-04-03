'use client';
import React from 'react';
import styles from './Legal.module.css';

const Legal = () => {
    return (
        <div className={styles.legalContainer}>
            <div className={styles.legalHeader}>
                <h1>Mentions Légales</h1>
                <p>Conditions d'utilisation de CES'Offres</p>
            </div>

            <div className={styles.legalContent}>
                <section className={styles.legalSection}>
                    <h2>Éditeur du site</h2>
                    <div className={styles.contentBox}>
                        <p><strong>CES'Offres</strong></p>
                        <p>Partenaire officiel de CESI École d'Ingénieurs</p>
                        <p>93 Boulevard de la Seine</p>
                        <p>92000 Nanterre, France</p>
                        <p>Email : contact@cesoffres.fr</p>
                    </div>
                </section>

                <section className={styles.legalSection}>
                    <h2>Hébergement</h2>
                    <div className={styles.contentBox}>
                        <p>Ce site est hébergé par Microsoft Azure</p>
                        <p>Microsoft Corporation</p>
                        <p>One Microsoft Way</p>
                        <p>Redmond, WA 98052-6399, États-Unis</p>
                    </div>
                </section>

                <section className={styles.legalSection}>
                    <h2>Protection des données</h2>
                    <div className={styles.contentBox}>
                        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), 
                        les utilisateurs disposent des droits suivants concernant leurs données personnelles :</p>
                        <ul className={styles.legalList}>
                            <li>Droit d'accès</li>
                            <li>Droit de rectification</li>
                            <li>Droit à l'effacement</li>
                            <li>Droit à la limitation du traitement</li>
                            <li>Droit à la portabilité des données</li>
                        </ul>
                    </div>
                </section>

                <section className={styles.legalSection}>
                    <h2>Propriété intellectuelle</h2>
                    <div className={styles.contentBox}>
                        <p>L'ensemble du contenu de ce site (textes, images, logos, etc.) est protégé 
                        par le droit d'auteur. Toute reproduction ou représentation, totale ou partielle, 
                        est strictement interdite sans autorisation préalable.</p>
                    </div>
                </section>

                <section className={styles.legalSection}>
                    <h2>Cookies</h2>
                    <div className={styles.contentBox}>
                        <p>Ce site utilise des cookies essentiels au fonctionnement de la plateforme. 
                        En naviguant sur ce site, vous acceptez l'utilisation de ces cookies qui ne 
                        collectent que les données nécessaires à votre navigation.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Legal;