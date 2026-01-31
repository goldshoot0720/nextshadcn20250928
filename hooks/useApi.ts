"use client";

import { useState, useCallback } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// 通用 fetch 函數
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // 檢查是否真的是 collection not found
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error && (errorData.error.includes('could not be found') || errorData.error.includes('not found'))) {
        // Extract table name from URL
        let tableName = url.split('/api/')[1]?.split('/')[0] || 'table';
        // Convert common-account to commonaccount
        if (tableName === 'common-account') {
          tableName = 'commonaccount';
        }
        throw new Error(`Table ${tableName} 不存在，請至「鋒兄設定」中初始化。`);
      }
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// CRUD 操作 hooks
export function useCrud<T extends { $id: string }>(baseUrl: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<T[]>(baseUrl, { cache: "no-store" });
      setItems(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"));
      return [];
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const create = useCallback(
    async (item: Omit<T, "$id">): Promise<T | null> => {
      try {
        const newItem = await fetchApi<T>(baseUrl, {
          method: "POST",
          body: JSON.stringify(item),
        });
        setItems((prev) => [...prev, newItem]);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Create failed"));
        return null;
      }
    },
    [baseUrl]
  );

  const update = useCallback(
    async (id: string, item: Partial<T>): Promise<T | null> => {
      try {
        const updatedItem = await fetchApi<T>(`${baseUrl}/${id}`, {
          method: "PUT",
          body: JSON.stringify(item),
        });
        setItems((prev) =>
          prev.map((i) => (i.$id === id ? updatedItem : i))
        );
        return updatedItem;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Update failed"));
        return null;
      }
    },
    [baseUrl]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
        setItems((prev) => prev.filter((i) => i.$id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Delete failed"));
        return false;
      }
    },
    [baseUrl]
  );

  return {
    items,
    setItems,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  };
}
