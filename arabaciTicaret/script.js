let products = JSON.parse(localStorage.getItem("products")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

// Son Eklenen Ürünleri Saklamak İçin
let recentProducts = JSON.parse(localStorage.getItem("recentProducts")) || [];

function saveToLocalStorage() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("recentProducts", JSON.stringify(recentProducts));
}

function sortProducts() {
    products.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
}

function searchProducts() {
    const searchTerm = document.querySelector(".search-bar-input").value.toLowerCase();
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
    );

    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    filteredProducts.forEach((product, index) => {
        const li = document.createElement("li");
        li.textContent = `${product.name} - Kategori: ${product.category} - Stok: ${product.stock}`;
        li.onclick = () => showProductDetails(index);
        productList.appendChild(li);
    });
}

document.querySelector(".search-bar-button").addEventListener("click", searchProducts);
document.querySelector(".search-bar-input").addEventListener("keyup", searchProducts);

function updateProductList() {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    sortProducts();

    products.forEach((product, index) => {
        const li = document.createElement("li");
        li.textContent = `${product.name} - Kategori: ${product.category} - Stok: ${product.stock}`;
        li.onclick = () => showProductDetails(index);
        productList.appendChild(li);
    });
}

function updateCategoryOptions() {
    const categoryOptions = document.getElementById("categoryOptions");
    categoryOptions.innerHTML = "";

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryOptions.appendChild(option);
    });
}

function deleteCategory(index) {
    if (
        confirm(
            `"${categories[index]}" kategorisini silmek istediğinizden emin misiniz?`
        )
    ) {
        categories.splice(index, 1);
        products = products.filter(
            (product) =>
                product.category.toLowerCase() !== categories[index].toLowerCase()
        );
        saveToLocalStorage();
        updateCategoryOptions();
        updateProductList();
        updateWarehouseList();
    }
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="">Tüm Kategoriler</option>';

    categories.forEach((category, index) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Sil";
        deleteButton.onclick = () => deleteCategory(index);
        categoryFilter.appendChild(deleteButton);
    });
}

function addProduct() {
    const name = document.getElementById("newProductName").value.trim();
    let category = document.getElementById("newProductCategory").value.trim().toLowerCase();
    const stock = parseInt(document.getElementById("newProductStock").value);

    if (!isNaN(stock) && name && category) {
        const existingProduct = products.find(
            (product) => product.name.toLowerCase() === name.toLowerCase()
        );
        if (existingProduct) {
            existingProduct.stock += stock;
        } else {
            if (!categories.includes(category)) {
                categories.push(category);
                updateCategoryOptions();
                updateCategoryFilter();
            }
            products.push({ name, category, stock });
            recentProducts.unshift({ name, category, stock, date: new Date() });
            if (recentProducts.length > 10) {
                recentProducts.pop();
            }
        }

        saveToLocalStorage();
        updateProductList();
        updateWarehouseList();
        updateRecentProducts();

        document.getElementById("newProductName").value = "";
        document.getElementById("newProductCategory").value = "";
        document.getElementById("newProductStock").value = "";
    } else {
        alert("Lütfen tüm alanları doldurun.");
    }
}

function filterByCategory() {
    const selectedCategory = document.getElementById("categoryFilter").value.toLowerCase();
    const filteredProducts = selectedCategory
        ? products.filter(
            (product) => product.category.toLowerCase() === selectedCategory
        )
        : products;

    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    filteredProducts.forEach((product, index) => {
        const li = document.createElement("li");
        li.textContent = `${product.name} - Kategori: ${product.category} - Stok: ${product.stock}`;
        li.onclick = () => showProductDetails(index);
        productList.appendChild(li);
    });
}

function showProductDetails(index) {
    const product = products[index];
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "product-details";
    detailsDiv.innerHTML = `
        <h2>${product.name}</h2>
        <p>Kategori: ${product.category}</p>
        <p>Stok: <span id="productStock">${product.stock}</span></p>
        <button onclick="showStockModal(${index}, 'increase')">Stok Artır</button>
        <button onclick="showStockModal(${index}, 'decrease')">Stok Azalt</button>
        <button onclick="deleteProduct(${index})">Ürünü Sil</button>
        <button onclick="closeDetails()">Kapat</button>
    `;
    document.body.appendChild(detailsDiv);
}

function showStockModal(index, action) {
    const modal = document.createElement("div");
    modal.className = "product-details";
    modal.innerHTML = `
        <h2>Stok ${action === "increase" ? "Artır" : "Azalt"}</h2>
        <input type="number" id="stockAmount" placeholder="Miktar Girin">
        <button onclick="updateStock(${index}, '${action}')">Onayla</button>
        <button onclick="closeDetails()">İptal</button>
    `;
    document.body.appendChild(modal);
}

function updateStock(index, action) {
    const amount = parseInt(document.getElementById("stockAmount").value);
    if (!isNaN(amount)) {
        if (action === "increase") {
            products[index].stock += amount;
        } else if (action === "decrease") {
            products[index].stock = Math.max(0, products[index].stock - amount);
        }
        saveToLocalStorage();
        closeDetails();
        updateProductList();
        updateWarehouseList();
        updateRecentProducts();
    }
}

function closeDetails() {
    document
        .querySelectorAll(".product-details")
        .forEach((modal) => modal.remove());
}

function updateWarehouseList() {
    const warehouseList = document.getElementById("warehouseList");
    const sortOption = document.getElementById("warehouseSort").value;
    warehouseList.innerHTML = "";

    let inStockProducts = products.filter((product) => product.stock > 0);

    if (sortOption === "stock") {
        inStockProducts.sort((a, b) => b.stock - a.stock);
    } else {
        inStockProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    inStockProducts.forEach((product, index) => {
        const li = document.createElement("li");
        li.textContent = `${product.name} - Kategori: ${product.category} - Stok: ${product.stock}`;
        li.onclick = () => showProductDetails(index);
        warehouseList.appendChild(li);
    });
}

function deleteProduct(index) {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
        products.splice(index, 1);
        saveToLocalStorage();
        closeDetails();
        updateProductList();
        updateWarehouseList();
    }
}

function updateRecentProducts() {
    const recentList = document.getElementById("recentList");
    recentList.innerHTML = "";

    recentProducts.forEach((product, index) => {
        const li = document.createElement("li");
        li.textContent = `${product.name} - Kategori: ${product.category} - Stok: ${
            product.stock
        } - Eklendi: ${new Date(product.date).toLocaleString()}`;
        li.onclick = () => showProductDetails(index);
        recentList.appendChild(li);
    });
}

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

function resetData() {
    if (confirm("Tüm verileri silmek istediğinizden emin misiniz?")) {
        localStorage.clear();
        products = [];
        categories = [];
        recentProducts = [];
        updateCategoryOptions();
        updateCategoryFilter();
        updateProductList();
        updateWarehouseList();
        updateRecentProducts();
        alert("Tüm veriler başarıyla silindi.");
    }
}

// İlk başta ürün listesi gösterilecek
showSection("productListSection");

// Sayfa yüklenirken kategorileri ve ürünleri güncelle
updateCategoryOptions();
updateCategoryFilter();
updateProductList();
updateWarehouseList();
updateRecentProducts();