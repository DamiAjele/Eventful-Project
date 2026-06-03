import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      // Set cookies for middleware
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      document.cookie = `userRole=${data.user.role}; path=/`;
      toast.success('Login successful!');
      router.push(data.user.role === 'CREATOR' ? '/creator' : '/eventee');
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Login failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      // Set cookies for middleware
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      document.cookie = `userRole=${data.user.role}; path=/`;
      toast.success('Account created successfully!');
      router.push(data.user.role === 'CREATOR' ? '/creator' : '/eventee');
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
};
