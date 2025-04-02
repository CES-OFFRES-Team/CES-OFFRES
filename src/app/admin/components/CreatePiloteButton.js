'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CreatePiloteButton.module.css';

export default function CreatePiloteButton() {
    return (
        <Link href="/admin/pilotes/ajouter" className={styles.createBtn}>
            + Créer un pilote
        </Link>
    );
}
