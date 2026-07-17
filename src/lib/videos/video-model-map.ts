import mapData from '@/config/video-model-map.json'

/**
 * A curated (human-validated) video to feature on a model page. The mapping is
 * populated in src/config/video-model-map.json AFTER manually reviewing
 * audits/video-model-mapping.csv (produced by scripts/map-videos-to-models.ts).
 * Keyed by model id at render time. Empty until validated — so this is a no-op
 * on every model page today, fully backward-compatible.
 */
export interface MappedVideo {
  /** vehicles_new.model_id / models.id (UUID) — the render-time join key. */
  modelId: string
  /** The watch/share URL (videos.video_url). */
  videoUrl: string
  title: string
  thumbnailUrl?: string | null
  duration?: string | null
  uploadDate?: string | null
  /** Human reference only (not used at render). */
  brand?: string
  model?: string
}

interface VideoModelMap {
  mappings: MappedVideo[]
}

const data = mapData as VideoModelMap

/** Pure filter — the testable core of getMappedVideosForModel. */
export function selectMappedVideos(mappings: MappedVideo[], modelId: string): MappedVideo[] {
  if (!modelId) return []
  return mappings.filter((m) => m.modelId === modelId)
}

/** Curated videos to feature on the given model's page (empty until validated). */
export function getMappedVideosForModel(modelId: string): MappedVideo[] {
  return selectMappedVideos(data.mappings ?? [], modelId)
}
