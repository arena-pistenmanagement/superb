import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
	try {
		const fileName = request.url.searchParams.get('fileName');
		if (!fileName) {
			throw error(400, 'Missing fileName parameter');
		}

		const filePath = path.join(process.cwd(), 'static', fileName);
		const fileContent = await fs.readFile(filePath);

		return new Response(fileContent, {
			headers: {
				'Content-Type': 'image/png'
			}
		});
	} catch (err) {
		console.error('Error reading png file:', err);
		throw error(500, 'Failed to load png');
	}
}
