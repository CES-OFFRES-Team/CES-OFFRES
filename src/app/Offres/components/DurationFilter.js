import React from 'react';
import styles from '../Offres.module.css';

const DurationFilter = ({ value, onChange }) => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Durée du stage (en mois)</label>
            <div className={styles.durationContainer}>
                <div className={styles.durationInputGroup}>
                    <select
                        value={value.min}
                        onChange={(e) => onChange({ 
                            ...value, 
                            min: e.target.value,
                            max: e.target.value > value.max ? e.target.value : value.max
                        })}
                        className={styles.durationSelect}
                    >
                        <option value="">Min</option>
                        {months.map(month => (
                            <option 
                                key={`min-${month}`} 
                                value={month}
                                disabled={value.max && month > parseInt(value.max)}
                            >
                                {month}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.durationSeparator}>à</div>

                <div className={styles.durationInputGroup}>
                    <select
                        value={value.max}
                        onChange={(e) => onChange({ 
                            ...value, 
                            max: e.target.value,
                            min: e.target.value < value.min ? e.target.value : value.min
                        })}
                        className={styles.durationSelect}
                    >
                        <option value="">Max</option>
                        {months.map(month => (
                            <option 
                                key={`max-${month}`} 
                                value={month}
                                disabled={value.min && month < parseInt(value.min)}
                            >
                                {month}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default DurationFilter;