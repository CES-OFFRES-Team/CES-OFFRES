'use client';

import React from 'react';
import Link from 'next/link';
import styles from './StatsOffresButton.module.css';

export default function StatsOffresButton() {
    return (
        <Link href="/admin/offres/stats" className={styles.statsBtn}>
            📈 Statistiques offres
        </Link>
    );
}
