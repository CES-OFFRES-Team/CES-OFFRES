'use client';
import React from 'react';
import Link from 'next/link';
import styles from './StatsEntrepriseButton.module.css';

export default function StatsEntrepriseButton() {
    return (
        <Link href="/pilote/entreprises/stats" className={styles.statsBtn}>
            📊 Statistiques
        </Link>
    );
}
