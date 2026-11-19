import { AuthUser, Dealer, TeamMember } from '../types';
import { ApiError, dealerContext, http, tokenStore } from './api';

const AUTH_STORAGE_KEY = 'dealer_current_auth_user';
const ORIGINAL_ADMIN_STORAGE_KEY = 'dealer_original_super_admin';

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleKey: 'admin' | 'branch_manager' | 'sales_person' | 'storekeeper';
  branchId?: string | number | null;
}

export const authService = {
  getCurrentUser(): AuthUser | null {
    const token = tokenStore.get();
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!token || !raw) {
      return null;
    }
    try {
      const user: AuthUser = JSON.parse(raw);
      if (user && (user.role as string) === 'owner') {
        user.role = 'dealer';
      }
      return user;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: AuthUser | null) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  async login(
    identifier: string,
    password: string,
    lang: 'sw' | 'en' = 'sw',
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const rawId = identifier.trim();
    const cleanPw = password.trim();
    const isSw = lang === 'sw';

    if (!rawId) {
      return {
        success: false,
        error: isSw
          ? 'Tafadhali ingiza Barua Pepe (Email), Namba ya Simu, au Kitambulisho.'
          : 'Please enter Email, Phone Number, or Account Identifier.',
      };
    }

    if (!cleanPw) {
      return {
        success: false,
        error: isSw
          ? 'Tafadhali ingiza Nenosiri (Password).'
          : 'Please enter your Password.',
      };
    }

    try {
      dealerContext.clear();
      localStorage.removeItem(ORIGINAL_ADMIN_STORAGE_KEY);

      const res = await http.post<{ token: string; user: AuthUser }>('/auth/login', {
        identifier: rawId,
        password: cleanPw,
        device_name: 'dms-web',
      });

      tokenStore.set(res.token);
      this.setCurrentUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      if (err instanceof ApiError) {
        return {
          success: false,
          error: err.field('identifier') || err.field('password') || err.message,
        };
      }
      return {
        success: false,
        error: isSw
          ? 'Imeshindwa kuwasiliana na seva. Tafadhali jaribu tena.'
          : 'Unable to reach the server. Please try again.',
      };
    }
  },

  async fetchMe(): Promise<AuthUser | null> {
    if (!tokenStore.get()) return null;
    try {
      const res = await http.get<{ user: AuthUser }>('/auth/me');
      const existing = this.getCurrentUser();
      if (existing?.isSuperAdminImpersonating && existing.impersonatingDealer) {
        return existing;
      }
      this.setCurrentUser(res.user);
      return res.user;
    } catch {
      return null;
    }
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await http.post('/auth/change-password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
  },

  impersonateDealer(dealer: Dealer): AuthUser {
    const current = this.getCurrentUser();
    if (current && current.role === 'super_admin') {
      localStorage.setItem(ORIGINAL_ADMIN_STORAGE_KEY, JSON.stringify(current));
    }
    dealerContext.set(dealer.id);

    const impersonatedUser: AuthUser = {
      id: `usr-imp-${dealer.id}`,
      name: `${dealer.ownerName} (${dealer.name})`,
      email: dealer.email,
      phone: dealer.phone,
      role: 'dealer',
      dealerCode: dealer.code,
      dealerName: dealer.name,
      isSuperAdminImpersonating: true,
      impersonatingDealer: dealer,
    };
    this.setCurrentUser(impersonatedUser);
    return impersonatedUser;
  },

  revertToSuperAdmin(): AuthUser {
    dealerContext.clear();
    const raw = localStorage.getItem(ORIGINAL_ADMIN_STORAGE_KEY);
    localStorage.removeItem(ORIGINAL_ADMIN_STORAGE_KEY);
    if (raw) {
      try {
        const user = JSON.parse(raw);
        this.setCurrentUser(user);
        return user;
      } catch {
        // fallback
      }
    }
    const fallbackAdmin: AuthUser = {
      id: '1',
      name: 'Super Admin',
      email: 'superadmin@dms.co.tz',
      phone: '',
      role: 'super_admin',
      dealerCode: 'PLATFORM-ROOT',
      dealerName: 'Central Multi-Dealer Platform',
    };
    this.setCurrentUser(fallbackAdmin);
    return fallbackAdmin;
  },

  async createTeamMember(input: CreateTeamMemberInput): Promise<TeamMember> {
    const res = await http.post<{ data: TeamMember }>('/team', {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      roleKey: input.roleKey,
      branchId: input.branchId ? Number(input.branchId) : null,
    });
    return res.data;
  },

  async logout() {
    try {
      if (tokenStore.get()) {
        await http.post('/auth/logout');
      }
    } catch {
      // ignore network error on logout
    } finally {
      tokenStore.clear();
      dealerContext.clear();
      localStorage.removeItem(ORIGINAL_ADMIN_STORAGE_KEY);
      this.setCurrentUser(null);
    }
  },
};
