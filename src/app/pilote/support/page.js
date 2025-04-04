'use client';

import React from 'react';
import '../../Contact/Contact.css';

export default function AdminSupportPage() {
    return (
        <div className="center-container">
            <form className="form">
                <div className="flex-column">
                    <label>Nom</label>
                    <div className="inputForm">
                        <span className="material-symbols-rounded">person</span>
                        <input type="text" placeholder="Entrez votre nom" required />
                    </div>
                </div>

                <div className="flex-column">
                    <label>Prénom</label>
                    <div className="inputForm">
                        <span className="material-symbols-rounded">person</span>
                        <input type="text" placeholder="Entrez votre prénom" required />
                    </div>
                </div>

                <div className="flex-column">
                    <label>Email</label>
                    <div className="inputForm">
                        <span className="material-symbols-rounded">mail</span>
                        <input type="email" placeholder="Entrez votre email" required />
                    </div>
                </div>

                <div className="flex-column">
                    <label>Message</label>
                    <div className="inputForm">
                        <span className="material-symbols-rounded">chat</span>
                        <textarea
                            placeholder="Entrez votre message"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                </div>

                <button className="button-submit" type="submit">Envoyer</button>
            </form>
        </div>
    );
}
