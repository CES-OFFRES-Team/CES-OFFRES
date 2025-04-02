'use client';

import Link from 'next/link';
import styles from './CreateEtudiantButton.module.css';

export default function CreateEtudiantButton() {
    return (
        <Link href="/etudiant/ajouter" className={styles.createBtn}>
            + Créer un étudiant
        </Link>
    );
}
