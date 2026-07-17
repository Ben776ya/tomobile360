import { describe, it, expect } from 'vitest'
import {
  selectMappedVideos,
  getMappedVideosForModel,
  type MappedVideo,
} from '../video-model-map'

const sample: MappedVideo[] = [
  { modelId: 'm1', videoUrl: 'https://youtu.be/aaa', title: 'A' },
  { modelId: 'm2', videoUrl: 'https://youtu.be/bbb', title: 'B' },
  { modelId: 'm1', videoUrl: 'https://youtu.be/ccc', title: 'C' },
]

describe('selectMappedVideos', () => {
  it('returns every mapping for the given model id', () => {
    expect(selectMappedVideos(sample, 'm1').map((v) => v.title)).toEqual(['A', 'C'])
    expect(selectMappedVideos(sample, 'm2').map((v) => v.title)).toEqual(['B'])
  })

  it('returns an empty array for an unknown or empty model id', () => {
    expect(selectMappedVideos(sample, 'nope')).toEqual([])
    expect(selectMappedVideos(sample, '')).toEqual([])
  })
})

describe('getMappedVideosForModel (bound to the committed config)', () => {
  it('is empty until the config is populated post-validation', () => {
    // The committed config ships empty, so no model has a curated video yet.
    expect(getMappedVideosForModel('any-model-id')).toEqual([])
  })
})
