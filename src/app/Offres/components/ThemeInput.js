import React, { useState } from 'react';
import styles from '../Offres.module.css';

const ThemeInput = ({ themes, onThemesChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newTheme = inputValue.trim().toLowerCase();
            if (!themes.includes(newTheme)) {
                onThemesChange([...themes, newTheme]);
            }
            setInputValue('');
        }
    };

    const removeTheme = (themeToRemove) => {
        onThemesChange(themes.filter(theme => theme !== themeToRemove));
    };

    return (
        <div className={styles.themeInputContainer}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher des thèmes"
                className={styles.themeInput}
            />
            {themes.length > 0 && (
                <div className={styles.themesList}>
                    {themes.map((theme) => (
                        <span key={theme} className={styles.themeTag}>
                            {theme}
                            <button
                                onClick={() => removeTheme(theme)}
                                className={styles.removeTheme}
                                aria-label={`Supprimer ${theme}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeInput;