import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../constants/config';

export interface Battle {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  entity1Id: number;
  entity2Id: number;
  Entity1?: {
    id: number;
    name: string;
    type: string;
    description?: string;
    imageUrl?: string;
  };
  Entity2?: {
    id: number;
    name: string;
    type: string;
    description?: string;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  creatorId?: number;
}

export interface CreateBattleRequest {
  title: string;
  description?: string;
  entity1Id: number;
  entity2Id: number;
  startDate: string;
  endDate: string;
}

export interface UpdateBattleRequest {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'pending';
  endDate?: string;
}

export interface BattlesResponse {
  success: boolean;
  data: {
    battles: Battle[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface SingleBattleResponse {
  success: boolean;
  data: Battle;
  message?: string;
}

class BattleService {
  private baseURL = `${API_BASE_URL}/battles`;

  private async getAuthHeaders() {
    const token = await getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Récupérer toutes les batailles avec pagination
   */
  async getBattles(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<BattlesResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await axios.get<BattlesResponse>(
        `${this.baseURL}?${queryParams.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des batailles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer une bataille par son ID
   */
  async getBattleById(battleId: number): Promise<SingleBattleResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<SingleBattleResponse>(
        `${this.baseURL}/${battleId}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la bataille:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Créer une nouvelle bataille
   */
  async createBattle(battleData: CreateBattleRequest): Promise<SingleBattleResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post<SingleBattleResponse>(
        this.baseURL,
        battleData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création de la bataille:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mettre à jour une bataille
   */
  async updateBattle(battleId: number, updateData: UpdateBattleRequest): Promise<SingleBattleResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put<SingleBattleResponse>(
        `${this.baseURL}/${battleId}`,
        updateData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la bataille:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprimer une bataille
   */
  async deleteBattle(battleId: number): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete<{ success: boolean; message: string }>(
        `${this.baseURL}/${battleId}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la bataille:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer les batailles actives
   */
  async getActiveBattles(params?: {
    page?: number;
    limit?: number;
  }): Promise<BattlesResponse> {
    return this.getBattles({
      ...params,
      status: 'active'
    });
  }

  /**
   * Récupérer les batailles terminées
   */
  async getCompletedBattles(params?: {
    page?: number;
    limit?: number;
  }): Promise<BattlesResponse> {
    return this.getBattles({
      ...params,
      status: 'completed'
    });
  }

  /**
   * Rechercher des batailles par titre
   */
  async searchBattles(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<BattlesResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      queryParams.append('search', query);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await axios.get<BattlesResponse>(
        `${this.baseURL}/search?${queryParams.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la recherche de batailles:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Erreur de réponse du serveur
      const message = error.response.data?.message || 'Une erreur est survenue';
      return new Error(message);
    } else if (error.request) {
      // Erreur de réseau
      return new Error('Erreur de connexion au serveur');
    } else {
      // Autre erreur
      return new Error(error.message || 'Une erreur inattendue est survenue');
    }
  }
}

export const battleService = new BattleService();
export default battleService;
