import React from 'react';
import styles from '../Offres.module.css';

const DateRangeFilter = ({ periode = { debut: '', fin: '' }, onChange }) => {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Période du stage</label>
            <div className={styles.dateRangeContainer}>
                <input
                    type="date"
                    value={periode.debut}
                    min={today}
                    onChange={(e) => {
                        const newDebut = e.target.value;
                        onChange({
                            debut: newDebut,
                            fin: periode.fin && newDebut > periode.fin ? newDebut : periode.fin
                        });
                    }}
                    className={styles.dateInput}
                />

                <span className={styles.dateSeparator}>au</span>

                <input
                    type="date"
                    value={periode.fin}
                    min={periode.debut || today}
                    onChange={(e) => {
                        onChange({
                            debut: periode.debut,
                            fin: e.target.value
                        });
                    }}
                    className={styles.dateInput}
                />
            </div>
        </div>
    );
};

export default DateRangeFilter;