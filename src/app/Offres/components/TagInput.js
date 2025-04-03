import React, { useState } from 'react';
import styles from '../Offres.module.css';

const TagInput = ({ label, values, onChange, options, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = inputValue.trim();
            if (value && options.includes(value) && !values.includes(value)) {
                onChange([...values, value]);
                setInputValue('');
                setIsOpen(false);
            }
        }
    };

    const removeValue = (valueToRemove) => {
        onChange(values.filter(v => v !== valueToRemove));
    };

    const filteredOptions = options.filter(
        option => !values.includes(option) && 
        option.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{label}</label>
            <div className={styles.filterInputContainer}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder={placeholder}
                    className={styles.filterInput}
                    onKeyDown={handleKeyDown}
                />
                {isOpen && filteredOptions.length > 0 && (
                    <div className={styles.optionsList}>
                        {filteredOptions.map((option) => (
                            <div
                                key={option}
                                className={styles.optionItem}
                                onClick={() => {
                                    onChange([...values, option]);
                                    setInputValue('');
                                    setIsOpen(false);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {values.length > 0 && (
                <div className={styles.selectedValue}>
                    {values.map((value) => (
                        <span key={value} className={styles.themeTag}>
                            {value}
                            <button
                                onClick={() => removeValue(value)}
                                className={styles.removeTheme}
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

export default TagInput;