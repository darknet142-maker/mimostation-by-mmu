import { useNavigate } from 'react-router-dom';

/**
 * Retourne à l'écran précédent dans l'historique React Router si disponible,
 * sinon redirige vers `fallbackTo` pour éviter un bouton muet en accès direct.
 */
export function useSafeBack(fallbackTo: string): () => void {
  const navigate = useNavigate();

  return () => {
    const historyIdx =
      typeof window !== 'undefined' &&
      window.history.state &&
      typeof window.history.state.idx === 'number'
        ? window.history.state.idx
        : 0;

    if (historyIdx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };
}
