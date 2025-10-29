import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      mot_de_passe: password
    });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Configuration globale d'axios
axios.defaults.baseURL = API_BASE_URL;

// Intercepteur pour ajouter le token d'authentification
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services pour les cours
export const coursService = {
  getAll: () => axios.get('/cours'),
  create: (coursData) => axios.post('/cours', coursData),
  update: (id, coursData) => axios.put(`/cours/${id}`, coursData),
  delete: (id) => axios.delete(`/cours/${id}`)
};

// Services pour les utilisateurs
export const usersService = {
  getProfile: () => axios.get('/utilisateurs/profile'),
  getAll: () => axios.get('/utilisateurs')
};

// Services pour les facultés
export const facultesService = {
  getAll: () => axios.get('/facultes'),
  getById: (id) => axios.get(`/facultes/${id}`)
};

// Services pour les départements
export const departementsService = {
  getAll: () => axios.get('/departements'),
  getByFaculte: (faculteId) => axios.get(`/facultes/${faculteId}/departements`)
};

// Services pour les filières
export const filieresService = {
  getAll: () => axios.get('/filieres'),
  getByDepartement: (departementId) => axios.get(`/departements/${departementId}/filieres`)
};

// Services pour les salles
export const sallesService = {
  getAll: (filters = {}) => axios.get('/salles', { params: filters }),
  checkDisponibilite: (id, dateDebut, dateFin) => 
    axios.get(`/salles/${id}/disponibilite`, { 
      params: { date_debut: dateDebut, date_fin: dateFin } 
    })
};

// Services pour les enseignants
export const enseignantsService = {
  getAll: () => axios.get('/enseignants')
};

// Services pour les matières
export const matieresService = {
  getByFiliere: (filiereId) => axios.get(`/filieres/${filiereId}/matieres`)
};

// Services pour les statistiques
export const statistiquesService = {
  getDashboard: () => axios.get('/statistiques')
};

// Services pour les publications
export const publicationsService = {
  getAll: (filters = {}) => axios.get('/publications', { params: filters })
};

export default {
  cours: coursService,
  users: usersService,
  facultes: facultesService,
  departements: departementsService,
  filieres: filieresService,
  salles: sallesService,
  enseignants: enseignantsService,
  matieres: matieresService,
  statistiques: statistiquesService,
  publications: publicationsService
};    localStorage.removeItem('user');
  }
};

export const userService = {
  getUsers: async () => {
    const response = await api.get('/utilisateurs');
    return response.data;
  }
};

export const faculteService = {
  getFacultes: async () => {
    const response = await api.get('/facultes');
    return response.data;
  }
};

export const departementService = {
  getDepartements: async () => {
    const response = await api.get('/departements');
    return response.data;
  }
};

export const salleService = {
  getSalles: async () => {
    const response = await api.get('/salles');
    return response.data;
  }
};

export default api;
