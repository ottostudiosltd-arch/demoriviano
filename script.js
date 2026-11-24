(function () {
  'use strict';

  var menuButton = document.getElementById('menu-button');
  var nav = document.getElementById('nav');
  var header = document.getElementById('site-header');
  var bar = document.querySelector('.progress i');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     1. Mobile Menu Drawer
  ------------------------------------------------------------- */
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(open));
    }
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
      }
    });
  }

  /* -------------------------------------------------------------
     2. Scroll Reveal Animations
  ------------------------------------------------------------- */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      revealItems.forEach(function (el) { el.classList.add('in'); });
    }, 3500);
  } else {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  }

  /* -------------------------------------------------------------
     3. Header State, Progress Bar, Parallax & Active Navigation
  ------------------------------------------------------------- */
  var frame = document.querySelector('.visual-frame img');
  var navLinks = document.querySelectorAll('.navigation a:not(.contact-link)');
  var bottomNavLinks = document.querySelectorAll('.bottom-nav-item[data-nav]');
  var sections = document.querySelectorAll('main section[id]');
  var ticking = false;

  function updateScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle('scrolled', y > 30);
    }
    if (bar) {
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    if (frame && !reduce && y < 900) {
      frame.style.transform = 'translateY(' + (y * 0.05).toFixed(1) + 'px) scale(1.06)';
    }

    /* Scrollspy: Highlight active nav link and mobile bottom tab */
    var scrollPos = y + 160;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
        bottomNavLinks.forEach(function (item) {
          item.classList.toggle('active', item.getAttribute('data-nav') === id);
        });
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  /* -------------------------------------------------------------
     4. Infinite Photo Ribbon Loop
  ------------------------------------------------------------- */
  var track = document.querySelector('.ribbon-track');
  if (track && !reduce) {
    var clones = Array.prototype.map.call(track.children, function (n) {
      var c = n.cloneNode(true);
      c.alt = '';
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
    clones.forEach(function (c) { track.appendChild(c); });
    track.classList.add('run');
  }

  /* -------------------------------------------------------------
     5. Category Filter Tabs
  ------------------------------------------------------------- */
  var filterTabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.collection-card');

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      filterTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      cards.forEach(function (card) {
        var cardCategory = card.getAttribute('data-category');
        if (filter === 'all' || cardCategory === filter) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  /* -------------------------------------------------------------
     6. Header Integrated Search Bar (Crochie Tales Feature)
  ------------------------------------------------------------- */
  var searchInput = document.getElementById('search-input');
  var searchClearBtn = document.getElementById('search-clear-btn');
  var searchForm = document.getElementById('search-form');

  function filterBySearch(query) {
    var cleanQuery = query.toLowerCase().trim();
    if (searchClearBtn) {
      searchClearBtn.style.display = cleanQuery ? 'block' : 'none';
    }

    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var category = (card.getAttribute('data-category-name') || '').toLowerCase();
      var desc = (card.getAttribute('data-desc') || '').toLowerCase();

      if (!cleanQuery || title.indexOf(cleanQuery) !== -1 || category.indexOf(cleanQuery) !== -1 || desc.indexOf(cleanQuery) !== -1) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      filterBySearch(e.target.value);
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
        filterBySearch('');
        searchInput.focus();
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var collectionsSec = document.getElementById('collections');
      if (collectionsSec) {
        collectionsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* -------------------------------------------------------------
     7. Slide-Over Cart Drawer & Free Shipping Tracker
  ------------------------------------------------------------- */
  var cart = [];
  var freeShippingThreshold = 999;

  var cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  var cartDrawerTrigger = document.getElementById('cart-drawer-trigger');
  var bottomNavCartBtn = document.getElementById('bottom-nav-cart-btn');
  var cartDrawerClose = document.getElementById('cart-drawer-close');
  var cartItemsContainer = document.getElementById('cart-items-container');
  var cartEmptyView = document.getElementById('cart-empty-view');
  var cartDrawerFooter = document.getElementById('cart-drawer-footer');
  var cartSubtotalAmount = document.getElementById('cart-subtotal-amount');
  var shippingProgressFill = document.getElementById('shipping-progress-fill');
  var shippingPromptText = document.getElementById('shipping-prompt-text');
  var headerCartCount = document.getElementById('header-cart-count');
  var bottomCartCount = document.getElementById('bottom-cart-count');
  var cartDrawerBadge = document.getElementById('cart-drawer-badge');
  var cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  var cartEmptyExploreBtn = document.getElementById('cart-empty-explore-btn');

  function openCartDrawer() {
    if (!cartDrawerOverlay) return;
    renderCart();
    cartDrawerOverlay.classList.add('active');
    cartDrawerOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  }

  function closeCartDrawer() {
    if (!cartDrawerOverlay) return;
    cartDrawerOverlay.classList.remove('active');
    cartDrawerOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  }

  function updateCartCounters() {
    var totalCount = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    if (headerCartCount) headerCartCount.textContent = String(totalCount);
    if (bottomCartCount) bottomCartCount.textContent = String(totalCount);
    if (cartDrawerBadge) cartDrawerBadge.textContent = String(totalCount);
  }

  function renderCart() {
    updateCartCounters();

    var subtotal = cart.reduce(function (sum, item) {
      return sum + (item.price * item.quantity);
    }, 0);

    /* Free shipping calculation */
    var isFreeShipping = subtotal >= freeShippingThreshold;
    var remaining = Math.max(0, freeShippingThreshold - subtotal);

    if (shippingProgressFill) {
      var pct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
      shippingProgressFill.style.width = pct + '%';
    }

    if (shippingPromptText) {
      if (isFreeShipping) {
        shippingPromptText.innerHTML = '🎉 Congratulations! You unlocked <strong>Free Shipping</strong>!';
      } else {
        shippingPromptText.innerHTML = 'Add <strong>₹' + remaining + '</strong> more for <strong>Free Shipping!</strong>';
      }
    }

    if (cartSubtotalAmount) {
      cartSubtotalAmount.textContent = '₹' + subtotal.toLocaleString('en-IN');
    }

    if (cart.length === 0) {
      if (cartEmptyView) cartEmptyView.style.display = 'block';
      if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';

      /* Clear any dynamic item rows */
      var existingRows = cartItemsContainer.querySelectorAll('.cart-item-row');
      existingRows.forEach(function (row) { row.remove(); });
      return;
    }

    if (cartEmptyView) cartEmptyView.style.display = 'none';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'block';

    /* Rebuild list */
    var existingRows = cartItemsContainer.querySelectorAll('.cart-item-row');
    existingRows.forEach(function (row) { row.remove(); });

    cart.forEach(function (item, idx) {
      var row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML =
        '<img src="' + item.image + '" alt="' + item.title + '" class="cart-item-img">' +
        '<div class="cart-item-info">' +
          '<div>' +
            '<h4>' + item.title + '</h4>' +
            '<p>' + item.category + '</p>' +
          '</div>' +
          '<div class="cart-item-bottom">' +
            '<span class="cart-item-price">₹' + (item.price * item.quantity).toLocaleString('en-IN') + '</span>' +
            '<div class="cart-qty-ctrls">' +
              '<button type="button" class="qty-btn" data-action="dec" data-index="' + idx + '" aria-label="Decrease quantity">−</button>' +
              '<span class="qty-val">' + item.quantity + '</span>' +
              '<button type="button" class="qty-btn" data-action="inc" data-index="' + idx + '" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="cart-item-delete" data-action="del" data-index="' + idx + '" aria-label="Remove item">✕</button>' +
          '</div>' +
        '</div>';
      cartItemsContainer.appendChild(row);
    });
  }

  function addToCart(product) {
    var existingIndex = cart.findIndex(function (item) { return item.id === product.id; });
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    openCartDrawer();
  }

  /* Listeners for Cart Controls */
  if (cartDrawerTrigger) cartDrawerTrigger.addEventListener('click', openCartDrawer);
  if (bottomNavCartBtn) bottomNavCartBtn.addEventListener('click', openCartDrawer);
  if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', function (e) {
      if (e.target === cartDrawerOverlay) closeCartDrawer();
    });
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var index = parseInt(btn.getAttribute('data-index'), 10);

      if (action === 'inc') {
        cart[index].quantity += 1;
      } else if (action === 'dec') {
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }
      } else if (action === 'del') {
        cart.splice(index, 1);
      }
      renderCart();
    });
  }

  if (cartEmptyExploreBtn) {
    cartEmptyExploreBtn.addEventListener('click', function () {
      closeCartDrawer();
      var collections = document.getElementById('collections');
      if (collections) collections.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* Checkout via Custom Inquiry */
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', function () {
      closeCartDrawer();
      var customSection = document.getElementById('custom');
      if (customSection) customSection.scrollIntoView({ behavior: 'smooth' });

      var detailsField = document.getElementById('custom-details');
      if (detailsField && cart.length > 0) {
        var itemsSummary = cart.map(function (item) {
          return item.quantity + 'x ' + item.title + ' (₹' + (item.price * item.quantity) + ')';
        }).join(', ');
        detailsField.value = 'Inquiry for shopping bag items: ' + itemsSummary + '.\n';
      }
    });
  }

  /* "+ Add to Bag" Buttons on cards */
  document.addEventListener('click', function (e) {
    var addBtn = e.target.closest('.add-to-cart-btn[data-add-id]');
    if (!addBtn) return;
    e.stopPropagation();

    var card = addBtn.closest('.collection-card');
    if (!card) return;

    var product = {
      id: card.getAttribute('data-id') || 'item-' + Date.now(),
      title: card.getAttribute('data-title') || 'Artisan 3D Piece',
      category: card.getAttribute('data-category-name') || 'Custom Design',
      price: parseInt(card.getAttribute('data-numeric-price'), 10) || 499,
      image: card.getAttribute('data-image') || 'assets/couple-figurines.jpg'
    };
    addToCart(product);
  });

  /* -------------------------------------------------------------
     8. Product Quick-View Lightbox Modal
  ------------------------------------------------------------- */
  var productModal = document.getElementById('product-modal');
  var modalCloseBtn = document.getElementById('modal-close');
  var modalImage = document.getElementById('modal-image');
  var modalTitle = document.getElementById('modal-title');
  var modalCategory = document.getElementById('modal-category');
  var modalPrice = document.getElementById('modal-price');
  var modalTime = document.getElementById('modal-time');
  var modalDesc = document.getElementById('modal-desc');
  var modalMaterials = document.getElementById('modal-materials');
  var modalDimensions = document.getElementById('modal-dimensions');
  var modalOrderBtn = document.getElementById('modal-order-btn');
  var modalAddBagBtn = document.getElementById('modal-add-bag-btn');

  var currentActiveModalProduct = null;

  function openProductModal(card) {
    if (!productModal) return;

    currentActiveModalProduct = {
      id: card.getAttribute('data-id') || 'prod-' + Date.now(),
      title: card.getAttribute('data-title') || '',
      category: card.getAttribute('data-category-name') || '',
      price: parseInt(card.getAttribute('data-numeric-price'), 10) || 899,
      priceLabel: card.getAttribute('data-price') || '',
      time: card.getAttribute('data-time') || '',
      image: card.getAttribute('data-image') || '',
      desc: card.getAttribute('data-desc') || '',
      materials: card.getAttribute('data-materials') || '',
      dimensions: card.getAttribute('data-dimensions') || '',
      catSlug: card.getAttribute('data-category') || ''
    };

    if (modalTitle) modalTitle.textContent = currentActiveModalProduct.title;
    if (modalCategory) modalCategory.textContent = currentActiveModalProduct.category;
    if (modalPrice) modalPrice.textContent = currentActiveModalProduct.priceLabel;
    if (modalTime) modalTime.textContent = currentActiveModalProduct.time;
    if (modalImage) {
      modalImage.src = currentActiveModalProduct.image;
      modalImage.alt = currentActiveModalProduct.title;
    }
    if (modalDesc) modalDesc.textContent = currentActiveModalProduct.desc;
    if (modalMaterials) modalMaterials.textContent = currentActiveModalProduct.materials;
    if (modalDimensions) modalDimensions.textContent = currentActiveModalProduct.dimensions;

    productModal.classList.add('active');
    productModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.classList.remove('active');
    productModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      /* If clicked "+ Add to Bag", ignore card click */
      if (e.target.closest('.add-to-cart-btn')) return;
      openProductModal(card);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
  if (productModal) {
    productModal.addEventListener('click', function (e) {
      if (e.target === productModal) closeProductModal();
    });
  }

  if (modalAddBagBtn) {
    modalAddBagBtn.addEventListener('click', function () {
      if (currentActiveModalProduct) {
        closeProductModal();
        addToCart(currentActiveModalProduct);
      }
    });
  }

  if (modalOrderBtn) {
    modalOrderBtn.addEventListener('click', function () {
      closeProductModal();
      var customSec = document.getElementById('custom');
      if (customSec) customSec.scrollIntoView({ behavior: 'smooth' });

      var categorySelect = document.getElementById('item-category');
      if (categorySelect && currentActiveModalProduct) {
        var slug = currentActiveModalProduct.catSlug;
        if (slug === 'frames') categorySelect.value = 'frame';
        else if (slug === 'figurines') categorySelect.value = 'figurine';
        else if (slug === 'festive') categorySelect.value = 'candle';
        else if (slug === 'keychains') categorySelect.value = 'keychain';
      }

      var detailsField = document.getElementById('custom-details');
      if (detailsField && currentActiveModalProduct && !detailsField.value) {
        detailsField.value = 'Interested in custom version of: ' + currentActiveModalProduct.title + '.\n';
      }
    });
  }

  /* -------------------------------------------------------------
     9. Reference File Upload Preview & Form Submission
  ------------------------------------------------------------- */
  var fileInput = document.getElementById('reference-file');
  var dropzone = document.getElementById('dropzone');
  var previewWrap = document.getElementById('file-preview');
  var previewImg = document.getElementById('preview-img');
  var previewName = document.getElementById('preview-name');
  var removeFileBtn = document.getElementById('remove-file-btn');
  var dropzoneContent = document.querySelector('.dropzone-content');

  function handleFile(file) {
    if (!file || !file.type.match('image.*')) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      if (previewImg) previewImg.src = e.target.result;
      if (previewName) previewName.textContent = file.name;
      if (previewWrap) previewWrap.style.display = 'flex';
      if (dropzoneContent) dropzoneContent.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });
  }

  if (dropzone) {
    ['dragenter', 'dragover'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (fileInput) fileInput.value = '';
      if (previewImg) previewImg.src = '';
      if (previewWrap) previewWrap.style.display = 'none';
      if (dropzoneContent) dropzoneContent.style.display = 'block';
    });
  }

  /* Form submission celebration */
  var customForm = document.getElementById('custom-inquiry-form');
  var successModal = document.getElementById('success-modal');
  var successModalClose = document.getElementById('success-modal-close');
  var successDoneBtn = document.getElementById('success-done-btn');

  function closeSuccessModal() {
    if (!successModal) return;
    successModal.classList.remove('active');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (customForm) {
    customForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('client-name');
      var contactInput = document.getElementById('client-contact');
      var categoryInput = document.getElementById('item-category');

      if (!nameInput.value.trim() || !contactInput.value.trim() || !categoryInput.value) {
        alert('Please fill in your name, contact details, and desired category.');
        return;
      }

      if (successModal) {
        successModal.classList.add('active');
        successModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      customForm.reset();
      if (previewWrap) previewWrap.style.display = 'none';
      if (dropzoneContent) dropzoneContent.style.display = 'block';
    });
  }

  if (successModalClose) successModalClose.addEventListener('click', closeSuccessModal);
  if (successDoneBtn) successDoneBtn.addEventListener('click', closeSuccessModal);
  if (successModal) {
    successModal.addEventListener('click', function (e) {
      if (e.target === successModal) closeSuccessModal();
    });
  }

  /* -------------------------------------------------------------
     10. WhatsApp Floating UI Widget
     (Visual UI display only - does not trigger phone calls or external apps)
  ------------------------------------------------------------- */
  var waWidget = document.getElementById('whatsapp-widget');
  if (waWidget) {
    waWidget.addEventListener('click', function () {
      var customSection = document.getElementById('custom');
      if (customSection) customSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------------------
     11. Global Keyboard Listeners (Escape key)
  ------------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      closeSuccessModal();
      setMenu(false);
    }
  });

})();
