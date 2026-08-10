import { PUBLIC_GEOSERVER_URL } from '$env/static/public';

const normalizedGeoserverUrl = PUBLIC_GEOSERVER_URL?.trim().replace(/\/+$/, '');

if (!normalizedGeoserverUrl) {
	throw new Error('PUBLIC_GEOSERVER_URL is not configured');
}

export const geoserverUrl = normalizedGeoserverUrl;
