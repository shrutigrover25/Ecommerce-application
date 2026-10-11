const products = [
	{ id: "ridge-pack", name: "Ridge Daypack 18L", category: "Packs", price: 88, oldPrice: null, badge: "BESTSELLER", image: "photo-1553062407-98eeb64c6a62", alt: "Compact olive outdoor backpack", tone: "#d5d5c8" },
	{ id: "trail-shell", name: "Trail Shell Jacket", category: "Apparel", price: 148, oldPrice: null, badge: "NEW COLOR", image: "photo-1551028719-00167b16eac5", alt: "Lightweight jacket ready for the outdoors", tone: "#ddd8c9" },
	{ id: "camp-mug", name: "Camp Mug Set", category: "Accessories", price: 32, oldPrice: 40, badge: "SET OF 2", image: "photo-1514228742587-6b1558fcca3d", alt: "Enamel-style mug for a camp coffee", tone: "#dad6ca" },
	{ id: "weekender", name: "Anywhere Weekender", category: "Packs", price: 118, oldPrice: null, badge: null, image: "photo-1553062407-98eeb64c6a62", alt: "Roomy travel bag in a natural setting", tone: "#d5d5c8", position: "70% center" },
	{ id: "everyday-cap", name: "Everyday Trail Cap", category: "Accessories", price: 38, oldPrice: null, badge: "LOW-KEY ICON", image: "photo-1588850561407-ed78c282e89b", alt: "Everyday cap in a muted outdoor color", tone: "#e1ded3" },
	{ id: "field-fleece", name: "Field Fleece Pullover", category: "Apparel", price: 96, oldPrice: null, badge: null, image: "photo-1551488831-00ddcb6c6bd3", alt: "Cozy fleece layer for a cool morning", tone: "#ddd8cf" },
	{ id: "trail-bottle", name: "Loop Water Bottle", category: "Accessories", price: 42, oldPrice: null, badge: "RECYCLED STEEL", image: "photo-1602143407151-7111542de6e8", alt: "Reusable steel bottle for a day outdoors", tone: "#d8ddd3" },
	{ id: "camp-blanket", name: "Basecamp Blanket", category: "Accessories", price: 74, oldPrice: null, badge: null, image: "photo-1600210492486-724fe5c67fb0", alt: "Soft woven blanket for a night under the stars", tone: "#d4d4c9" }
];

const imageUrl = (id, width = 720) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const cart = new Map();
let activeCategory = "All";
let searchTerm = "";
let sortOrder = "featured";
let toastTimer;

const money = (amount) => `$${amount.toFixed(2)}`;

function getVisibleProducts() {
	const matches = products.filter((product) => {
		const matchesCategory = activeCategory === "All" || product.category === activeCategory;
		const query = searchTerm.trim().toLowerCase();
		const matchesSearch = !query || `${product.name} ${product.category} ${product.badge || ""}`.toLowerCase().includes(query);
		return matchesCategory && matchesSearch;
	});

	if (sortOrder === "price-asc") matches.sort((a, b) => a.price - b.price);
	if (sortOrder === "price-desc") matches.sort((a, b) => b.price - a.price);
	if (sortOrder === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
	return matches;
}

function renderProducts() {
	const visibleProducts = getVisibleProducts();
	productGrid.innerHTML = visibleProducts.map((product, index) => `
		<article class="product-card" style="animation-delay:${Math.min(index * 45, 220)}ms">
			<div class="product-visual" style="background:${product.tone}">
				<img class="product-image" src="${imageUrl(product.image)}" alt="${product.alt}" loading="lazy"${product.position ? ` style="object-position:${product.position}"` : ""}>
				${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
				<button class="product-add" data-add="${product.id}" aria-label="Add ${product.name} to bag"><span aria-hidden="true">+</span><span>Add to bag</span></button>
			</div>
			<div class="product-info"><div><h3 class="product-title">${product.name}</h3><p class="product-category">${product.category}</p></div><div class="product-price">${money(product.price)}${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ""}</div></div>
		</article>`).join("");

	productGrid.hidden = visibleProducts.length === 0;
	emptyState.hidden = visibleProducts.length !== 0;
	document.querySelector("#results-label").textContent = `Showing ${visibleProducts.length} ${visibleProducts.length === 1 ? "item" : "items"}`;
}

function renderCart() {
	const entries = [...cart.entries()];
	const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
	const subtotal = entries.reduce((sum, [id, quantity]) => sum + products.find((product) => product.id === id).price * quantity, 0);
	document.querySelector("#cart-count").textContent = itemCount;
	document.querySelector("#drawer-count").textContent = `(${itemCount})`;
	document.querySelector("#cart-empty").hidden = itemCount > 0;
	document.querySelector("#drawer-footer").hidden = itemCount === 0;
	document.querySelector("#cart-items").innerHTML = entries.map(([id, quantity]) => {
		const product = products.find((item) => item.id === id);
		return `<div class="cart-row"><img src="${imageUrl(product.image, 200)}" alt="" loading="lazy"><div class="cart-row-copy"><strong>${product.name}</strong><small>${product.category}</small><div class="quantity-control"><button data-quantity="${id}" data-change="-1" aria-label="Remove one ${product.name}">−</button><span>${quantity}</span><button data-quantity="${id}" data-change="1" aria-label="Add one ${product.name}">+</button></div></div><span class="cart-row-price">${money(product.price * quantity)}</span></div>`;
	}).join("");
	document.querySelector("#cart-subtotal").textContent = money(subtotal);
	const remaining = Math.max(75 - subtotal, 0);
	document.querySelector("#shipping-message").textContent = remaining ? `You're ${money(remaining)} away from free shipping.` : "You've unlocked free shipping.";
	document.querySelector("#shipping-progress").style.width = `${Math.min(subtotal / 75 * 100, 100)}%`;
}

function showToast(message) {
	const toast = document.querySelector("#toast");
	toast.textContent = message;
	toast.classList.add("is-visible");
	window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function setCartOpen(isOpen) {
	const drawer = document.querySelector("#cart-drawer");
	document.querySelector("#cart-overlay").hidden = !isOpen;
	drawer.classList.toggle("is-open", isOpen);
	drawer.setAttribute("aria-hidden", String(!isOpen));
	document.body.classList.toggle("drawer-active", isOpen);
	if (isOpen) document.querySelector("#close-cart").focus();
}

function setCategory(category) {
	activeCategory = category;
	document.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("is-active", chip.dataset.category === category));
	renderProducts();
}

document.querySelector("#shop").addEventListener("click", (event) => {
	const chip = event.target.closest(".category-chip");
	if (chip) setCategory(chip.dataset.category);
	const addButton = event.target.closest("[data-add]");
	if (addButton) {
		const product = products.find((item) => item.id === addButton.dataset.add);
		cart.set(product.id, (cart.get(product.id) || 0) + 1);
		renderCart();
		showToast(`${product.name} added to your bag`);
	}
	if (event.target.closest("#clear-filters")) {
		activeCategory = "All";
		searchTerm = "";
		document.querySelector("#search-input").value = "";
		setCategory("All");
	}
});

document.querySelectorAll("[data-nav-category]").forEach((link) => link.addEventListener("click", () => setCategory(link.dataset.navCategory)));
document.querySelector("#search-input").addEventListener("input", (event) => { searchTerm = event.target.value; renderProducts(); });
document.querySelector("#sort-select").addEventListener("change", (event) => { sortOrder = event.target.value; renderProducts(); });
document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
document.querySelector("#cart-overlay").addEventListener("click", () => setCartOpen(false));
document.querySelector("#cart-items").addEventListener("click", (event) => {
	const button = event.target.closest("[data-quantity]");
	if (!button) return;
	const id = button.dataset.quantity;
	const updatedQuantity = (cart.get(id) || 0) + Number(button.dataset.change);
	if (updatedQuantity <= 0) cart.delete(id);
	else cart.set(id, updatedQuantity);
	renderCart();
});
document.querySelector("#continue-shopping").addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping-footer").addEventListener("click", () => setCartOpen(false));
document.querySelector("#checkout-button").addEventListener("click", () => showToast("Checkout is coming soon."));
document.querySelector("#menu-toggle").addEventListener("click", (event) => {
	const isOpen = document.querySelector(".main-nav").classList.toggle("is-open");
	event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
document.querySelector("#cart-drawer").addEventListener("keydown", (event) => {
	if (event.key === "Escape") setCartOpen(false);
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") setCartOpen(false);
});

document.querySelector("#product-total").textContent = products.length;
renderProducts();
renderCart();
