"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    HiLocationMarker,
    HiCalendar,
    HiClock,
    HiBriefcase,
    HiHeart,
} from "react-icons/hi";
import "./wishlist.css";

const faussesOffres = [
    {
        id: 1,
        titre: "Stage Dev Web",
        entreprise: "TechCorp",
        localisation: "Paris",
        dateDebut: "2025-05-01",
        duree: 3,
        description: "Développement React/Next.js",
    },
    {
        id: 2,
        titre: "Stage Data Analyst",
        entreprise: "DataX",
        localisation: "Lyon",
        dateDebut: "2025-06-15",
        duree: 4,
        description: "Analyse de données Python",
    },
];

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });
};

const OffreCard = ({ offre, onRemove }) => {
    const router = useRouter();

    return (
        <div className="offre-card">
            <div className="offre-header">
                <h2 className="offre-title">{offre.titre}</h2>
                <div className="offre-company">{offre.entreprise}</div>
            </div>
            <div className="offre-content">
                <div className="offre-details">
                    <div className="detail-item">
                        <HiLocationMarker />
                        <span>{offre.localisation}</span>
                    </div>
                    <div className="detail-item">
                        <HiCalendar />
                        <span>Début : {formatDate(offre.dateDebut)}</span>
                    </div>
                    <div className="detail-item">
                        <HiClock />
                        <span>Durée : {offre.duree} mois</span>
                    </div>
                    <div className="detail-item">
                        <HiBriefcase />
                        <span>{offre.description}</span>
                    </div>
                </div>
            </div>
            <div className="offre-actions">
                <button className="btn btn-outline wishlist-remove" onClick={() => onRemove(offre.id)}>
                    <HiHeart /> Retirer
                </button>
            </div>
        </div>
    );
};

export default function WishlistPage() {
    const [favoris, setFavoris] = useState([1, 2]);
    const [offres, setOffres] = useState([]);

    useEffect(() => {
        const filtrer = faussesOffres.filter((o) => favoris.includes(o.id));
        setOffres(filtrer);
    }, [favoris]);

    const retirerFavori = (id) => {
        const newFavoris = favoris.filter((fid) => fid !== id);
        setFavoris(newFavoris);
        localStorage.setItem("favoris", JSON.stringify(newFavoris));
    };

    return (
        <div className="wishlist-container">
            <div className="wishlist-wrapper">
                <h1 className="wishlist-title">Ma Wishlist</h1>
                <div className="offres-grid">
                    {offres.length > 0 ? (
                        offres.map((offre) => (
                            <OffreCard key={offre.id} offre={offre} onRemove={retirerFavori} />
                        ))
                    ) : (
                        <p className="wishlist-empty">Aucune offre en favoris.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
