'use client';
import React from 'react';
import Link from 'next/link';
import styles from './CreateEntrepriseButton.module.css';

export default function CreateEntrepriseButton() {
    return (
        <Link href="/pilote/entreprises/ajouter" className={styles.createBtn}>
            + Créer une entreprise
        </Link>
    );
}
