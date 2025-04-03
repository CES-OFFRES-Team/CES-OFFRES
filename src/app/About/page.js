'use client';
import React from 'react';
import styles from './About.module.css';
import Link from 'next/link';

const About = () => {
    return (
        <div className={styles.aboutContainer}>
            <div className={styles.aboutHeader}>
                <h1>À propos de CES'Offres</h1>
                <p>Votre partenaire officiel pour les stages CESI</p>
            </div>

            <div className={styles.aboutContent}>
                <section className={styles.aboutSection}>
                    <h2>Notre Mission</h2>
                    <p>
                        CES'Offres est la plateforme officielle de stages du CESI École d'Ingénieurs. 
                        Notre mission est de faciliter la connexion entre les étudiants CESI et les 
                        entreprises partenaires, garantissant des opportunités de stage pertinentes 
                        et enrichissantes.
                    </p>
                </section>

                <section className={styles.aboutSection}>
                    <h2>Notre Engagement</h2>
                    <div className={styles.engagementGrid}>
                        <div className={styles.engagementCard}>
                            <i className="fas fa-check-circle"></i>
                            <h3>Qualité</h3>
                            <p>Toutes nos offres sont vérifiées et validées par les pilotes CESI.</p>
                        </div>
                        <div className={styles.engagementCard}>
                            <i className="fas fa-handshake"></i>
                            <h3>Partenariat</h3>
                            <p>Collaboration étroite avec les entreprises partenaires de confiance.</p>
                        </div>
                        <div className={styles.engagementCard}>
                            <i className="fas fa-graduation-cap"></i>
                            <h3>Formation</h3>
                            <p>Stages alignés avec votre parcours académique.</p>
                        </div>
                    </div>
                </section>

                <section className={styles.aboutSection}>
                    <h2>Comment ça marche ?</h2>
                    <div className={styles.stepsList}>
                        <div className={styles.stepItem}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepContent}>
                                <h3>Création de compte</h3>
                                <p>Contactez votre pilote ou faites une demande via notre page contact.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepContent}>
                                <h3>Recherche de stage</h3>
                                <p>Explorez les offres correspondant à vos critères.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepContent}>
                                <h3>Candidature</h3>
                                <p>Postulez directement via la plateforme.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.aboutSection}>
                    <h2>Besoin d'aide ?</h2>
                    <div className={styles.helpBox}>
                        <p>
                            Consultez notre <Link href="/FAQ" className={styles.link}>FAQ</Link> ou 
                            contactez-nous via notre <Link href="/Contact" className={styles.link}>formulaire de contact</Link>.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;