import React from 'react';

export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card" id={`skeleton-loader-${idx}`}>
          <div className="skeleton-shimmer" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-60" />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div className="skeleton-line w-20" />
            <div className="skeleton-line w-20" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <div className="skeleton-line w-20" style={{ height: '18px', borderRadius: '50%' }} />
            <div className="skeleton-line w-40" />
          </div>
        </div>
      ))}
    </>
  );
};
