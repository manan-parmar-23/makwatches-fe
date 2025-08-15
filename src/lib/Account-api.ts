const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

async function parseRes(res: Response) {
	// Try to parse JSON, fallback to empty object
	try {
		const body = await res.json();
		return { res, body };
	} catch {
		return { res, body: null };
	}
}

export async function getAccountOverview(authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/account/overview`, { headers: authHeaders, credentials: "include" });
	return await parseRes(r);
}

export async function getProfile(authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/profiles/`, { headers: authHeaders, credentials: "include" });
	return await parseRes(r);
}

export async function getWishlist(authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/account/wishlist`, { headers: authHeaders, credentials: "include" });
	return await parseRes(r);
}

export async function getOrders(authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/account/orders`, { headers: authHeaders, credentials: "include" });
	return await parseRes(r);
}

export async function getOrdersByUserId(userId: string, authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/orders/user/${userId}`, { headers: authHeaders, credentials: "include" });
	return await parseRes(r);
}

export async function getReviews(authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/account/reviews`, { headers: authHeaders, credentials: "include" });
	return await parseRes(r);
}

export async function updateProfile(body: Record<string, unknown>, authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/profiles/`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", ...(authHeaders || {}) },
		credentials: "include",
		body: JSON.stringify(body),
	});
	return await parseRes(r);
}

export async function updatePreferences(body: Record<string, unknown>, authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/preferences/`, {
		method: "PUT",
		headers: { "Content-Type": "application/json", ...(authHeaders || {}) },
		credentials: "include",
		body: JSON.stringify(body),
	});
	return await parseRes(r);
}

export async function deleteReviewApi(reviewId: string, authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/account/reviews/${reviewId}`, {
		method: "DELETE",
		headers: authHeaders || {},
		credentials: "include",
	});
	return await parseRes(r);
}

export async function removeFromWishlistApi(wishlistId: string, authHeaders?: HeadersInit) {
	const r = await fetch(`${API_BASE}/account/wishlist/${wishlistId}`, {
		method: "DELETE",
		headers: authHeaders || {},
		credentials: "include",
	});
	return await parseRes(r);
}
