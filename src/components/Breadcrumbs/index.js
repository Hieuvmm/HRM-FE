import React from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

const Breadcrumbs = ({ items, maxItems = 4 }) => {
    const displayedItems = items.length > maxItems 
        ? [
            ...items.slice(0, 1), // First item
            { caption: '...', routerLink: '#' }, // Ellipsis
            ...items.slice(-2) // Last 2 items
          ]
        : items;

    return (
        <div className="breadcrumbs-container">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    {displayedItems.map((item, index) => (
                        <li 
                            key={index} 
                            className={`breadcrumb-item ${
                                index === displayedItems.length - 1 ? 'active' : ''
                            }`}
                        >
                            {index === displayedItems.length - 1 ? (
                                <span>{item.caption}</span>
                            ) : (
                                <Link to={item.routerLink}>{item.caption}</Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumbs; 