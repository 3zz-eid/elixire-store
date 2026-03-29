let cart = JSON.parse(localStorage.getItem('cart')) || [];

const INSTAPAY_LINK = 'https://ipn.eg/S/basmalla7706/instapay/6BWaOa';
const VODAFONE_CASH_LINK = 'http://vf.eg/vfcash?id=mt&qrId=RG6qK9';
const WHATSAPP_NUMBER = '201558877652';

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  initMobileMenu();
  initReviewsSlider();
  initContactForm();
  renderCart();
});

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const icon = document.querySelector('.theme-toggle .icon');

  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    if (icon) icon.innerText = '☀️';
  } else {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    if (icon) icon.innerText = '🌙';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark-mode');
  const icon = document.querySelector('.theme-toggle .icon');

  if (isDark) {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    if (icon) icon.innerText = '☀️';
  } else {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    if (icon) icon.innerText = '🌙';
  }
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
    });
  });
}

/* =========================
   PRODUCT CART
========================= */
function selectSize(element) {
  const card = element.closest('.product-card');
  if (!card) return;

  const items = card.querySelectorAll('.size-item');
  items.forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

function changeQty(button, change) {
  const box = button.closest('.quantity-box');
  if (!box) return;

  const valueEl = box.querySelector('.qty-value');
  let current = parseInt(valueEl.innerText, 10) || 1;

  current += change;
  if (current < 1) current = 1;

  valueEl.innerText = current;
}

function addToCart(button) {
  const card = button.closest('.product-card');
  if (!card) return;

  const productName =
    card.querySelector('.product-info h3')?.innerText?.trim() ||
    card.querySelector('h3')?.innerText?.trim() ||
    'Product';

  const selectedSize = card.querySelector('.size-item.active');

  if (!selectedSize) {
    alert('Please select a size first.');
    return;
  }

  const size = selectedSize.querySelector('span')?.innerText?.trim() || '';
  const priceText = selectedSize.querySelector('strong')?.innerText?.trim() || '0';
  const qty = parseInt(card.querySelector('.qty-value')?.innerText?.trim() || '1', 10);
  const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

  const existingIndex = cart.findIndex(item => {
    return item.productName === productName && item.size === size;
  });

  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      productName,
      size,
      price,
      qty
    });
  }

  saveCart();
  renderCart();

  card.querySelector('.qty-value').innerText = '1';
  alert('Added to cart ✅');
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;

  overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
}

function closeCartOutside(event) {
  const overlay = document.getElementById('cartOverlay');
  if (event.target === overlay) {
    overlay.style.display = 'none';
  }
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cartCount) {
    cartCount.innerText = totalCount;
  }

  if (cartTotal) {
    cartTotal.innerText = `Total: ${totalPrice} EGP`;
  }

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="subtle">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => {
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.productName}</strong><br>
          <small>${item.size} - ${item.price} EGP</small>
        </div>

        <div class="cart-item-actions">
          <button class="qty-btn" type="button" onclick="updateCartQty(${index}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" type="button" onclick="updateCartQty(${index}, 1)">+</button>
          <button class="remove-btn" type="button" onclick="removeCartItem(${index})">x</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateCartQty(index, change) {
  if (!cart[index]) return;

  cart[index].qty += change;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function selectCheckoutPayment(element) {
  const items = document.querySelectorAll('#checkoutPaymentOptions .payment-item');
  items.forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

function submitCartOrder() {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  const name = document.getElementById('checkoutName')?.value.trim() || '';
  const email = document.getElementById('checkoutEmail')?.value.trim() || '';
  const phone = document.getElementById('checkoutPhone')?.value.trim() || '';
  const address = document.getElementById('checkoutAddress')?.value.trim() || '';
  const city = document.getElementById('checkoutCity')?.value.trim() || '';
  const notes = document.getElementById('checkoutNotes')?.value.trim() || '';

  const selectedPayment = document.querySelector('#checkoutPaymentOptions .payment-item.active');

  if (!selectedPayment) {
    alert('Please select a payment method.');
    return;
  }

  const missingFields = [];
  if (!name) missingFields.push('Name');
  if (!phone) missingFields.push('Phone');
  if (!address) missingFields.push('Address');
  if (!city) missingFields.push('Governorate');

  if (missingFields.length > 0) {
    alert('Please fill: ' + missingFields.join(', '));
    return;
  }

  const paymentMethod =
    selectedPayment.dataset.payment ||
    selectedPayment.innerText.replace(/\s+/g, ' ').trim();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const orderLines = cart.map((item, index) => {
    return `${index + 1}) ${item.productName}
- Size: ${item.size}
- Quantity: ${item.qty}
- Price: ${item.price} EGP
- Subtotal: ${item.price * item.qty} EGP`;
  }).join('\n\n');

  let paymentSection = '';

  if (paymentMethod === 'InstaPay') {
    paymentSection = `Selected Payment Method: InstaPay

InstaPay Payment Link:
${INSTAPAY_LINK}

Please complete the payment, then send confirmation in this chat.`;
  } else if (paymentMethod === 'Vodafone Cash') {
    paymentSection = `Selected Payment Method: Vodafone Cash

Vodafone Cash Payment Link:
${VODAFONE_CASH_LINK}

Please complete the payment, then send confirmation in this chat.`;
  } else {
    paymentSection = `Selected Payment Method: Cash on Delivery

Payment will be collected upon delivery.`;
  }

  const message = `New Order ✅

Customer Information:
Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Address: ${address}
Governorate: ${city}
Notes: ${notes || 'No notes'}

Order Details:
${orderLines}

Total: ${totalPrice} EGP

${paymentSection}`;

  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');

  cart = [];
  saveCart();
  renderCart();

  document.getElementById('checkoutName').value = '';
  document.getElementById('checkoutEmail').value = '';
  document.getElementById('checkoutPhone').value = '';
  document.getElementById('checkoutAddress').value = '';
  document.getElementById('checkoutCity').value = '';
  document.getElementById('checkoutNotes').value = '';

  document.querySelectorAll('#checkoutPaymentOptions .payment-item').forEach(item => {
    item.classList.remove('active');
  });

  document.getElementById('cartOverlay').style.display = 'none';
}

/* =========================
   CONTACT FORM
========================= */
function initContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Please set up your contact page form separately if needed.');
  });
}

/* =========================
   REVIEWS SLIDER
========================= */
function initReviewsSlider() {
  const slider = document.getElementById('reviewsSlider');
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsWrap = document.getElementById('reviewsDots');

  if (!slider || !track || !prevBtn || !nextBtn || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  if (!cards.length) return;

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  let maxIndex = Math.max(0, cards.length - cardsPerView);

  function getCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function getCardStep() {
    const firstCard = cards[0];
    if (!firstCard) return 0;

    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 24);
    return firstCard.offsetWidth + gap;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    cardsPerView = getCardsPerView();
    maxIndex = Math.max(0, cards.length - cardsPerView);
    const pages = maxIndex + 1;

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (i === currentIndex ? ' active' : '');
      dot.addEventListener('click', function () {
        currentIndex = i;
        updateSlider();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function updateSlider() {
    cardsPerView = getCardsPerView();
    maxIndex = Math.max(0, cards.length - cardsPerView);

    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const moveX = getCardStep() * currentIndex;
    track.style.transform = `translateX(-${moveX}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', function () {
    currentIndex--;
    if (currentIndex < 0) currentIndex = maxIndex;
    updateSlider();
  });

  nextBtn.addEventListener('click', function () {
    currentIndex++;
    if (currentIndex > maxIndex) currentIndex = 0;
    updateSlider();
  });

  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener('touchend', function (e) {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > 50) {
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    } else if (diff < -50) {
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    }

    updateSlider();
    isDragging = false;
  });

  window.addEventListener('resize', function () {
    buildDots();
    updateSlider();
  });

  buildDots();
  updateSlider();
}

window.addEventListener('load', function () {
  document.documentElement.classList.add('theme-ready');
});