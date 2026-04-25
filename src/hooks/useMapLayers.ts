import { useMapContext } from '../context/MapContext'
import { LAYERS, CATEGORIAS } from '../config/layers.config'
import type { Categoria, LayerConfig } from '../types'

export function useMapLayers() {
  const { state, isLayerActive, toggleLayer, setLayerOpacity, getLayerOpacity } = useMapContext()

  const layersByCategory = (categoria: Categoria): LayerConfig[] =>
    LAYERS.filter(l => l.categoria === categoria)

  const activeLayers = LAYERS.filter(l => isLayerActive(l.id))

  const activeLayersByCategory = (categoria: Categoria) =>
    activeLayers.filter(l => l.categoria === categoria)

  const countByCategory = (categoria: Categoria) =>
    activeLayersByCategory(categoria).length

  const toggleCategory = (categoria: Categoria) => {
    const layers = layersByCategory(categoria)
    const allActive = layers.every(l => isLayerActive(l.id))
    layers.forEach(l => {
      const active = isLayerActive(l.id)
      if (allActive && active) toggleLayer(l.id)
      else if (!allActive && !active) toggleLayer(l.id)
    })
  }

  const isCategoryFullyActive = (categoria: Categoria) =>
    layersByCategory(categoria).every(l => isLayerActive(l.id))

  const isCategoryPartiallyActive = (categoria: Categoria) => {
    const layers = layersByCategory(categoria)
    const activeCount = layers.filter(l => isLayerActive(l.id)).length
    return activeCount > 0 && activeCount < layers.length
  }

  return {
    layers: LAYERS,
    categorias: CATEGORIAS,
    capasActivas: state.capasActivas,
    activeLayers,
    isLayerActive,
    toggleLayer,
    toggleCategory,
    isCategoryFullyActive,
    isCategoryPartiallyActive,
    layersByCategory,
    activeLayersByCategory,
    countByCategory,
    setLayerOpacity,
    getLayerOpacity,
  }
}
