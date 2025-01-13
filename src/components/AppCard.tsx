import React from 'react';
import { AppData } from '../types';

interface AppCardProps {
  app: AppData;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
    return (
        <div className="app-card">
          <h3>{app.title}</h3>
          <p>{app.description}</p>
          <img src={app.icon} alt={app.title} style={{ maxWidth: '100px' }} />
          <p>Genres: {app.genres.join(", ")}</p>
            {/* Add more details as needed */}
        </div>
      );
};

export default AppCard;
