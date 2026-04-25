import { useMapContext } from '../context/MapContext'
import { LAYERS, CATEGORIAS } from '../config/layers.config'
import type { Categoria, LayerConfig } from '../types'

export function useMapLayers() {
  const { state, isLayerActive, toggleLayer } = useMapContext()

  const layersByCategory = (categoria: Categoria): LayerConfig[] =>
    LAYERS.filter(l => l.categoria === categoria)

  const activeLayers = LAYERS.filter(l => isLayerActive(l.id))

  const activeLayersByCategory = (categoria: Categoria) =>
    activeLayers.filter(l => l.categoria === categoria)

  const countByCategory = (categoria: Categoria) =>
    activeLayersByCategory(categoria).length

  return {
    layers: LAYERS,
    categorias: CATEGORIAS,
    capasActivas: state.capasActivas,
    activeLayers,
    isLayerActive,
    toggleLayer,
    layersByCategory,
    activeLayersByCategory,
    countByCategory,
  }
}
