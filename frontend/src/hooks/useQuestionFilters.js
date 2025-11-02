import { useReducer, useCallback } from 'react';

const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.payload.key]: action.payload.value, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'RESET_FILTERS':
      return { page: 1, limit: 10 };
    default:
      return state;
  }
};

export const useQuestionFilters = (initialState = { page: 1, limit: 10 }) => {
  const [filters, dispatch] = useReducer(filterReducer, initialState);

  const handleFilterChange = useCallback((key, value) => {
    dispatch({ type: 'SET_FILTER', payload: { key, value } });
  }, []);

  const handlePageChange = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  return {
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  };
};
