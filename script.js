(function () {
  'use strict';

  var menuButton = document.querySelector('.menu-button');
  var nav = document.querySelector('.navigation');
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress i');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     1. Mobile Menu with Scroll Lock
  ------------------------------------------------------------- */
  function setMenu(open) {
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

    /* Safety fallback: ensure content is revealed even on slow observers */
    setTimeout(function () {
      revealItems.forEach(function (el) { el.classList.add('in'); });
    }, 3500);
  } else {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  }

  /* -------------------------------------------------------------
     3. Header State, Progress Bar, Parallax & Scrollspy
  ------------------------------------------------------------- */
  var frame = document.querySelector('.visual-frame img');
  var navLinks = document.querySelectorAll('.navigation a:not(.contact-link)');
  var sections = document.querySelectorAll('main section[id]');
  var ticking = false;

  function updateScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle('scrolled', y > 40);
    }
    if (bar) {
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    if (frame && !reduce && y < 900) {
      frame.style.transform = 'translateY(' + (y * 0.06).toFixed(1) + 'px) scale(1.06)';
    }

    /* Scrollspy: Highlight active nav link */
    var scrollPos = y + 160;
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var height = sec.offsetHeight;
      var id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
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
     5. Collection Category Filter Tabs
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
     6. Product Quick-View Modal Lightbox
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
  var currentSelectedCardCategory = '';

  function openProductModal(card) {
    if (!productModal) return;

    var title = card.getAttribute('data-title') || '';
    var cat = card.getAttribute('data-category-name') || '';
    var price = card.getAttribute('data-price') || '';
    var time = card.getAttribute('data-time') || '';
    var img = card.getAttribute('data-image') || '';
    var desc = card.getAttribute('data-desc') || '';
    var materials = card.getAttribute('data-materials') || '';
    var dimensions = card.getAttribute('data-dimensions') || '';
    var catSlug = card.getAttribute('data-category') || '';

    currentSelectedCardCategory = catSlug;

    if (modalTitle) modalTitle.textContent = title;
    if (modalCategory) modalCategory.textContent = cat;
    if (modalPrice) modalPrice.textContent = price;
    if (modalTime) modalTime.textContent = time;
    if (modalImage) {
      modalImage.src = img;
      modalImage.alt = title;
    }
    if (modalDesc) modalDesc.textContent = desc;
    if (modalMaterials) modalMaterials.textContent = materials;
    if (modalDimensions) modalDimensions.textContent = dimensions;

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
      openProductModal(card);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProductModal);
  }

  if (productModal) {
    productModal.addEventListener('click', function (e) {
      if (e.target === productModal) {
        closeProductModal();
      }
    });
  }

  /* Pre-fill custom form when clicking 'Order This Custom Design' inside modal */
  if (modalOrderBtn) {
    modalOrderBtn.addEventListener('click', function () {
      closeProductModal();

      var customSec = document.getElementById('custom');
      if (customSec) {
        customSec.scrollIntoView({ behavior: 'smooth' });
      }

      var categorySelect = document.getElementById('item-category');
      if (categorySelect) {
        if (currentSelectedCardCategory === 'frames') categorySelect.value = 'frame';
        else if (currentSelectedCardCategory === 'figurines') categorySelect.value = 'figurine';
        else if (currentSelectedCardCategory === 'festive') categorySelect.value = 'candle';
        else if (currentSelectedCardCategory === 'keychains') categorySelect.value = 'keychain';
      }

      var detailsField = document.getElementById('custom-details');
      if (detailsField && modalTitle && !detailsField.value) {
        detailsField.value = 'Interested in custom version of: ' + modalTitle.textContent + '.\n';
      }
    });
  }

  /* -------------------------------------------------------------
     7. Custom Order Form & Live Reference File Preview
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
     8. WhatsApp Floating UI Widget
     (Visual UI only as requested - does not trigger phone calls or external apps)
  ------------------------------------------------------------- */
  var waWidget = document.getElementById('whatsapp-widget');
  if (waWidget) {
    waWidget.addEventListener('click', function () {
      /* Smoothly guide customer to the custom inquiry section */
      var customSection = document.getElementById('custom');
      if (customSection) {
        customSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* Global Escape Key listener for all open dialogs */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeProductModal();
      closeSuccessModal();
    }
  });

})();
