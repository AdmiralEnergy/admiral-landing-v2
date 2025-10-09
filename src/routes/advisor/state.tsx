import React, { createContext, useContext, useEffect, useReducer } from 'react';

export type AdvisorState = {
  zip: string;
  utility: string;
  hoa: boolean;

  avgBill: number | null;
  kwh?: number | null;
  ratePlan?: 'flat' | 'tou' | 'unknown';

  roofType?: 'asphalt' | 'metal' | 'tile' | 'other';
  shade?: 'none' | 'some' | 'heavy';
  batteryInterest?: 'yes' | 'no' | 'maybe';

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  utm?: Record<string, string> | null;
};

const STORAGE_KEY = 'advisor:v1';

const initialState: AdvisorState = {
  zip: '',
  utility: 'Other',
  hoa: false,

  avgBill: null,
  kwh: null,
  ratePlan: 'unknown',

  roofType: 'asphalt',
  shade: 'none',
  batteryInterest: 'no',

  firstName: '',
  lastName: '',
  email: '',
  phone: '',

  utm: null,
};

type Action = { type: 'patch'; payload: Partial<AdvisorState> } | { type: 'reset' } | { type: 'hydrate'; payload: AdvisorState };

function reducer(state: AdvisorState, action: Action): AdvisorState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.payload };
    case 'reset':
      return initialState;
    case 'hydrate':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AdvisorContext = createContext<{
  state: AdvisorState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AdvisorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'hydrate', payload: parsed });
      }
      const search = typeof window !== 'undefined' ? window.location.search : '';
      if (search) {
        const params = new URLSearchParams(search);
        const utm: Record<string, string> = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
          const v = params.get(k);
          if (v) utm[k] = v;
        });
        if (Object.keys(utm).length) {
          dispatch({ type: 'patch', payload: { utm } });
        }
      }
    } catch (e) {
      // noop
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // noop
    }
  }, [state]);

  return (<AdvisorContext.Provider value={{ state, dispatch }}>{children}</AdvisorContext.Provider>);
}

export function useAdvisor() {
  const ctx = useContext(AdvisorContext);
  if (!ctx) throw new Error('useAdvisor must be used within AdvisorProvider');
  return ctx;
}

export function resetAdvisorLocal() {
  localStorage.removeItem(STORAGE_KEY);
}
