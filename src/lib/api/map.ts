import { apiFetch } from "./http";
import { buildQuery } from "./query";
import type { CityAgg, Paginated, StateAgg } from "./types";

export async function listStates(revalidate = 300) {
  return apiFetch<StateAgg[]>(`/map/states`, { next: { revalidate } });
}

export async function getStateDetail(state: string, revalidate = 300) {
  return apiFetch<{ state: string; cities: CityAgg[] }>(
    `/map/states/${encodeURIComponent(state)}`,
    { next: { revalidate } }
  );
}

export async function listCities(
  params: { cursor?: string; limit?: number } = {},
  revalidate = 300
) {
  return apiFetch<Paginated<CityAgg>>(`/map/cities${buildQuery(params)}`, {
    next: { revalidate },
  });
}

export async function getCityDetail(city: string, revalidate = 300) {
  return apiFetch<CityAgg>(`/map/cities/${encodeURIComponent(city)}`, {
    next: { revalidate },
  });
}
