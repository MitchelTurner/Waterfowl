import { useCallback, useEffect, useState } from 'react';
import type { AppInputs } from '../types';
import { applyInputPatch, parseInputs, roundCentsPrice, serializeInputs } from './urlState';

export function useUrlState() {
  const [inputs, setInputs] = useState<AppInputs>(() => parseInputs(window.location.search));

  useEffect(() => {
    const query = serializeInputs(inputs);
    const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
      window.history.replaceState(null, '', next);
    }
  }, [inputs]);

  useEffect(() => {
    const onPop = () => setInputs(parseInputs(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const update = useCallback((patch: Partial<AppInputs>) => {
    setInputs((prev) => applyInputPatch(prev, patch));
  }, []);

  const setPrice = useCallback((loadId: string, price: number | null) => {
    setInputs((prev) => {
      const priceOverrides = { ...prev.priceOverrides };
      if (price === null || !Number.isFinite(price) || price < 0) {
        delete priceOverrides[loadId];
      } else {
        priceOverrides[loadId] = roundCentsPrice(price);
      }
      return { ...prev, priceOverrides };
    });
  }, []);

  const clearPrices = useCallback(() => {
    setInputs((prev) => ({ ...prev, priceOverrides: {} }));
  }, []);

  return { inputs, update, setPrice, clearPrices };
}
