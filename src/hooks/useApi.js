import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook genérico para consumir funciones asíncronas del backend.
 * Gestiona estados de loading, error y data automáticamente.
 *
 * @param {Function} fetchFn  - Función que devuelve una promesa con los datos.
 * @param {Array}    deps     - Dependencias que disparan una recarga (como useEffect).
 * @param {boolean}  immediate - Si true (default), ejecuta la función al montar.
 *
 * @returns {{ data, loading, error, refetch }}
 */
export function useApi(fetchFn, deps = [], immediate = true) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)

  // Evita actualizar state en componentes desmontados
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(...args)
      if (mountedRef.current) {
        setData(result)
        setError(null)
      }
      return result
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Error desconocido')
        setData(null)
      }
      throw err
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])

  return { data, loading, error, refetch: execute }
}
