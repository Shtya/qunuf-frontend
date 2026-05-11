'use client';

import React from 'react';

type ErrorProps = {
    error: Error;
    reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Something went wrong </h1>
            <p>{error.message}</p>
            <button
                onClick={reset}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Try again
            </button>
        </div>
    );
}
