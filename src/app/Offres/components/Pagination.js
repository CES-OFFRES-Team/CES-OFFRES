import React from 'react';
import styles from '../Offres.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className={styles.pagination}>
            <button 
                className={styles.pageButton}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button 
                className={styles.pageButton}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default Pagination;