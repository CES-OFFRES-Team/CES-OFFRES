'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CreateOffreButton.module.css';

export default function CreateOffreButton() {
    return (
        <Link href="/admin/offres/ajouter" className={styles.createBtn}>
            + Créer une offre
        </Link>
    );
}
