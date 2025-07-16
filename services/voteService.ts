import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../constants/config';

export interface Vote {
  id: number;
  battleId: number;
  userId: number;
  votedEntityId: number;
  createdAt: string;
  updatedAt: string;
  Battle?: {
    id: number;
    title: string;
    status: string;
  };
  VotedEntity?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface VoteStats {
  battleId: number;
  totalVotes: number;
  entity1: {
    id: number;
    name: string;
    votes: number;
    percentage: number;
  };
  entity2: {
    id: number;
    name: string;
    votes: number;
    percentage: number;
  };
}

export interface CreateVoteRequest {
  battleId: number;
  votedEntityId: number;
}

export interface UpdateVoteRequest {
  votedEntityId: number;
}

export interface VotesResponse {
  success: boolean;
  data: {
    votes: Vote[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface VoteStatsResponse {
  success: boolean;
  data: VoteStats;
}

export interface SingleVoteResponse {
  success: boolean;
  data: Vote;
  message?: string;
}

class VoteService {
  private baseURL = `${API_BASE_URL}/votes`;

  private async getAuthHeaders() {
    const token = await getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Créer un nouveau vote
   */
  async createVote(voteData: CreateVoteRequest): Promise<SingleVoteResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post<SingleVoteResponse>(
        this.baseURL,
        voteData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la création du vote:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer la liste des votes avec pagination
   */
  async getVotes(params?: {
    page?: number;
    limit?: number;
    battleId?: number;
    userId?: number;
    entityId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<VotesResponse> {
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

      const response = await axios.get<VotesResponse>(
        `${this.baseURL}?${queryParams.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des votes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer un vote par son ID
   */
  async getVoteById(voteId: number): Promise<SingleVoteResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get<SingleVoteResponse>(
        `${this.baseURL}/${voteId}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du vote:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mettre à jour un vote
   */
  async updateVote(voteId: number, updateData: UpdateVoteRequest): Promise<SingleVoteResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put<SingleVoteResponse>(
        `${this.baseURL}/${voteId}`,
        updateData,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du vote:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprimer un vote
   */
  async deleteVote(voteId: number): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete<{ success: boolean; message: string }>(
        `${this.baseURL}/${voteId}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la suppression du vote:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer les statistiques de votes pour une bataille
   */
  async getBattleVoteStats(battleId: number): Promise<VoteStatsResponse> {
    try {
      // Cette route est publique, pas besoin d'authentification
      const response = await axios.get<VoteStatsResponse>(
        `${this.baseURL}/stats/${battleId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer l'historique des votes d'un utilisateur
   */
  async getUserVotes(userId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<VotesResponse> {
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

      const response = await axios.get<VotesResponse>(
        `${this.baseURL}/user/${userId}?${queryParams.toString()}`,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des votes utilisateur:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Vérifier si l'utilisateur a déjà voté pour une bataille
   */
  async hasUserVoted(battleId: number, userId: number): Promise<boolean> {
    try {
      const response = await this.getVotes({ battleId, userId, limit: 1 });
      return response.data.votes.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du vote:', error);
      return false;
    }
  }

  /**
   * Récupérer le vote de l'utilisateur pour une bataille spécifique
   */
  async getUserVoteForBattle(battleId: number, userId: number): Promise<Vote | null> {
    try {
      const response = await this.getVotes({ battleId, userId, limit: 1 });
      return response.data.votes.length > 0 ? response.data.votes[0] : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du vote utilisateur:', error);
      return null;
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

export const voteService = new VoteService();
export default voteService;
