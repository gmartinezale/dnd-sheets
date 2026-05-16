import type { ResourcePool, RestType } from '../types/resources';

/**
 * Returns resources that reset on the given rest type.
 * Short rest resets: short_rest resources
 * Long rest resets: short_rest + long_rest resources (long rest includes all)
 */
export function getResettingResources(
  resources: ResourcePool[],
  restType: RestType,
): ResourcePool[] {
  if (restType === 'long') {
    return resources.filter(
      (r) => r.resetOn === 'short_rest' || r.resetOn === 'long_rest',
    );
  }
  return resources.filter((r) => r.resetOn === 'short_rest');
}

/**
 * Resets a resource to its maximum value.
 */
export function resetResource(resource: ResourcePool): ResourcePool {
  return { ...resource, current: resource.maximum };
}
