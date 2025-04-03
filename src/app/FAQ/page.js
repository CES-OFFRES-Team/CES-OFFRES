'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './FAQ.module.css';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
            <button 
                className={styles.faqQuestion} 
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {question}
                <i className="fas fa-chevron-down" aria-hidden="true" />
            </button>
            <div className={styles.faqAnswer} role="region">
                {answer}
            </div>
        </div>
    );
};

const FAQ = () => {
    const faqData = [
        {
            question: "Comment postuler à une offre de stage ?",
            answer: "Pour postuler à une offre de stage, connectez-vous à votre compte, consultez les offres disponibles et cliquez sur le bouton 'Postuler' de l'offre qui vous intéresse. Vous pourrez ensuite soumettre votre CV et votre lettre de motivation."
        },
        {
            question: "Comment créer un compte étudiant ?",
            answer: (
                <>
                    Pour créer un compte étudiant, deux options s'offrent à vous :
                    <ul className={styles.faqList}>
                        <li>Contactez votre pilote CESI qui pourra initier la création de votre compte.</li>
                        <li>
                            Faites une demande via notre <Link href="/Contact" className={styles.faqLink}>page de contact</Link>.
                            Après vérification de votre statut d'étudiant CESI, vous recevrez vos identifiants 
                            soit par l'intermédiaire de votre pilote, soit directement par email.
                        </li>
                    </ul>
                </>
            )
        },
        {
            question: "Comment les entreprises peuvent-elles publier une offre ?",
            answer: "Les offres de stage sont publiées exclusivement par les pilotes CESI. Si vous êtes une entreprise partenaire, votre pilote référent se chargera de publier vos offres. Pour les entreprises non partenaires souhaitant publier une offre, nous vous invitons à contacter un pilote CESI qui étudiera votre demande et publiera l'offre après validation."
        },
        {
            question: "Puis-je modifier mon profil après l'inscription ?",
            answer: "Oui, vous pouvez modifier votre profil à tout moment. Connectez-vous à votre compte et accédez à la section 'Mon Profil' pour mettre à jour vos informations personnelles, votre CV et vos préférences."
        },
        {
            question: "Comment contacter le support ?",
            answer: "Pour toute question ou assistance, vous pouvez nous contacter via le formulaire de contact disponible sur le site ou envoyer un email à support@cesoffres.fr. Notre équipe vous répondra dans les plus brefs délais."
        },
        {
            question: "Les offres sont-elles vérifiées ?",
            answer: "Oui, toutes les offres publiées sur CES'Offres sont vérifiées par notre équipe pour garantir leur légitimité et leur conformité avec nos conditions d'utilisation et les réglementations en vigueur."
        }
    ];

    return (
        <div className={styles.faqContainer}>
            <div className={styles.faqHeader}>
                <h1>Foire Aux Questions</h1>
                <p>Trouvez rapidement des réponses à vos questions</p>
            </div>

            <div className={styles.faqContent}>
                {faqData.map((faq, index) => (
                    <FAQItem 
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                    />
                ))}
            </div>
        </div>
    );
};

export default FAQ;