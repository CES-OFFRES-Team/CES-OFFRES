"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPopup({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="popup-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                <h2>Comment s'inscrire ?</h2>
                
                <div className="registration-options">
                    <div className="option">
                        <i className="fas fa-user-tie"></i>
                        <h3>Via votre pilote</h3>
                        <p>Contactez directement votre pilote pédagogique pour obtenir vos identifiants de connexion.</p>
                    </div>

                    <div className="separator">
                        <span>OU</span>
                    </div>

                    <div className="option">
                        <i className="fas fa-envelope"></i>
                        <h3>Via le formulaire de contact</h3>
                        <p>Remplissez notre formulaire de contact. Après vérification de votre statut, vous recevrez vos accès par email.</p>
                        <Link href="/Contact" className="contact-btn" onClick={onClose}>
                            Faire une demande
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}