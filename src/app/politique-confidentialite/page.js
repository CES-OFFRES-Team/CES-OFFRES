'use client';
import React from 'react';
import styles from './Privacy.module.css';
import Link from 'next/link';

const Privacy = () => {
    const rights = [
        { icon: "fas fa-eye", title: "Droit d'accès", description: "Consultez vos données" },
        { icon: "fas fa-edit", title: "Droit de rectification", description: "Modifiez vos informations" },
        { icon: "fas fa-trash-alt", title: "Droit à l'effacement", description: "Supprimez vos données" },
        { icon: "fas fa-ban", title: "Droit d'opposition", description: "Limitez l'utilisation" },
    ];

    return (
        <div className={styles.privacyContainer}>
            <div className={styles.privacyHeader}>
                <h1>Politique de Confidentialité</h1>
                <p>Protection de vos données personnelles</p>
            </div>

            <div className={styles.privacyContent}>
                <section className={styles.privacySection}>
                    <h2>Introduction</h2>
                    <div className={styles.contentBox}>
                        <p className={styles.introText}>
                            CES'Offres s'engage à protéger la vie privée des utilisateurs de sa plateforme.
                            Cette politique de confidentialité explique comment nous collectons,
                            utilisons et protégeons vos données personnelles.
                        </p>
                    </div>
                </section>

                <section className={styles.privacySection}>
                    <h2>Données collectées</h2>
                    <div className={styles.contentBox}>
                        <p className={styles.sectionIntro}>Nous collectons les informations suivantes :</p>
                        <ul className={styles.dataList}>
                            <li>
                                <span className={styles.dataType}>Données d'identification :</span>
                                Nom, prénom, adresse email CESI
                            </li>
                            <li>
                                <span className={styles.dataType}>Données académiques :</span>
                                Parcours, année d'études, campus
                            </li>
                            <li>
                                <span className={styles.dataType}>Données de connexion :</span>
                                Identifiants, historique de connexion
                            </li>
                            <li>
                                <span className={styles.dataType}>Données de candidature :</span>
                                CV, lettres de motivation
                            </li>
                        </ul>
                    </div>
                </section>

                <section className={styles.privacySection}>
                    <h2>Utilisation des données</h2>
                    <div className={styles.contentBox}>
                        <p className={styles.sectionIntro}>Vos données sont utilisées pour :</p>
                        <ul className={styles.dataList}>
                            <li>Gérer votre compte et vos candidatures</li>
                            <li>Personnaliser votre expérience utilisateur</li>
                            <li>Faciliter la mise en relation avec les entreprises</li>
                            <li>Améliorer nos services</li>
                            <li>Assurer le suivi pédagogique avec les pilotes CESI</li>
                        </ul>
                    </div>
                </section>

                <section className={styles.privacySection}>
                    <h2>Protection des données</h2>
                    <div className={styles.contentBox}>
                        <p className={styles.sectionIntro}>
                            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger
                            vos données contre tout accès, modification, divulgation ou destruction
                            non autorisés.
                        </p>
                        <div className={styles.securityInfo}>
                            <h3>Nos mesures incluent :</h3>
                            <ul className={styles.securityList}>
                                <li>Chiffrement des données sensibles</li>
                                <li>Accès restreint aux données personnelles</li>
                                <li>Surveillance continue de la sécurité</li>
                                <li>Formation régulière de notre personnel</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className={styles.privacySection}>
                    <h2>Vos droits</h2>
                    <div className={styles.contentBox}>
                        <p className={styles.sectionIntro}>Conformément au RGPD, vous disposez des droits suivants :</p>
                        <div className={styles.rightsGrid}>
                            {rights.map((right) => (
                                <div key={right.title} className={styles.rightCard}>
                                    <i className={right.icon}></i>
                                    <div className={styles.rightContent}>
                                        <h4>{right.title}</h4>
                                        <p>{right.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className={styles.privacySection}>
                    <h2>Nous contacter</h2>
                    <div className={styles.contentBox}>
                        <p className={styles.contactText}>
                            Pour toute question concernant notre politique de confidentialité ou
                            pour exercer vos droits, contactez notre délégué à la protection des
                            données via notre <Link href="/Contact" className={styles.link}>formulaire de contact</Link>.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Privacy;