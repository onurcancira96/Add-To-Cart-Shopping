//? İşlem yapılacak DOM Elements seçiyorum. --------------------------------------------------------------
let openShopping = document.querySelector(".shopping");
let closeShopping = document.querySelector(".closeShopping");
let list = document.querySelector(".list");
let listCard = document.querySelector(".listCard");
let body = document.querySelector("body");
let total = document.querySelector(".total span");
let quantity = openShopping.querySelector(".quantity");
let sayac2 = 0;
let a = 0;
let postArray = [];
let allPostArray = [];
let objectNew = {};

//? Sepet Kısmını Aç/Kapa yapmak için class atıyorum -----------------------------------------------------
openShopping.addEventListener("click", () => {
  body.classList.toggle("active"); //class değiştirmek.
});
closeShopping.addEventListener("click", () => {
  body.classList.remove("active"); //class silme.
});
//? json dosyasındaki verileri import edeceğim array'i tanımlıyorum---------------------------------------
let products = [];
let listCards = [];
//? JSON Dosyasını fetch edip bir virtual DOM fonksiyonu oluşturdum ve ürünleri ekrana yazdırdım----------
fetch("./Json/product.json")
  .then((response) => response.json())
  .then((data) => {
    products = Object.entries(data.products[0]);
    products.forEach((value, key) => {
      let newDiv = document.createElement("div");
      newDiv.classList.add("item", "col-md-3", "col-12", "product-" + key);
      newDiv.innerHTML = `
            <img src="${value[1].img}">
            <div class="title">${value[0]}</div>
            <div class="price">${parseInt(value[1].price).toLocaleString(
              "tr-TR",
              { style: "currency", currency: "TRY" }
            )}</div>
            <button onclick="addToCard(${key}, this)">Sepete Ekle</button>`;
      list.appendChild(newDiv);
    });
  });
//? Yine sepet kısmındaki Componente JSON dosyasındaki verileri aktarıyorum.------------------------------
function addToCard(key, button) {
  button.innerHTML = "Sepete Eklendi";
  button.classList.add("added-cart");
  // Sepeti Açmak için
  button.onclick = () => {
    body.classList.add("active");
  };
  setTimeout(() => {
    button.innerHTML = "Sepetim";
  }, 1000);
  if (listCards[key] == null) {
    listCards[key] = JSON.parse(JSON.stringify(products[key]));
    listCards[key][1].quantity = 1;
    listCards[key][1].stock -= 1;
    listCards[key][1].indirim = false;
    listCards[key][1].price = parseInt(listCards[key][1].price);
  }
  reloadCard();
}
//? Yine sepet kısmındaki Componentdeki verileri yeniliyorum----------------------------------------------
function reloadCard() {
  // listCard.innerHTML = '';
  let count = 0;
  let totalPrice = 0;
  if (
    Object.keys(listCards).filter((key) => listCards[key] !== undefined)
      .length == 0
  ) {
    let newDiv = document.createElement("div");
    newDiv.classList.add("alert", "alert-secondary");
    newDiv.innerText = "Sepetinizde ürün bulunmamaktadır.";
    listCard.appendChild(newDiv);
    document.querySelector(".discountBtn").classList.add("d-none");
    document.querySelector(".complateBtn").classList.add("d-none");
  } else {
    let alert = listCard.querySelector(".alert-secondary");
    if (alert) {
      alert.remove();
    }
    document.querySelector(".discountBtn").classList.remove("d-none");
    document.querySelector(".complateBtn").classList.remove("d-none");
  }
  listCards.forEach((value, key) => {
    if (value[1] != null) {
      let continueItem = false;
      count = count + value[1].quantity;
      totalPrice = parseInt(totalPrice) + parseInt(value[1].price);
      const person = {
        indirim: value[1].indirim,
        name: value[0],
        price: value[1].price,
        quantity: value[1].quantity,
        img: value[1].img,
        size: value[1].size,
        description: value[1].description,
      };
      objectNew[key] = person;
      listCard.querySelectorAll("li").forEach((cartItem) => {
        if (cartItem.getAttribute("product") == key) {
          continueItem = true;
          cartItem.querySelector("." + value[0]).innerText = parseInt(
            value[1].price
          ).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
          cartItem.querySelector(".stock span").innerText = value[1].stock;
          cartItem.querySelector(".count").innerText = value[1].quantity;
        }
      });
      if (!continueItem) {
        let newItem = document.createElement("li");
        newItem.setAttribute("product", key);
        newItem.innerHTML = `
                    <div class="sizeCerceve"><img src="${value[1].img}"/>
                    <span class="size">${value[1].size}</span>
                    </div>
                    <div>${value[0]}</div>
                    <div class="${value[0]}">${parseInt(
          value[1].price
        ).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
                    <div class="stock">Stok: <span>${
                      value[1].stock
                    }</span></div>
                    <div>
                        <button onclick="changeQuantity(${key}, -1)">-</button>
                        <div class="count">${value[1].quantity}</div>
                        <button onclick="changeQuantity(${key}, 1)">+</button>
                    </div>`;
        listCard.appendChild(newItem);
      }
    }
  });
  //? Sepette olmayan ürünleri siliyoruz
  listCard.querySelectorAll("li").forEach((cartItem) => {
    let currentKey = cartItem.getAttribute("product");
    if (!listCards[currentKey]) {
      //listcard içerisinde currentkey yoksa
      let cartBtn = list.querySelector(`.product-${currentKey} button`);
      if (cartBtn) {
        cartBtn.innerText = "Sepete Ekle";
        cartBtn.classList.remove("added-cart");
        cartBtn.onclick = () => {
          addToCard(currentKey, cartBtn);
        };
      }
      cartItem.remove();
    }
  });
  total.innerText = `${parseInt(totalPrice).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  })}`;
  quantity.innerText = count;
  objectNew["total"] = totalPrice;

  document.getElementById("postArrayInput").value = JSON.stringify(objectNew);
  console.log(document.getElementById("postArrayInput").value);
}
reloadCard();
//? Mantıksal işlemler ile Stok kontrolü yaptırıyorum Stoktan fazlasını sipariş edemez.--------------------------
function changeQuantity(key, add = 1) {
  if (add == -1 && listCards[key][1].quantity == 1) {
    delete listCards[key];
  } else if (
    (add == 1 && listCards[key][1].stock != 0) ||
    (add == -1 && listCards[key][1].stock >= 0)
  ) {
    listCards[key][1].quantity += add;
    listCards[key][1].price =
      listCards[key][1].quantity * products[key][1].price;
    listCards[key][1].stock += -add;
    listCards[key][1].indirim = false;
  }
  reloadCard();
}
//? Sepete atılan ürünlere "%20 İndirim" uyguluyorum.-----------------------------------------------------------
function addToDiscount() {
  listCards.forEach((element) => {
    if (element) {
      if (element[1].indirim == false) {
        element[1].price = element[1].price * 0.8;
        element[1].indirim = true;
      }
    }
  });
  reloadCard();
}
