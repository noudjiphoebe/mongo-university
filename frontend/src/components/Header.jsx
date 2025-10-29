import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            🎓 Université de Mongo
          </div>
          <ul className="nav-links">
            {user ? (
              <>
                <li><Link to="/">Tableau de bord</Link></li>
                <li><Link to="/utilisateurs">Utilisateurs</Link></li>
                <li><Link to="/salles">Salles</Link></li>
                <li><Link to="/facultes">Facultés</Link></li>
                <li>
                  <span>Bienvenue, {user.prenom}</span>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      marginLeft: '1rem',
                      background: 'transparent',
                      border: '1px solid white'
                    }}
                    className="btn"
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login">Connexion</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
