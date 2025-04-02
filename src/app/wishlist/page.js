'use client';

import React, { useState } from 'react';
import './wishlist.css';
import { HiPhone, HiMail } from 'react-icons/hi';

const entreprisesDeTest = [
    { id: 1, nom: 'TechNova', secteur: 'Environnement', telephone: '0149742619', mail: 'contact@technova.com' },
    { id: 2, nom: 'EcoSolutions', secteur: 'Marketing', telephone: '0135936950', mail: 'contact@ecosolutions.com' },
    { id: 3, nom: 'GreenByte', secteur: 'Santé', telephone: '0191541096', mail: 'contact@greenbyte.com' },
    { id: 4, nom: 'CyberHive', secteur: 'Télécom', telephone: '0139002419', mail: 'contact@cyberhive.com' },
    { id: 5, nom: 'InnovaTech', secteur: 'Construction', telephone: '0126177920', mail: 'contact@innovatech.com' },
    { id: 6, nom: 'DataBoost', secteur: 'Éducation', telephone: '0116703823', mail: 'contact@databoost.com' },
    { id: 7, nom: 'BlueCircuit', secteur: 'Énergie', telephone: '0174033949', mail: 'contact@bluecircuit.com' },
    { id: 8, nom: 'DevSpark', secteur: 'Informatique', telephone: '0123927185', mail: 'contact@devspark.com' },
    { id: 9, nom: 'NetFusion', secteur: 'Construction', telephone: '0125980384', mail: 'contact@netfusion.com' },
    { id: 10, nom: 'NextCore', secteur: 'Construction', telephone: '0169203911', mail: 'contact@nextcore.com' },
    { id: 11, nom: 'QuantumSoft', secteur: 'Santé', telephone: '0159755279', mail: 'contact@quantumsoft.com' },
    { id: 12, nom: 'CloudLink', secteur: 'Environnement', telephone: '0180779514', mail: 'contact@cloudlink.com' },
    { id: 13, nom: 'AlgoX', secteur: 'Santé', telephone: '0135882728', mail: 'contact@algox.com' },
    { id: 14, nom: 'SecureWave', secteur: 'Santé', telephone: '0151756639', mail: 'contact@securewave.com' },
    { id: 15, nom: 'NeoCode', secteur: 'Environnement', telephone: '0176762431', mail: 'contact@neocode.com' },
    { id: 16, nom: 'CodeSphere', secteur: 'Finance', telephone: '0152089253', mail: 'contact@codesphere.com' },
    { id: 17, nom: 'MicroGen', secteur: 'Construction', telephone: '0199084047', mail: 'contact@microgen.com' },
    { id: 18, nom: 'BrightWare', secteur: 'Télécom', telephone: '0142880452', mail: 'contact@brightware.com' },
    { id: 19, nom: 'EcoLogic', secteur: 'Énergie', telephone: '0192617809', mail: 'contact@ecologic.com' },
    { id: 20, nom: 'VisionTech', secteur: 'Informatique', telephone: '0177635816', mail: 'contact@visiontech.com' },
];

export default function WishlistPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 6;
    const totalPages = Math.ceil(entreprisesDeTest.length / perPage);

    const currentItems = entreprisesDeTest.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    return (
        <div className="wishlist-container">
            <h1>Ma Wishlist</h1>
            <div className="wishlist-grid">
                {currentItems.map((entreprise) => (
                    <div className="wishlist-card" key={entreprise.id}>
                        <h2>{entreprise.nom}</h2>
                        <p><strong>Secteur :</strong> {entreprise.secteur}</p>
                        <p><HiPhone /> {entreprise.telephone}</p>
                        <p><HiMail /> {entreprise.mail}</p>
                    </div>
                ))}
            </div>

            <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Précédent</button>
                <span>Page {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Suivant</button>
            </div>
        </div>
    );
}
