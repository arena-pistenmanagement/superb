export default function getMobileDevice(): boolean {
	const userAgent = navigator.userAgent || navigator.vendor;
	const isMobile =
		/android|webos|iphone|ipad|ipod|blackberry|iemobile|mobile|opera mini/i.test(userAgent) ||
		window.innerWidth < 1023;

	// Check if the user agent string indicates a mobile device
	return isMobile;
}
