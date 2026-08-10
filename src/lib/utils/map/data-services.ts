import { PUBLIC_S3_BUCKET_URL, PUBLIC_TITILER_URL } from '$env/static/public';

const normalizedS3BucketUrl = PUBLIC_S3_BUCKET_URL.trim().replace(/\/+$/, '');
const normalizedTitilerUrl = PUBLIC_TITILER_URL.trim().replace(/\/+$/, '');

if (!normalizedS3BucketUrl) {
	throw new Error('PUBLIC_S3_BUCKET_URL is not configured');
}

if (!normalizedTitilerUrl) {
	throw new Error('PUBLIC_TITILER_URL is not configured');
}

export const s3BucketUrl = normalizedS3BucketUrl;
export const titilerUrl = normalizedTitilerUrl;
