'use client';

import React from 'react';
import Link from 'next/link';
import styles from './StatsEtudiantsButton.module.css';

export default function StatsEtudiantsButton() {
    return (
        <Link href="/admin/etudiants/stats" className={styles.statsBtn}>
            📊 Statistiques étudiants
        </Link>
    );
}
